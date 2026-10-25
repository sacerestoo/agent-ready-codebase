import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ClassName = string | null | undefined;

export const cn = (...inputs: readonly ClassName[]): string =>
  twMerge(clsx(...inputs));
