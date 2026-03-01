"use client";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import React from "react";

type Props = {
  text: string;
  as?: React.ElementType;
} & React.ComponentPropsWithoutRef<"button"> &
  React.ComponentPropsWithoutRef<"a">;

export function HoverBorderGradientDemo({
  text,
  as = "button",
  className,
  ...props
}: Props) {
  return (
    <HoverBorderGradient
      as={as}
      containerClassName="rounded-full"
      className={`dark:bg-black bg-white text-black dark:text-white 
      flex items-center justify-center h-10 text-xs cursor-pointer ${className}`}
      {...props}
    >
      {text}
    </HoverBorderGradient>
  );
}