import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, ChevronDownIcon, Settings2 } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "./ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { LinePlan, PLMStatusStage, UserRole } from "../src/types";
import StatusBadge from "../src/components/StatusBadge";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  linePlans: LinePlan[];
  currentLinePlanId: string | null;
  onSelectProgram: (id: string) => void;
  onInitiateNewDraftProgram: () => void;
}

export function AppSidebar({
  linePlans,
  currentLinePlanId,
  onSelectProgram,
  onInitiateNewDraftProgram,
  ...props
}: AppSidebarProps) {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({
    drafts: true,
    current: true,
    archived: true,
  });

  // Group programs by status
  const drafts = (linePlans || []).filter(
    (p) => p.plmStatus === PLMStatusStage.DRAFT
  );
  const current = (linePlans || []).filter(
    (p) =>
      p.plmStatus !== PLMStatusStage.DRAFT &&
      p.plmStatus !== PLMStatusStage.LAUNCHED
  );
  const archived = (linePlans || []).filter(
    (p) => p.plmStatus === PLMStatusStage.LAUNCHED
  );

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Line Planner</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onInitiateNewDraftProgram}
            className="h-8"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Add Program CTA at the top */}
        <div className="px-4 pt-4 pb-2">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={onInitiateNewDraftProgram}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> Add Program
          </Button>
          <Separator className="my-3" />
        </div>
        {/* Drafts Section */}
        <SidebarGroup>
          <Collapsible
            open={openSections.drafts}
            onOpenChange={() => toggleSection("drafts")}
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer">
                <span>Drafts</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    openSections.drafts ? "rotate-180" : ""
                  }`}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu>
                {drafts.map((program) => (
                  <SidebarMenuItem key={program.id}>
                    <SidebarMenuButton
                      isActive={program.id === currentLinePlanId}
                      onClick={() => onSelectProgram(program.id)}
                    >
                      <span className="truncate">{program.name}</span>
                      <StatusBadge
                        status={program.plmStatus}
                        size="sm"
                        userRole={UserRole.MERCHANT}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Current Programs Section */}
        <SidebarGroup>
          <Collapsible
            open={openSections.current}
            onOpenChange={() => toggleSection("current")}
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer">
                <span>Current</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    openSections.current ? "rotate-180" : ""
                  }`}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu>
                {current.map((program) => (
                  <SidebarMenuItem key={program.id}>
                    <SidebarMenuButton
                      isActive={program.id === currentLinePlanId}
                      onClick={() => onSelectProgram(program.id)}
                    >
                      <span className="truncate">{program.name}</span>
                      <StatusBadge
                        status={program.plmStatus}
                        size="sm"
                        userRole={UserRole.MERCHANT}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Archived Section */}
        <SidebarGroup>
          <Collapsible
            open={openSections.archived}
            onOpenChange={() => toggleSection("archived")}
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer">
                <span>Archived</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    openSections.archived ? "rotate-180" : ""
                  }`}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu>
                {archived.map((program) => (
                  <SidebarMenuItem key={program.id}>
                    <SidebarMenuButton
                      isActive={program.id === currentLinePlanId}
                      onClick={() => onSelectProgram(program.id)}
                    >
                      <span className="truncate">{program.name}</span>
                      <StatusBadge
                        status={program.plmStatus}
                        size="sm"
                        userRole={UserRole.MERCHANT}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
