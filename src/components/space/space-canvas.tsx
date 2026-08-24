"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SpaceItem } from "~/schema";
import { cn } from "~/lib/utils";
import FullscreenBody from "./fullscreen-body";

/**
 * Space — hidden private infinite canvas. Excalidraw interaction model:
 *
 * - DRAG anything to move it (text included — text is a real object)
 * - DOUBLE-CLICK text/heading to edit; click-away or Esc to finish
 * - Single click selects; toolbar shows size/color for the selection
 * - Arrow tool: drag to draw · Paste image/URL/text anywhere
 * - Pan: drag empty canvas (or space+drag) · Zoom: ctrl/cmd + wheel
 */

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const COLORS = ["default", "yellow", "blue", "pink", "green"] as const;
type Tool = "pan" | "text" | "heading" | "arrow" | "image";

type Camera = { x: number; y: number; zoom: number };

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function SpaceCanvas() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [items, setItems] = useState<SpaceItem[]>([]);
  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<Tool>("pan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [toast, setToast] = useState("");
  const [showPalette, setShowPalette] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const camRef = useRef(cam);
  camRef.current = cam;
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const editingIdRef = useRef(editingId);
  editingIdRef.current = editingId;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasteOffset = useRef(0);

  // ---------- auth ----------
  useEffect(() => {
    fetch("/api/space/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  const login = async () => {
    setAuthError("");
    const res = await fetch("/api/space/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) setAuthed(true);
    else setAuthError((await res.json().catch(() => ({}))).error ?? "Login failed");
  };

  // ---------- load ----------
  useEffect(() => {
    if (!authed) return;
    fetch("/api/space/doc")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => showToast("Couldn't load your space"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  // ---------- autosave ----------
  const save = useCallback((nextItems: SpaceItem[]) => {
    setSaving("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/space/doc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: nextItems }),
        });
        if (!res.ok) throw new Error();
        setSaving("saved");
        setTimeout(() => setSaving((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setSaving("error");
      }
    }, 800);
  }, []);

  const updateItems = useCallback(
    (updater: (prev: SpaceItem[]) => SpaceItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save],
  );

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const c = camRef.current;
    return { x: (sx - rect.left - c.x) / c.zoom, y: (sy - rect.top - c.y) / c.zoom };
  }, []);

  const patchItem = useCallback(
    (id: string, patch: Partial<SpaceItem>) => {
      updateItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    [updateItems],
  );

  // ---------- unified pointer handling on the viewport ----------
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !authed) return;

    type Gesture =
      | { kind: "pan"; startX: number; startY: number; camX: number; camY: number }
      | { kind: "draw-arrow"; id: string }
      | {
          kind: "move";
          id: string;
          dx: number;
          dy: number;
          url?: string; // set when press began on a link card
          pressX: number;
          pressY: number;
        }
      | null;

    let gesture: Gesture = null;
    let downOnEmpty = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-ui]")) return; // toolbar clicks

      const cardEl = target.closest("[data-card]") as HTMLElement | null;

      // arrow tool: start drawing on empty canvas
      if (toolRef.current === "arrow" && !cardEl) {
        const w = screenToWorld(e.clientX, e.clientY);
        const arrow: SpaceItem = {
          id: uid(),
          type: "arrow",
          x: w.x,
          y: w.y,
          x2: w.x,
          y2: w.y,
          rotation: 0,
          color: "default",
          stroke: 2,
          createdAt: Date.now(),
        };
        setItems((prev) => [...prev, arrow]);
        setSelectedId(null);
        gesture = { kind: "draw-arrow", id: arrow.id };
        el.setPointerCapture(e.pointerId);
        return;
      }

      // text/heading tool: place a new item where clicked
      if ((toolRef.current === "text" || toolRef.current === "heading") && !cardEl) {
        const w = screenToWorld(e.clientX, e.clientY);
        const isH = toolRef.current === "heading";
        const item: SpaceItem = {
          id: uid(),
          type: isH ? "heading" : "text",
          text: "",
          x: Math.round(w.x),
          y: Math.round(w.y - (isH ? 20 : 12)),
          fontSize: isH ? 32 : 16,
          rotation: 0,
          color: "default",
          createdAt: Date.now(),
        };
        setItems((prev) => [...prev, item]);
        setSelectedId(item.id);
        setEditingId(item.id); // drop straight into edit mode
        setTool("pan");
        return;
      }

      if (e.button === 1 || !cardEl) {
        // middle mouse anywhere, or left on empty canvas → pan
        gesture = {
          kind: "pan",
          startX: e.clientX,
          startY: e.clientY,
          camX: camRef.current.x,
          camY: camRef.current.y,
        };
        downOnEmpty = !cardEl;
        el.classList.add("panning");
        el.setPointerCapture(e.pointerId);
        return;
      }

      // left press on a card → move it (Excalidraw style)
      const id = cardEl.dataset.cardId!;
      const item = itemsRef.current.find((it) => it.id === id);
      if (!item) return;

      if (editingIdRef.current === id) return; // don't drag while typing
      setSelectedId(id);

      const w = screenToWorld(e.clientX, e.clientY);
      gesture = {
        kind: "move",
        id,
        dx: w.x - item.x,
        dy: w.y - item.y,
        url: item.type === "link" ? item.url : undefined,
        pressX: e.clientX,
        pressY: e.clientY,
      };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!gesture) return;

      if (gesture.kind === "pan") {
        const g = gesture;
        setCam((c) => ({
          ...c,
          x: g.camX + (e.clientX - g.startX),
          y: g.camY + (e.clientY - g.startY),
        }));
        return;
      }

      const w = screenToWorld(e.clientX, e.clientY);

      if (gesture.kind === "draw-arrow") {
        const id = gesture.id;
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, x2: Math.round(w.x), y2: Math.round(w.y) } : it)),
        );
        return;
      }

      if (gesture.kind === "move") {
        const nx = Math.round(w.x - gesture.dx);
        const ny = Math.round(w.y - gesture.dy);
        const id = gesture.id;
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, x: nx, y: ny } : it)),
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      // click (no drag) on a link card → open its destination.
      // pointer capture eats the native click, so we handle it here.
      if (
        gesture?.kind === "move" &&
        gesture.url &&
        Math.hypot(e.clientX - gesture.pressX, e.clientY - gesture.pressY) < 5
      ) {
        window.open(gesture.url, "_blank", "noopener,noreferrer");
      }

      if (gesture?.kind === "pan" && downOnEmpty) {
        setSelectedId(null); // plain click on empty space deselects
      }
      // discard zero-length arrows (accidental click with arrow tool)
      if (gesture?.kind === "draw-arrow") {
        const arrowId = gesture.id;
        setItems((prev) => {
          const next = prev.filter(
            (it) =>
              !(
                it.type === "arrow" &&
                it.id === arrowId &&
                Math.abs((it.x2 ?? it.x) - it.x) < 4 &&
                Math.abs((it.y2 ?? it.y) - it.y) < 4
              ),
          );
          return next;
        });
        setTool("pan");
      }
      gesture = null;
      downOnEmpty = false;
      el.classList.remove("panning");
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const before = camRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, before.zoom * factor));
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setCam({
        zoom,
        x: mx - ((mx - before.x) * zoom) / before.zoom,
        y: my - ((my - before.y) * zoom) / before.zoom,
      });
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, screenToWorld]);

  // keep itemsRef in sync for gesture code
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // ---------- double-click to edit text ----------
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !authed) return;
    const onDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cardEl = target.closest("[data-card]") as HTMLElement | null;
      if (!cardEl) {
        // double-click empty canvas → new text right there (excalidraw-ish)
        const w = screenToWorld(e.clientX, e.clientY);
        const item: SpaceItem = {
          id: uid(),
          type: "text",
          text: "",
          x: Math.round(w.x),
          y: Math.round(w.y - 12),
          fontSize: 16,
          rotation: 0,
          color: "default",
          createdAt: Date.now(),
        };
        setItems((prev) => [...prev, item]);
        setSelectedId(item.id);
        setEditingId(item.id);
        return;
      }
      const id = cardEl.dataset.cardId!;
      const item = itemsRef.current.find((it) => it.id === id);
      if (item && (item.type === "text" || item.type === "heading")) {
        setSelectedId(id);
        setEditingId(id);
      } else if (item?.type === "link" && item.url) {
        window.open(item.url, "_blank", "noopener");
      }
    };
    el.addEventListener("dblclick", onDoubleClick);
    return () => el.removeEventListener("dblclick", onDoubleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, screenToWorld]);

  const commitEdit = useCallback(
    (id: string, value: string) => {
      patchItem(id, { text: value });
      if (!value.trim()) {
        // empty text = remove the stray element entirely
        setItems((prev) => prev.filter((it) => it.id !== id));
        setSelectedId(null);
        setEditingId(null);
      }
    },
    [patchItem],
  );

  const deleteCard = (id: string) => {
    setEditingId((cur) => (cur === id ? null : cur));
    updateItems((prev) => prev.filter((it) => it.id !== id));
    setSelectedId(null);
  };

  // ---------- paste ----------
  useEffect(() => {
    if (!authed) return;
    const onPaste = async (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLInputElement ||
        (active as HTMLElement)?.isContentEditable
      )
        return;

      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      const at = screenToWorld(
        rect.width / 2 + pasteOffset.current,
        rect.height / 2 + pasteOffset.current,
      );
      pasteOffset.current = (pasteOffset.current + 40) % 200;

      const imgFile = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (imgFile) {
        const file = imgFile.getAsFile();
        if (!file) return;
        showToast("Uploading…");
        const form = new FormData();
        form.append("file", file);
        try {
          const res = await fetch("/api/space/asset", { method: "POST", body: form });
          const d = await res.json();
          if (!res.ok) throw new Error(d.error);
          addCard({ type: "image", src: d.url, x: at.x - 140, y: at.y - 100, width: 320 });
          showToast("Image added ✓");
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Upload failed");
        }
        return;
      }

      const text = e.clipboardData?.getData("text")?.trim() ?? "";
      if (/^https?:\/\/\S+$/.test(text)) {
        showToast("Fetching link…");
        const tempId = uid();
        addCard({
          id: tempId,
          type: "link",
          url: text,
          title: text.replace(/^https?:\/\//, "").slice(0, 80),
          x: at.x - 130,
          y: at.y - 60,
          width: 280,
        });
        try {
          const res = await fetch(`/api/space/link-meta?url=${encodeURIComponent(text)}`);
          const meta = await res.json();
          patchItem(tempId, {
            kind: meta.kind ?? "web",
            title: meta.title ?? undefined,
            description: meta.description ?? undefined,
            image: meta.image ?? undefined,
          });
          showToast(meta.kind === "youtube" ? "YouTube video ✓" : meta.kind === "x" ? "Post ✓" : "Link enriched ✓");
        } catch {
          showToast("Link added");
        }
        return;
      }

      if (text) {
        addCard({ type: "text", text, x: at.x - 120, y: at.y - 12, fontSize: 16 });
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const addCard = (
    partial: Partial<SpaceItem> & { type: SpaceItem["type"]; x: number; y: number },
  ) => {
    const item: SpaceItem = {
      id: uid(),
      rotation: 0,
      color: "default",
      createdAt: Date.now(),
      ...partial,
    } as SpaceItem;
    setItems((prev) => [...prev, item]);
    save([...itemsRef.current, item]);
    setSelectedId(item.id);
  };

  // ---------- keyboard ----------
  useEffect(() => {
    if (!authed) return;
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const typing =
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLInputElement ||
        (active as HTMLElement)?.isContentEditable;

      if (typing) {
        if (e.key === "Escape") {
          const id = editingIdRef.current;
          if (id) commitEdit(id, itemsRef.current.find((it) => it.id === id)?.text ?? "");
          (active as HTMLElement).blur();
          setEditingId(null);
        }
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) deleteCard(selectedId);
      if (e.key === "Escape") {
        setSelectedId(null);
        setShowPalette(false);
      }
      if (e.key === "v") setTool("pan");
      if (e.key === "n") setTool("text");
      if (e.key === "h") setTool("heading");
      if (e.key === "a") setTool("arrow");
      if (e.key === "Enter" && selectedId) setEditingId(selectedId);
      if (e.key === "0") setCam((c) => ({ ...c, zoom: 1 }));
      if (e.key === "=" || e.key === "+")
        setCam((c) => ({ ...c, zoom: Math.min(MAX_ZOOM, c.zoom * 1.15) }));
      if (e.key === "-") setCam((c) => ({ ...c, zoom: Math.max(MIN_ZOOM, c.zoom / 1.15) }));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, selectedId, commitEdit]);

  const uploadFile = async (file: File) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const at = screenToWorld(rect.width / 2, rect.height / 2);
    showToast("Uploading…");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/space/asset", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      addCard({ type: "image", src: d.url, x: at.x - 140, y: at.y - 100, width: 320 });
      showToast("Image added ✓");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const cycleColor = (item: SpaceItem) => {
    const idx = COLORS.indexOf(item.color as (typeof COLORS)[number]);
    patchItem(item.id, { color: COLORS[(idx + 1) % COLORS.length] });
  };

  // ---------- gate ----------
  if (authed === null) return <FullscreenBody />;

  if (!authed) {
    return (
      <>
        <FullscreenBody />
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background px-4">
          <h1 className="font-serif text-3xl tracking-tight">Space</h1>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            A private corner. Enter the passcode.
          </p>
          <div className="flex w-full max-w-xs gap-2">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Passcode"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              autoFocus
            />
            <button
              onClick={login}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85"
            >
              Enter
            </button>
          </div>
          {authError && <p className="text-sm text-red-500">{authError}</p>}
        </div>
      </>
    );
  }

  const selected = items.find((it) => it.id === selectedId);

  // ---------- fullscreen canvas ----------
  return (
    <>
      <FullscreenBody />
      <div ref={viewportRef} className="space-viewport dots-bg bg-background">
        {/* world layer */}
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.zoom})` }}
        >
          {items.map((item) => (
            <CanvasNode
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              editing={editingId === item.id}
              onMouseDown={(e) => e.stopPropagation()}
              onStartEdit={() => {
                setSelectedId(item.id);
                setEditingId(item.id);
              }}
              onStopEdit={() => setEditingId(null)}
              onEmptyDelete={() => deleteCard(item.id)}
              onChange={(patch) => patchItem(item.id, patch)}
            />
          ))}
        </div>

        {/* hint */}
        {items.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
              <p className="font-serif text-3xl text-foreground">Your space.</p>
              <p className="mt-4">
                <b className="text-foreground">Drag</b> to pan ·{" "}
                <b className="text-foreground">double-click</b> to write · paste images & links
                <br />
                <Key>A</Key> arrows · <Key>N</Key> text · <Key>H</Key> headings · Ctrl+scroll to
                zoom
              </p>
            </div>
          </div>
        )}

        {/* top-left: mode indicator */}
        <div data-ui className="absolute left-5 top-5 z-30 flex items-center gap-2">
          {tool !== "pan" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs shadow backdrop-blur"
            >
              {tool === "arrow"
                ? "↗ drag to draw an arrow"
                : `click to place ${tool}`}
              {" · "}
              <button onClick={() => setTool("pan")} className="underline underline-offset-2">
                esc
              </button>
            </motion.div>
          )}
        </div>

        {/* floating toolbar */}
        <div
          data-ui
          className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-border/30 bg-background/85 p-1.5 shadow-xl backdrop-blur-xl"
        >
          <TBtn active={tool === "pan"} label="Select / Pan (V)" onClick={() => setTool("pan")}>
            ✥
          </TBtn>
          <TBtn active={tool === "text"} label="Text (N)" onClick={() => setTool("text")}>
            T
          </TBtn>
          <TBtn active={tool === "heading"} label="Heading (H)" onClick={() => setTool("heading")}>
            H
          </TBtn>
          <TBtn active={tool === "arrow"} label="Arrow (A)" onClick={() => setTool("arrow")}>
            ↗
          </TBtn>

          <span className="mx-1 h-5 w-px bg-border" />

          <label
            title="Upload an image"
            className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ⬆
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
                e.target.value = "";
              }}
            />
          </label>

          <span className="mx-1 h-5 w-px bg-border" />

          {/* selection controls live HERE ONLY */}
          {selected ? (
            <>
              <button
                onClick={() => setShowPalette((v) => !v)}
                title="Color"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  showPalette && "bg-muted text-foreground",
                )}
              >
                <span className={cn("size-3.5 rounded-full border", SWATCH[selected.color])} />
                Color
              </button>
              {(selected.type === "text" || selected.type === "heading") && (
                <>
                  <span className="ml-1 text-xs tabular-nums text-muted-foreground">
                    {selected.fontSize ?? 16}px
                  </span>
                  <button
                    onClick={() =>
                      patchItem(selected.id, {
                        fontSize: Math.max(10, (selected.fontSize ?? 16) - 2),
                      })
                    }
                    title="Smaller text"
                    className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    A−
                  </button>
                  <input
                    type="range"
                    min={10}
                    max={72}
                    step={2}
                    value={selected.fontSize ?? 16}
                    onChange={(e) => patchItem(selected.id, { fontSize: Number(e.target.value) })}
                    title="Text size"
                    className="w-24 accent-foreground"
                  />
                  <button
                    onClick={() =>
                      patchItem(selected.id, {
                        fontSize: Math.min(72, (selected.fontSize ?? 16) + 2),
                      })
                    }
                    title="Bigger text"
                    className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    A+
                  </button>
                </>
              )}
              {selected.type === "arrow" && (
                <>
                  <button
                    onClick={() =>
                      patchItem(selected.id, {
                        stroke: Math.max(1, (selected.stroke ?? 2) - 1),
                      })
                    }
                    className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    thin
                  </button>
                  <button
                    onClick={() =>
                      patchItem(selected.id, {
                        stroke: Math.min(8, (selected.stroke ?? 2) + 1),
                      })
                    }
                    className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    thick
                  </button>
                </>
              )}
              <button
                onClick={() => deleteCard(selected.id)}
                title="Delete (Del)"
                className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                ✕
              </button>
            </>
          ) : (
            <span className="px-3 text-xs text-muted-foreground/70">
              click something to edit it
            </span>
          )}

          <span className="mx-1 h-5 w-px bg-border" />
          <span className="min-w-11 px-1 text-center text-[10px] tabular-nums text-muted-foreground">
            {Math.round(cam.zoom * 100)}%
          </span>
          <span className="pr-1 text-[10px] text-muted-foreground/70">
            {saving === "saving"
              ? "saving…"
              : saving === "saved"
                ? "saved ✓"
                : saving === "error"
                  ? "save ✗"
                  : ""}
          </span>
        </div>

        {/* palette popover */}
        <AnimatePresence>
          {selected && showPalette && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-2xl border border-border/30 bg-background/95 p-2.5 shadow-xl backdrop-blur-xl"
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    patchItem(selected.id, { color: c });
                    setShowPalette(false);
                  }}
                  aria-label={c}
                  title={c}
                  className={cn(
                    "size-7 rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/10",
                    SWATCH[c],
                    selected.color === c && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                  )}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-6 top-6 z-30 rounded-full border border-border bg-background/90 px-4 py-1.5 text-xs shadow-lg backdrop-blur"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ---------- small bits ----------

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border border-border px-1">{children}</kbd>
);

const SWATCH: Record<string, string> = {
  default: "bg-card",
  yellow: "bg-yellow-300 dark:bg-yellow-700",
  blue: "bg-blue-300 dark:bg-blue-700",
  pink: "bg-pink-300 dark:bg-pink-700",
  green: "bg-emerald-300 dark:bg-emerald-700",
};

const CARD_BG: Record<string, string> = {
  default: "",
  yellow: "bg-yellow-50/90 dark:bg-yellow-950/50",
  blue: "bg-blue-50/90 dark:bg-blue-950/50",
  pink: "bg-pink-50/90 dark:bg-pink-950/50",
  green: "bg-emerald-50/90 dark:bg-emerald-950/50",
};

const TEXT_TINT: Record<string, string> = {
  default: "",
  yellow: "dark:text-yellow-100",
  blue: "dark:text-blue-100",
  pink: "dark:text-pink-100",
  green: "dark:text-emerald-100",
};

const STROKE_COLOR: Record<string, string> = {
  default: "#525252",
  yellow: "#d97706",
  blue: "#2563eb",
  pink: "#db2777",
  green: "#059669",
};

const TBtn = ({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={cn(
      "rounded-lg px-3 py-1.5 text-sm transition-colors",
      active
        ? "bg-foreground text-background"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    {children}
  </button>
);

// ---------- node renderer ----------

const CanvasNode = ({
  item,
  selected,
  editing,
  onChange,
  onStartEdit,
  onStopEdit,
  onEmptyDelete,
}: {
  item: SpaceItem;
  selected: boolean;
  editing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onEmptyDelete: () => void;
  onChange: (patch: Partial<SpaceItem>) => void;
}) => {
  const isArrow = item.type === "arrow";
  const isTextish = item.type === "text" || item.type === "heading";
  const isCardish = item.type === "link" || item.type === "image";

  if (isArrow) return <ArrowShape item={item} selected={selected} onChange={onChange} />;

  if (isTextish) {
    const fs = item.fontSize ?? 16;
    return (
      <div
        data-card
        data-card-id={item.id}
        style={{
          position: "absolute",
          left: item.x,
          top: item.y,
          maxWidth: 720,
          transform: `rotate(${item.rotation}deg)`,
        }}
        className={cn(
          "group select-none",
          editing ? "cursor-text" : "cursor-move",
          TEXT_TINT[item.color],
        )}
      >
        {editing ? (
          <textarea
            autoFocus
            value={item.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            onBlur={() => {
              onStopEdit();
              if (!(item.text ?? "").trim()) onEmptyDelete();
            }}
            rows={Math.max(1, (item.text ?? "").split("\n").length)}
            spellCheck={false}
            style={{ fontSize: fs, width: isTextish ? `${Math.min(720, fs * 0.62 * 40)}px` : undefined }}
            className={cn(
              "space-free-text resize-none overflow-hidden leading-snug",
              item.type === "heading" && "font-serif tracking-tight",
            )}
          />
        ) : (
          <div
            onDoubleClick={onStartEdit}
            style={{
              fontSize: fs,
              lineHeight: 1.35,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            className={cn(
              "space-free-text",
              item.type === "heading" && "font-serif tracking-tight",
              selected && "outline-2 outline-dashed outline-ring/50 outline-offset-4",
            )}
          >
            {(item.text || "") || <span className="opacity-40">empty</span>}
          </div>
        )}
      </div>
    );
  }

  // image & link cards
  return (
    <div
      data-card
      data-card-id={item.id}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.width,
        transform: `rotate(${item.rotation}deg)`,
      }}
      className={cn(
        "group select-none rounded-lg border border-border shadow-md transition-shadow hover:shadow-lg",
        CARD_BG[item.color],
        selected && "ring-2 ring-ring/60",
      )}
    >
      {item.type === "link" && <LinkBody item={item} />}
      {item.type === "image" && <ImageBody item={item} onChange={onChange} />}
    </div>
  );
};

// ---------- youtube / x / web embeds ----------

const LinkBody = ({ item }: { item: SpaceItem }) => {
  const ytId = item.kind === "youtube" ? item.embedId : undefined;

  return (
    <div>
      {ytId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}`}
          title={item.title ?? "YouTube"}
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          draggable={false}
          className="aspect-video w-full rounded-t-lg"
        />
      ) : item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            item.image.startsWith("/")
              ? item.image
              : `/api/space/img-proxy?url=${encodeURIComponent(item.image)}`
          }
          alt=""
          loading="lazy"
          draggable={false}
          className="mb-2 max-h-48 w-full rounded-t-lg object-cover"
        />
      ) : null}

      <div className="px-3 pb-3 pt-2">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
          className="block text-[13px] font-medium leading-snug underline-offset-2 hover:underline"
        >
          {item.title}
        </a>
        {item.description && (
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground line-clamp-6">
            {item.description}
          </p>
        )}
        <span className="mt-1.5 block truncate text-[11px] text-muted-foreground/60">
          {item.kind === "x"
            ? "𝕏 post"
            : item.kind === "youtube"
              ? "YouTube"
              : item.url?.replace(/^https?:\/\//, "")}
        </span>
      </div>
    </div>
  );
};

