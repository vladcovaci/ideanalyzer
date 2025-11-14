import { cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SlotProps = {
  children?: ReactNode;
  className?: string;
} & Record<string, unknown>;

export function Slot({ children, className, ...props }: SlotProps): ReactNode {
  if (!isValidElement(children)) {
    return children;
  }

  const childClassName = (children.props as { className?: string }).className;

  return cloneElement(children, {
    ...props,
    className: cn(childClassName, className),
  } as HTMLAttributes<HTMLElement>);
}
