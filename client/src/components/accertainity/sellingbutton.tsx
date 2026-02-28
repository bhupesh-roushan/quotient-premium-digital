// "use client";
// import { HoverBorderGradient } from "../ui/hover-border-gradient";

// export function HoverBorderGradientDemo({text}: {text: string}) {
//   return (
//     <div className=" flex justify-center  text-center items-center w-full">
//       <HoverBorderGradient
//         containerClassName="rounded-full "
//         as="button"
//         className="dark:bg-black bg-white text-black dark:text-white 
// flex items-center justify-center w-30 h-10 text-xs cursor-pointer"
//       >
   
//         <p>{text}</p>
//       </HoverBorderGradient>
//     </div>
//   );
// }



// "use client";
// import { HoverBorderGradient } from "../ui/hover-border-gradient";
// import React from "react";

// type Props = {
//   text: string;
// } & React.ButtonHTMLAttributes<HTMLButtonElement>;

// export function HoverBorderGradientDemo({ text, ...props }: Props) {
//   return (
//     <HoverBorderGradient
//       as="button"
//       containerClassName="rounded-full"
//       className="dark:bg-black bg-white text-black dark:text-white 
//       flex items-center justify-center w-30 h-10 text-xs cursor-pointer"
//       {...props}
//     >
//       {text}
//     </HoverBorderGradient>
//   );
// }


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