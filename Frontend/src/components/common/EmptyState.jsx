import React from "react";

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/40" />}
      <p className="font-medium text-muted-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground/80">{description}</p>}
      {action}
    </div>
  );
}