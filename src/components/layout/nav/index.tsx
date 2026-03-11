import NavList from "./nav-list";
import ThemeToggle from "~/components/ui/theme-toggle";

const Navbar = () => {
  return (
    <nav className="sticky top-4 z-50 mb-8 mt-8 flex justify-center" role="navigation">
      <div className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-background/30 p-1 shadow-lg backdrop-blur-xl">
        <NavList />
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
