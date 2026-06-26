import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Select HTML nativo: garantiza que el valor viaje en el FormData de un
 * Server Action sin las particularidades de render/asChild de Base UI.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-input bg-card px-3 py-2 text-sm transition-all outline-none",
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  );
}

export { NativeSelect };
