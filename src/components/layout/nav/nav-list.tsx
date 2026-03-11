import { Dispatch, SetStateAction } from "react";
import { navData } from "./_nav-mock";
import NavItem from "./nav-item";
import { cn } from "~/lib/utils";

interface NavProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

const NavList: React.FC<NavProps> = ({ setOpen, className }) => {
  return (
    <ul role="list" className={cn("flex items-center gap-1", className)}>
      {navData.map((nav) => (
        <NavItem key={nav.id} setOpen={setOpen} {...nav} />
      ))}
    </ul>
  );
};

export default NavList;
