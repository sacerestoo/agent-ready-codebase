import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/shared/lib/utils";

export default function InputGroup({
  className,
  ...props
}: Readonly<ComponentProps<"div">>): ReactElement {
  return (
    <div
      role="group"
      data-slot="input-group"
      className={cn(
        "flex min-h-10 w-full items-center rounded-lg border border-input bg-background px-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}
