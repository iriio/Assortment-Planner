import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuIcon, BellIcon } from "./icons";
import { clearAllData } from "../utils/localStorage";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  linePlanName?: string;
  onClearData?: () => void;
}

const headerNavLinks = [
  { name: "Products", path: "/" },
  { name: "Showcase", path: "/showcase" },
  { name: "Upload", path: "/upload" },
];

const Layout: React.FC<LayoutProps> = ({
  children,
  linePlanName,
  onClearData,
}) => {
  const location = useLocation();

  const currentProgramContext = linePlanName
    ? linePlanName.replace(" Collection", "")
    : "SS26 Womens";

  const handleReset = () => {
    if (
      window.confirm(
        "Reset to original state? This will clear all your changes."
      )
    ) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-card text-card-foreground border-b flex-shrink-0 shadow-sm">
        {" "}
        {/* Softer border, added shadow */}
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" title="Toggle menu">
                <MenuIcon className="w-5 h-5" />
              </Button>
              <div className="flex items-baseline space-x-2">
                <span className="text-md font-semibold">Line planner</span>
                <span className="text-muted-foreground/80 text-sm">/</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {currentProgramContext}
                </span>
              </div>
            </div>

            <nav className="flex space-x-1">
              {headerNavLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${
                      location.pathname === item.path ||
                      (item.path === "/" &&
                        location.pathname.startsWith("/category"))
                        ? "text-primary bg-primary-foreground hover:bg-primary-foreground/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80 active:bg-muted"
                    }`}
                  aria-current={
                    location.pathname === item.path ? "page" : undefined
                  }
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <Button
                variant="link"
                onClick={handleReset}
                title="Reset to original state"
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Reset
              </Button>
              <Link
                to="#"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </Link>
              <Button variant="ghost" size="icon" title="View notifications">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-5 w-5" />
              </Button>
              <div className="flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted-foreground hover:bg-foreground transition-colors cursor-pointer"
                  title="User Profile"
                >
                  <span className="text-2xs font-medium leading-none text-background">
                    YZ
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b">
            <div className="flex h-16 items-center px-4">
              <h2 className="text-lg font-semibold">
                {linePlanName || "Assortment Planner"}
              </h2>
              {onClearData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={onClearData}
                >
                  Reset Data
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
