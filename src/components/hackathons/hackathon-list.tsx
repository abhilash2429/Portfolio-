import { typo } from "../ui/typograpghy";
import { THackathon } from "./_hackathon-data";
import HackathonItem from "./hackathon-item";

type HackathonListProps = {
  hackathons: THackathon[];
  showTitle?: boolean;
};

const HackathonList = ({
  hackathons,
  showTitle = true,
}: HackathonListProps) => {
  return (
    <section aria-label="hackathons and competitions" className="mt-5 space-y-6">
      {showTitle && (
        <h2 className={typo({ variant: "h2" })}>Hackathons & Competitions</h2>
      )}

      <div className="!mt-8">
        <ol className="space-y-8" role="list">
          {hackathons.map((hackathon, index) => (
            <HackathonItem
              key={hackathon.id}
              {...hackathon}
              isLast={index === hackathons.length - 1}
            />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HackathonList;
