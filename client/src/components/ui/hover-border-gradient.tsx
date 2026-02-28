"use client";
import React, { useState, useEffect, useRef } from "react";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

function rotateDirection(direction: Direction): Direction {
  switch (direction) {
    case "TOP":
      return "LEFT";
    case "LEFT":
      return "BOTTOM";
    case "BOTTOM":
      return "RIGHT";
    case "RIGHT":
      return "TOP";
    default:
      return "TOP";
  }
}

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("TOP");
  
  const highlight =
    "radial-gradient(75% 181.15942028985506% at 50% 50%, #7C3AED 0%, #EC4899 45%, rgba(236, 72, 153, 0) 100%)";

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(75% 181.15942028985506% at 50% 0%, #7C3AED 0%, #EC4899 45%, rgba(236, 72, 153, 0) 100%)",
    LEFT: "radial-gradient(75% 181.15942028985506% at 0% 50%, #7C3AED 0%, #EC4899 45%, rgba(236, 72, 153, 0) 100%)",
    BOTTOM: "radial-gradient(75% 181.15942028985506% at 50% 100%, #7C3AED 0%, #EC4899 45%, rgba(236, 72, 153, 0) 100%)",
    RIGHT: "radial-gradient(75% 181.15942028985506% at 100% 50%, #7C3AED 0%, #EC4899 45%, rgba(236, 72, 153, 0) 100%)",
  };

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return React.createElement(
    Tag,
    {
      onMouseEnter: (event: React.MouseEvent<HTMLDivElement>) => {
        setHovered(true);
      },
      onMouseLeave: () => setHovered(false),
      className: cn(
        "relative flex rounded-full border  content-center  transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px box-decoration-clone w-fit",
        containerClassName
      ),
      ...props,
    },
    <>
      <div
        className={cn(
          "w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-black absolute z-1 flex-none inset-0.5 rounded-[100px]" />
    </>
  );
}
