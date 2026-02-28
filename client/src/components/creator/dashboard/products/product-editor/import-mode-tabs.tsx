"use client";



import { Tabs, TabsTrigger } from "@/components/ui/tabs";

import { TabsList } from "@radix-ui/react-tabs";

import { ReactNode } from "react";



export function ImportModeTabs({

  value,

  onValueChange,

  children,

}: {

  value: string;

  onValueChange: (v: string) => void;

  children: ReactNode;

}) {

  return (

    <Tabs value={value} onValueChange={onValueChange} className="space-y-5 ">

      <TabsList className="grid w-full max-w-xl grid-cols-2  border border-border  p-2 bg-transparent text-white rounded-full">

        <TabsTrigger

          className=" data-[state=active]:bg-pink-500 data-[state=active]:text-white text-white rounded-full"

          value="search"

        >

          Search

        </TabsTrigger>

        <TabsTrigger

         className=" data-[state=active]:bg-pink-500 data-[state=active]:text-white text-white rounded-full"

          value="scrape"

        >

          Quick Import (Scrape)

        </TabsTrigger>

      </TabsList>

      {children}

    </Tabs>

  );

}

