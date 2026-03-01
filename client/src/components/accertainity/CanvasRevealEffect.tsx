"use client";
import React from "react";
import { HeroParallax } from "../ui/hero-parallax";

type ParallaxProduct = {
  title: string;
  link: string;
  thumbnail: string;
  price?: number;
  category?: string;
  description?: string;
  averageRating?: number;
  reviewCount?: number;
  soldCount?: number;
  tags?: string[];
};

export function HeroParallaxDemo({ products }: { products: ParallaxProduct[] }) {
  return <HeroParallax products={products} />;
}

