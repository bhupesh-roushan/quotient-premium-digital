import React from "react";
import { FlipWords } from "../ui/flip-words";

export function FlipWordsDemo({ words }: { words: string[] }) {
  const wordstext = ["₹0 to ₹1", "₹1 to ₹100", "₹100 to ₹1000"];

  return (
    <div className="h-20 flex justify-center items-center px-4">
      <div className="text-4xl mx-auto  font-bold text-white dark:text-neutral-400">
        Go From
        <FlipWords words={wordstext} className="text-pink-500"/>
        Instantly
      </div>
    </div>
  );
}
