import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = 20 }) {
  return <Loader2 className={cn("animate-spin text-primary", className)} size={size} />;
}

export function PageLoader() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Spinner size={36} />
    </div>
  );
}
