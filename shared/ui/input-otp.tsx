import type { ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";

const inputOTPSlotVariants = cva(
  "relative z-10 flex items-center justify-center rounded-md shadow-default text-sm transition-all outline-none aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "size-8",
        sm: "size-7 text-xs",
        lg: "size-9 text-base",
        xl: "size-10 text-base",
        "2xl": "size-12 text-lg",
      },
    },
    defaultVariants: { size: "default" },
  },
);
type InputOTPSize = NonNullable<
  VariantProps<typeof inputOTPSlotVariants>["size"]
>;

const inputOTPSizeContext = React.createContext<InputOTPSize>("default");

function InputOTP({
  className,
  containerClassName,
  ...props
}: Readonly<
  React.ComponentProps<typeof OTPInput> & {
    containerClassName?: string;
  }
>): ReactElement {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({
  className,
  size = "default",
  ...props
}: Readonly<
  React.ComponentProps<"div"> & { size?: InputOTPSize }
>): ReactElement {
  return (
    <inputOTPSizeContext.Provider value={size}>
      <div
        data-slot="input-otp-group"
        className={cn(
          "relative flex items-center gap-2 rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-2 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      >
        {props.children}
      </div>
    </inputOTPSizeContext.Provider>
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: Readonly<React.ComponentProps<"div"> & { index: number }>): ReactElement {
  const size = React.useContext(inputOTPSizeContext);
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        inputOTPSlotVariants({ size }),
        "data-[active=true]:ring-2 data-[active=true]:ring-brand/50",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({
  ...props
}: Readonly<React.ComponentProps<"div">>): ReactElement {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