const ImageBody = ({
  item,
  onChange,
}: {
  item: SpaceItem;
  onChange: (patch: Partial<SpaceItem>) => void;
}) => (
  <figure>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={item.src}
      alt={item.caption || "space image"}
      draggable={false}
      className="w-full rounded-t-lg object-cover"
    />
    <figcaption className="px-3 pb-2 pt-1.5">
      <input
        value={item.caption ?? ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="caption…"
        className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40"
      />
    </figcaption>
  </figure>
);

// ---------- arrows ----------

const ArrowShape = ({
  item,
  selected,
  onChange,
}: {
  item: SpaceItem;
  selected: boolean;
  onChange: (patch: Partial<SpaceItem>) => void;
}) => {
  const x2 = item.x2 ?? item.x + 100;
  const y2 = item.y2 ?? item.y;

  const left = Math.min(item.x, x2);
  const top = Math.min(item.y, y2);
  const w = Math.max(1, Math.abs(x2 - item.x));
  const h = Math.max(1, Math.abs(y2 - item.y));

  // generous invisible hit area so arrows are grabbable
  const pad = Math.max(8, 14 - (item.stroke ?? 2));

  const stroke = STROKE_COLOR[item.color] ?? STROKE_COLOR.default;

  return (
    <div
      data-card
      data-card-id={item.id}
      style={{
        position: "absolute",
        left: left - pad,
        top: top - pad,
        width: w + pad * 2,
        height: h + pad * 2,
        cursor: "move",
      }}
      title="Drag to move · Del to delete"
    >
      <svg
        width={w + pad * 2}
        height={h + pad * 2}
        className={cn("overflow-visible", selected && "drop-shadow")}
      >
        <line
          x1={(x2 > item.x ? 0 : w) + pad}
          y1={(y2 > item.y ? 0 : h) + pad}
          x2={(x2 > item.x ? w : 0) + pad}
          y2={(y2 > item.y ? h : 0) + pad}
          stroke={stroke}
          strokeWidth={item.stroke ?? 2}
          strokeLinecap="round"
        />
        <polygon points={arrowHead(item.x, item.y, x2, y2, item.stroke ?? 2, pad)} fill={stroke} />
      </svg>
    </div>
  );
};

function arrowHead(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  pad: number,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 9 + strokeWidth * 2.2;
  const spread = Math.PI / 7;

  const pts = [
    { x: x2, y: y2 },
    { x: x2 - len * Math.cos(angle - spread), y: y2 - len * Math.sin(angle - spread) },
    { x: x2 - len * Math.cos(angle + spread), y: y2 - len * Math.sin(angle + spread) },
  ];

  const left = Math.min(x1, x2) - pad;
  const top = Math.min(y1, y2) - pad;
  return pts.map((p) => `${p.x - left},${p.y - top}`).join(" ");
}
