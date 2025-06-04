import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuIcon, BellIcon } from "./icons";

interface LayoutProps {
  children: React.ReactNode;
  linePlanName?: string;
}

const headerNavLinks = [
  { name: "Products", path: "/" },
  { name: "Showcase", path: "/showcase" },
  { name: "Upload", path: "/upload" },
];

const Layout: React.FC<LayoutProps> = ({ children, linePlanName }) => {
  const location = useLocation();
  const currentProgramContext = linePlanName
    ? linePlanName.replace(" Collection", "")
    : "SS26 Womens";

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white text-slate-800 border-b border-slate-200/80 flex-shrink-0 shadow-sm">
        {" "}
        {/* Softer border, added shadow */}
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <button
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150 ease-in-out active:bg-slate-200/70"
                title="Toggle menu"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <div className="flex items-baseline space-x-2">
                <span className="text-md font-semibold text-slate-800">
                  Line planner
                </span>
                <span className="text-slate-300/80 text-sm">/</span>
                <span className="text-xs font-medium text-slate-500">
                  {currentProgramContext}
                </span>
              </div>
            </div>

            <nav className="flex space-x-1">
              {headerNavLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-in-out
                    ${
                      location.pathname === item.path ||
                      (item.path === "/" &&
                        location.pathname.startsWith("/category"))
                        ? "text-sky-600 bg-sky-100/80 hover:bg-sky-200/70"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/70"
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
              <Link
                to="#"
                className="text-xs text-slate-500 hover:text-sky-600 transition-colors duration-150 ease-in-out"
              >
                Support
              </Link>
              <button
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all duration-150 ease-in-out active:bg-slate-200/70"
                title="View notifications"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-5 w-5" /> {/* Standardized icon size */}
              </button>
              <div className="flex-shrink-0">
                <span
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-700 hover:bg-slate-800 transition-colors duration-150 ease-in-out cursor-pointer"
                  title="User Profile"
                >
                  <span className="text-2xs font-medium leading-none text-white">
                    YZ
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
