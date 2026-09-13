import React from "react";

function PostedJobCard({ props }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-surface p-2.5 transition-all duration-300 hover:border-primary/40 hover:bg-surface-hover hover:shadow-md cursor-pointer">
      <div className="text-sm font-semibold text-heading truncate">
        {props?.jobTitle}
      </div>

      <div className="mt-1 text-xs text-muted flex items-center gap-1">
        <span>📍</span> <span>{props?.location}</span>
      </div>

      <div className="mt-1 text-xs text-muted flex items-center gap-1">
        <span>🕒</span> <span>{props?.posted || props?.lastEdited}</span>
      </div>
    </div>
  );
}

export default PostedJobCard;