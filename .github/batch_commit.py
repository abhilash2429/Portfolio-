#!/usr/bin/env python3
"""
Batch commit helper.

Creates one commit per file, while respecting .gitignore-like patterns.
"""

from __future__ import annotations

import argparse
import fnmatch
import os
import time
from pathlib import Path
from typing import List, Sequence, Tuple

from github_committer import GitHubCommitter

BUILTIN_IGNORE_PATTERNS: List[str] = [
    ".git/",
    "__pycache__/",
    "*.pyc",
    "*.pyo",
    ".github/__pycache__/",
]


def parse_repo_spec(args: argparse.Namespace) -> Tuple[str, str]:
    if args.repo:
        if "/" not in args.repo:
            raise ValueError("--repo must be in 'owner/name' format")
        owner, name = args.repo.split("/", 1)
        if owner and name:
            return owner, name
        raise ValueError("--repo must be in 'owner/name' format")

    if args.owner and args.name:
        return args.owner, args.name

    raise ValueError(
        "Provide repository via --repo owner/name or --owner + --name "
        "(or set GITHUB_REPO / GITHUB_OWNER + GITHUB_REPO_NAME)."
    )


def load_ignore_patterns(project_root: Path) -> List[str]:
    patterns: List[str] = []
    gitignore_path = project_root / ".gitignore"

    if gitignore_path.exists():
        for line in gitignore_path.read_text(encoding="utf-8").splitlines():
            raw = line.strip()
            if not raw or raw.startswith("#"):
                continue
            patterns.append(raw)

    patterns.extend(BUILTIN_IGNORE_PATTERNS)
    return patterns


def _match_pattern(rel_path: str, pattern: str) -> bool:
    anchored = pattern.startswith("/")
    pattern = pattern[1:] if anchored else pattern

    dir_only = pattern.endswith("/")
    pattern = pattern[:-1] if dir_only else pattern
    if not pattern:
        return False

    name = rel_path.rsplit("/", 1)[-1]

    if dir_only:
        if rel_path == pattern or rel_path.startswith(pattern + "/"):
            return True
        if not anchored and f"/{pattern}/" in f"/{rel_path}/":
            return True

    if "/" in pattern:
        if fnmatch.fnmatch(rel_path, pattern):
            return True
        if not anchored and fnmatch.fnmatch(rel_path, f"**/{pattern}"):
            return True
        return False

    if fnmatch.fnmatch(name, pattern):
        return True
    return any(fnmatch.fnmatch(part, pattern) for part in rel_path.split("/"))


def is_ignored(rel_path: str, patterns: Sequence[str]) -> bool:
    ignored = False
    for raw in patterns:
        include = raw.startswith("!")
        pattern = raw[1:] if include else raw
        if _match_pattern(rel_path, pattern):
            ignored = not include
    return ignored


def collect_files(project_root: Path, patterns: Sequence[str]) -> List[Tuple[Path, str]]:
    files_to_commit: List[Tuple[Path, str]] = []

    for root, dirs, files in os.walk(project_root):
        root_path = Path(root)

        filtered_dirs: List[str] = []
        for dirname in sorted(dirs):
            dir_rel = (root_path / dirname).relative_to(project_root).as_posix()
            if not is_ignored(dir_rel + "/", patterns):
                filtered_dirs.append(dirname)
        dirs[:] = filtered_dirs

        for filename in sorted(files):
            file_path = root_path / filename
            rel_path = file_path.relative_to(project_root).as_posix()
            if is_ignored(rel_path, patterns):
                continue
            files_to_commit.append((file_path, rel_path))

    return files_to_commit


def read_file_payload(path: Path) -> Tuple[object, bool]:
    raw = path.read_bytes()
    try:
        return raw.decode("utf-8"), False
    except UnicodeDecodeError:
        return raw, True


