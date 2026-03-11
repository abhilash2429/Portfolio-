"use client";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { NavType } from "./_nav-mock";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

const NavItem: React.FC<NavType[0] & { setOpen?: Dispatch<SetStateAction<boolean>> }> = ({
  label,
  path,
  setOpen,
}) => {
  const pathname = usePathname();

  const onClickHandler = () => {
    if (typeof setOpen === "function") {
      setOpen(false);
    }
  };

  return (
    <li role="listitem" className="flex" onClick={onClickHandler}>
      <Link
        href={path}
        role="link"
        aria-label={label}
        className={cn(
          "el-focus-styles rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          pathname === path
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {label}
      </Link>
    </li>
  );
};

export default NavItem;
