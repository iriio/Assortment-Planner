import React from "react";
import { PLMStatusStage } from "@/types";
import {
  getStatusDefinition,
  getAvailableStatusTransitions,
  canUserTransitionStatus,
} from "../../utils/statusSystem";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon,
  PencilIcon,
  ArrowUpRightIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
} from "./icons";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

interface StatusBadgeProps {
  status: PLMStatusStage;
  onStatusChange?: (newStatus: PLMStatusStage) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  iconOnly?: boolean;
  className?: string;
}

// Icon mapping for different PLM statuses
const statusIconMap = {
  [PLMStatusStage.DRAFT]: <PencilSquareIcon className="w-4 h-4" />,
  [PLMStatusStage.BRIEFING]: <BellIcon className="w-4 h-4" />,
  [PLMStatusStage.PLANNING]: <InformationCircleIcon className="w-4 h-4" />,
  [PLMStatusStage.READY_FOR_REVIEW]: (
    <ExclamationTriangleIcon className="w-4 h-4" />
  ),
  [PLMStatusStage.DESIGNING]: <PencilIcon className="w-4 h-4" />,
  [PLMStatusStage.FINALIZING]: <ArrowUpRightIcon className="w-4 h-4" />,
  [PLMStatusStage.HANDOFF]: <CheckCircleIcon className="w-4 h-4" />,
  [PLMStatusStage.LAUNCHED]: <CheckBadgeIcon className="w-4 h-4" />,
};

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  (
    {
      status,
      onStatusChange,
      size = "md",
      interactive = false,
      iconOnly = false,
      className = "",
    },
    ref
  ) => {
    const statusDef = getStatusDefinition(status);
    const availableTransitions = getAvailableStatusTransitions(status);
    const hasTransitions = availableTransitions.length > 0;
    const statusIcon = statusIconMap[status];

    // Size configurations
    const sizeConfig = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
      lg: "text-base px-3 py-1.5",
    };

    const handleStatusSelect = (newStatus: PLMStatusStage) => {
      if (canUserTransitionStatus(status, newStatus) && onStatusChange) {
        onStatusChange(newStatus);
      }
    };

    if (interactive && hasTransitions && onStatusChange) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge
              ref={ref}
              variant="outline"
              className={cn(
                "cursor-pointer hover:opacity-90 transition-all",
                statusDef.colorClass,
                statusDef.bgColorClass,
                sizeConfig[size],
                className
              )}
              title={`${statusDef.label} - ${statusDef.description}`}
            >
              {statusIcon}
              {!iconOnly && <span className="ml-1.5">{statusDef.label}</span>}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {availableTransitions.map((targetStatus) => {
              const targetDef = getStatusDefinition(targetStatus);
              const targetIcon = statusIconMap[targetStatus];
              return (
                <DropdownMenuItem
                  key={targetStatus}
                  onClick={() => handleStatusSelect(targetStatus)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {targetIcon}
                    <div>
                      <div className="font-medium">{targetDef.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {targetDef.description}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Non-interactive badge
    return (
      <Badge
        ref={ref}
        variant="outline"
        className={cn(
          statusDef.colorClass,
          statusDef.bgColorClass,
          sizeConfig[size],
          className
        )}
        title={`${statusDef.label} - ${statusDef.description}`}
      >
        {statusIcon}
        {!iconOnly && <span className="ml-1.5">{statusDef.label}</span>}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
