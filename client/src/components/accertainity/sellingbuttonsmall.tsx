"use client";
import React from "react";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export function HoverBorderGradientDemoSmall({ text }: { text: string }) {
  return (
    <div className=" flex justify-center  text-center items-center w-full">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black bg-white text-black dark:text-white 
          flex items-center justify-center w-20 h-8 text-xs cursor-pointer"
      >
        <p>{text}</p>
      </HoverBorderGradient>
    </div>
  );
}
