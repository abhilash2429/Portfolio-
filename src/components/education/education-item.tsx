import React from "react";
import { cn } from "~/lib/utils";
import { CustomLink } from "../mdx";
import { typo } from "../ui/typograpghy";
import { TEducation } from "./_education-data";

type EducationItemProps = TEducation & {
    isLast?: boolean;
};

const EducationItem: React.FC<EducationItemProps> = ({
    institution,
    website,
    degree,
    description,
    duration,
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
                <hgroup className="space-y-1">
                    <h3 className="font-serif text-lg">
                        <CustomLink
                            href={website}
                            aria-label={`visit ${institution} website`}
                            className="!p-0 hover:!text-ring"
                        >
                            {institution}
                        </CustomLink>
                    </h3>
                    <p className="text-sm text-ring">{degree}</p>
                </hgroup>

                <p
                    className={cn(
                        typo({ variant: "paragraph", size: "sm" }),
                        "line-clamp-3"
                    )}
                >
                    {description}
                </p>

                <p className="text-xs text-ring" aria-label="duration">
                    {duration}
                </p>
            </div>
        </li>
    );
};

export default EducationItem;
