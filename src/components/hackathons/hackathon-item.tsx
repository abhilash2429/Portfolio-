import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { cn } from "~/lib/utils";
import { CustomLink } from "../mdx";
import { typo } from "../ui/typograpghy";
import { THackathon } from "./_hackathon-data";

type HackathonItemProps = THackathon & {
  isLast?: boolean;
};

const HackathonItem: React.FC<HackathonItemProps> = ({
  title,
  role,
  date,
  link,
  description,
  isLast = false,
}) => {
  return (
    <li role="listitem" className="relative pl-8">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 size-3 rounded-full border-2 border-ring bg-background" />

      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[5px] top-5 h-[calc(100%+1.5rem)] w-[2px] bg-border" />
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-serif text-lg">
              {link ? (
                <CustomLink
                  href={link}
                  aria-label={`view ${title} details`}
                  className="!p-0 inline-flex items-center gap-1.5 hover:!text-ring"
                >
                  <span>{title}</span>
                  <FaExternalLinkAlt size={11} className="text-ring opacity-80" />
                </CustomLink>
              ) : (
                <span>{title}</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {role}
              </span>
            </div>
          </div>
          <span className="text-xs text-ring" aria-label="date">
            {date}
          </span>
        </div>

        <ul className="space-y-1.5 pt-1">
          {description.map((bullet, idx) => (
            <li
              key={idx}
              className={cn(
                typo({ variant: "paragraph", size: "sm" }),
                "relative pl-4 text-muted-foreground before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-muted-foreground/60"
              )}
            >
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default HackathonItem;
