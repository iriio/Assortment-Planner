import React, { useState, useEffect } from "react";
import { CheckCircleIcon, CloudArrowUpIcon } from "./icons";

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date;
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving = false,
  lastSaved,
  className = "",
}) => {
  const [showSaving, setShowSaving] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (isSaving) {
      setShowSaving(true);
      const timer = setTimeout(() => setShowSaving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 60) {
        setTimeAgo("just now");
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        setTimeAgo(`${diffHours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (showSaving) {
    return (
      <div
        className={`flex items-center space-x-1 text-xs text-sky-600 ${className}`}
      >
        <CloudArrowUpIcon className="w-3 h-3 animate-pulse" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved && timeAgo) {
    return (
      <div
        className={`flex items-center space-x-1 text-xs text-slate-500 ${className}`}
      >
        <CheckCircleIcon className="w-3 h-3 text-green-500" />
        <span>Saved {timeAgo}</span>
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicator;
