import { PLMStatusStage } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PLMStatusStage;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusColor = (status: PLMStatusStage) => {
    switch (status) {
      case PLMStatusStage.DRAFT:
        return "bg-gray-100 text-gray-700";
      case PLMStatusStage.IN_REVIEW:
        return "bg-blue-100 text-blue-700";
      case PLMStatusStage.APPROVED:
        return "bg-green-100 text-green-700";
      case PLMStatusStage.ARCHIVED:
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        getStatusColor(status),
        size === "sm" ? "text-xs" : "text-sm"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
