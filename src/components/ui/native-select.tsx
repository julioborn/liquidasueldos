import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Select HTML nativo (no el primitive de Base UI): garantiza que el valor
 * viaje en el FormData de un Server Action sin las particularidades de
 * render/asChild que ya vimos en Button.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  );
}

export { NativeSelect };
