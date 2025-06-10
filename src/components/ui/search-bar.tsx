"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  [key: string]: any;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  results?: SearchResult[];
  onSelectResult?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  results = [],
  onSelectResult,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  const [value, setValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleSearch = React.useCallback(
    (query: string) => {
      setValue(query);
      onSearch(query);
      setIsOpen(true);
    },
    [onSearch]
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-blue-100 focus:ring-1 focus:ring-blue-400"
          placeholder={placeholder}
          type="text"
        />
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 py-1 rounded-md border bg-popover text-popover-foreground shadow-md z-50">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
              onClick={() => {
                onSelectResult?.(result);
                setIsOpen(false);
                setValue("");
              }}
            >
              <span>{result.title}</span>
              <span className="text-xs text-muted-foreground">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results state */}
      {isOpen && value && results.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-1 py-6 rounded-md border bg-popover text-popover-foreground shadow-md z-50">
          <p className="text-center text-sm text-muted-foreground">
            No results found.
          </p>
        </div>
      )}
    </div>
  );
}
