import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/shared/lib/utils";

export default function Field({
  className,
  ...props
}: Readonly<ComponentProps<"div">>): ReactElement {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}