def render_commit_message(template: str, rel_path: str) -> str:
    name = Path(rel_path).name
    stem = Path(rel_path).stem
    return template.format(path=rel_path, name=name, stem=stem)


def print_plan(files: Sequence[Tuple[Path, str]], max_preview: int = 40) -> None:
    print(f"Planned atomic commits: {len(files)}")
    if not files:
        return

    preview = files[:max_preview]
    for idx, (_, rel_path) in enumerate(preview, start=1):
        print(f"  {idx:>3}. {rel_path}")

    remaining = len(files) - len(preview)
    if remaining > 0:
        print(f"  ... and {remaining} more files")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create one commit per file in a local project using GitHub API."
    )
    parser.add_argument("--root", default=None, help="Project root (default: repo root)")
    parser.add_argument("--repo", default=os.getenv("GITHUB_REPO"), help="owner/name")
    parser.add_argument("--owner", default=os.getenv("GITHUB_OWNER"))
    parser.add_argument("--name", default=os.getenv("GITHUB_REPO_NAME"))
    parser.add_argument("--token", default=os.getenv("GITHUB_TOKEN"))
    parser.add_argument("--branch", default=os.getenv("GITHUB_BRANCH", "main"))
    parser.add_argument(
        "--message-template",
        default="chore: update {path}",
        help="Supports {path}, {name}, {stem}.",
    )
    parser.add_argument("--delay", type=float, default=0.35, help="Delay between commits.")
    parser.add_argument("--max-files", type=int, default=None, help="Cap number of files.")
    parser.add_argument("--dry-run", action="store_true", help="Preview without committing.")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if not args.token:
        raise SystemExit("Missing token. Set GITHUB_TOKEN or pass --token.")

    owner, name = parse_repo_spec(args)

    script_dir = Path(__file__).resolve().parent
    project_root = Path(args.root).resolve() if args.root else script_dir.parent

    patterns = load_ignore_patterns(project_root)
    files = collect_files(project_root, patterns)

    if args.max_files is not None:
        files = files[: args.max_files]

    print(f"Target: {owner}/{name} (branch: {args.branch})")
    print(f"Project root: {project_root}")
    print(f"Ignore patterns loaded: {len(patterns)}")
    print_plan(files)

    if args.dry_run:
        print("Dry run complete. No commits were created.")
        return

    if not args.yes:
        response = input("Proceed with these atomic commits? (yes/no): ").strip().lower()
        if response not in {"yes", "y"}:
            print("Cancelled.")
            return

    committer = GitHubCommitter(
        token=args.token,
        repo_owner=owner,
        repo_name=name,
        branch=args.branch,
    )

    committed = 0
    skipped = 0
    failed: List[Tuple[str, str]] = []

    total = len(files)
    for index, (local_path, repo_path) in enumerate(files, start=1):
        try:
            payload, is_binary = read_file_payload(local_path)
            message = render_commit_message(args.message_template, repo_path)

            result = committer.commit_single_file(
                file_path=repo_path,
                file_content=payload,
                commit_message=message,
                is_binary=is_binary,
            )

            action = result.get("action", "unknown")
            if action == "skipped":
                skipped += 1
                print(f"[{index}/{total}] SKIP {repo_path}")
            else:
                committed += 1
                sha_short = result.get("commit_sha", "")[:7]
                print(f"[{index}/{total}] OK   {repo_path} ({sha_short})")

            if args.delay > 0:
                time.sleep(args.delay)
        except Exception as exc:  # noqa: BLE001
            failed.append((repo_path, str(exc)))
            print(f"[{index}/{total}] FAIL {repo_path}")
            print(f"            {exc}")

    print("-" * 60)
    print(f"Total files considered: {total}")
    print(f"Committed: {committed}")
    print(f"Skipped (unchanged): {skipped}")
    print(f"Failed: {len(failed)}")

    if failed:
        print("Failed files:")
        for path, error in failed:
            print(f"  - {path}: {error}")


if __name__ == "__main__":
    main()
