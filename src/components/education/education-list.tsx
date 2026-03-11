import { typo } from "../ui/typograpghy";
import { TEducation } from "./_education-data";
import EducationItem from "./education-item";

type EducationListProps = {
    educationList: TEducation[];
    showTitle?: boolean;
};

const EducationList = ({
    educationList,
    showTitle = true,
}: EducationListProps) => {
    return (
        <section aria-label="education" className="mt-5 space-y-6">
            {showTitle && (
                <h2 className={typo({ variant: "h2" })}>Education</h2>
            )}

            <div className="!mt-8">
                <ol className="space-y-6" role="list">
                    {educationList.map((education, index) => (
                        <EducationItem
                            key={education.id}
                            {...education}
                            isLast={index === educationList.length - 1}
                        />
                    ))}
                </ol>
            </div>
        </section>
    );
};

export default EducationList;
