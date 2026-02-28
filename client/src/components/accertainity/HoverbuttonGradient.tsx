"use client";
import React from "react";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export function HoverBorderGradientDemo({ text }: { text: string }) {
  return (
    <div className=" flex justify-center text-center w-full mt-3">
      <HoverBorderGradient
        containerClassName="rounded-md w-full"
        as="button"
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 w-full"
      >

        <span className="text-center w-full">{text}</span>
      </HoverBorderGradient>
    </div>
  );
}