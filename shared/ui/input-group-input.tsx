import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/shared/lib/utils";
import Input from "@/shared/ui/input";

export default function InputGroupInput({
  className,
  ...props
}: Readonly<ComponentProps<"input">>): ReactElement {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}
