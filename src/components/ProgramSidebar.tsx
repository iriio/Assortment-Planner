import { cn } from "../../lib/utils";
import { Plus as PlusIcon, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "../components/ui/search-bar";

interface SearchResult {
  id: string;
  title: string;
  type: string;
}

// Reduced set of props, removing dependency on a global provider
interface ProgramSidebarProps {
  onInitiateProgramCreation: () => void;
  drafts: any[];
  current: any[];
  archived: any[];
  onProgramSelect: (programId: string) => void;
  currentLinePlanId: string | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSearch?: (query: string) => void;
}

export function ProgramSidebar({
  onInitiateProgramCreation,
  drafts,
  current,
  archived,
  onProgramSelect,
  currentLinePlanId,
  isCollapsed,
  onSearch,
}: ProgramSidebarProps) {
  const renderProgramSection = (title: string, programs: any[]) => {
    if (programs.length === 0) return null;

    return (
      <div className="px-3 py-2">
        <h2
          className={cn(
            "mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-tight",
            isCollapsed && "sr-only"
          )}
        >
          {title}
        </h2>
        <div className="space-y-1">
          {programs.map((program) => (
            <Button
              key={program.id}
              variant={currentLinePlanId === program.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sm hover:bg-slate-200",
                currentLinePlanId === program.id &&
                  "bg-blue-100 font-medium text-blue-800",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => onProgramSelect(program.id)}
              title={isCollapsed ? program.name : undefined}
            >
              <Folder className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span>{program.name}</span>}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Combine all programs for search
  const allPrograms: SearchResult[] = [...current, ...drafts, ...archived].map(
    (program) => ({
      id: program.id,
      title: program.name,
      type: current.includes(program)
        ? "Current"
        : drafts.includes(program)
        ? "Draft"
        : "Archived",
    })
  );

  return (
    <nav
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300 ease-in-out bg-slate-100 pt-2",
        isCollapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <SearchBar
            placeholder="Search programs..."
            onSearch={(query: string) => onSearch?.(query)}
            results={allPrograms}
            onSelectResult={(result: SearchResult) =>
              onProgramSelect(result.id)
            }
            className="w-full"
          />
        </div>
      )}
      <Separator />
      <ScrollArea className="flex-1">
        {renderProgramSection("Current", current)}
        {drafts.length > 0 && <Separator className="my-2" />}
        {renderProgramSection("Drafts", drafts)}
        {archived.length > 0 && <Separator className="my-2" />}
        {renderProgramSection("Archived", archived)}
      </ScrollArea>
      <Separator />
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "px-4",
          "py-2"
        )}
      >
        <Button
          onClick={onInitiateProgramCreation}
          variant="default"
          size="icon"
          className={cn(
            "py-3 bg-blue-600 text-white hover:bg-blue-700",
            isCollapsed ? "h-10 w-10" : "h-fit w-full"
          )}
          title={isCollapsed ? "New Program" : undefined}
        >
          <PlusIcon className="h-4 w-4" />
          {!isCollapsed && <span className="w-fit">New Program</span>}
        </Button>
      </div>
    </nav>
  );
}
