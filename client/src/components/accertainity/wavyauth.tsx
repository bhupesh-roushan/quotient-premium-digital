"use client";
import React from "react";
import { WavyBackground } from "../ui/wavy-background";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-4xl  mx-auto pb-40">
     
    
      <div className="flex items-center justify-center p-5">
      <img src="./logowhite.svg" alt="" />
     </div>
     <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold inter-var text-center">
        Get Your Digital Life Back
      </p>
    </WavyBackground>
  );
}
