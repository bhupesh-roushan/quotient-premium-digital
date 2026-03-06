import { HeroParallaxDemo } from "@/components/accertainity/CanvasRevealEffect";
import { GlareCardDemo } from "@/components/accertainity/GalrehomeCardFooter";
import { HoverBorderGradientDemo } from "@/components/accertainity/sellingbutton";
import { FlipWordsDemo } from "@/components/auth/texteffect";
import BuyerSell from "@/components/buyer/common/buyer-shell";
import { BackgroundLines } from "@/components/ui/background-lines";
import { HomeProfileButton } from "./home-profile-button";
import { getMe } from "@/lib/auth/getMe";
import { apiServerGet } from "@/lib/api/server";

import Link from "next/link";

type PublicProduct = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  category?: string;
  coverUrl: string | null;
  allImageUrls: string[];
  stats?: {
    averageRating: number;
    reviewCount: number;
    soldCount: number;
    viewCount: number;
  };
  tags?: string[];
};

export default async function Home() {
  const me = await getMe();
  const user = me?.ok && me.user ? {
    id: me.user.id,
    name: me.user.name,
    email: me.user.email,
    photo: (me.user as any).photo,
    isCreator: me.user.isCreator,
  } : null;

  let parallaxProducts: { title: string; link: string; thumbnail: string }[] = [];
  try {
    const res = await apiServerGet<{ ok: boolean; products: PublicProduct[] }>("/api/products");
    if (res.ok && res.products.length > 0) {
      parallaxProducts = res.products
        .filter((p) => p.coverUrl || (p.allImageUrls && p.allImageUrls.length > 0))
        .slice(0, 15)
        .map((p) => ({
          title: p.title,
          link: `/discover/${p.slug}`,
          thumbnail: p.coverUrl || p.allImageUrls[0],
          price: p.price,
          category: p.category,
          description: p.description,
          averageRating: p.stats?.averageRating,
          reviewCount: p.stats?.reviewCount,
          soldCount: p.stats?.soldCount,
          tags: p.tags,
        }));
    }
  } catch {
    // silently fall through — parallaxProducts stays empty and section is hidden
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return (
    <BuyerSell>
      {/* Profile Button - Top Right Corner */}
      <HomeProfileButton initialUser={user} />

      {/* HERO */}
      <BackgroundLines className="relative flex items-center justify-center w-full min-h-screen bg-black text-white overflow-hidden px-6 lg:px-[8vw] ">
        {/* Floating Background Logos */}
        <div className="pointer-events-none absolute inset-0 z-10 ">
          <img
            src="./logowhite.svg"
            alt=""
            className="p-5 w-32 sm:w-40 lg:w-48   "
          />

          <img
            src="./logo.svg"
            alt="logo"
            className="hidden md:block absolute w-40 lg:w-48 top-48 right-10 lg:right-45 opacity-60"
          />

          <img
            src="./logo.svg"
            alt="logo"
            className="absolute w-36 md:w-44 top-28 left-[-10vw] md:left-[3vw] opacity-60"
          />

          <img
            src="./logo.svg"
            alt="logo"
            className="hidden sm:block absolute w-32 md:w-36 right-[-4vw] md:right-[6vw] opacity-60"
          />

          <img
            src="./logo.svg"
            alt="logo"
            className="absolute w-40 md:w-44 top-[60%] right-[-14vw] sm:-right-16 lg:-right-12 opacity-60"
          />

          <img
            src="./logo.svg"
            alt="logo"
            className="absolute w-44 md:w-56 top-[82%] -left-8 sm:left-12 md:-left-24 lg:-left-12 opacity-60"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-3xl text-center flex flex-col items-center gap-6 ">
          <FlipWordsDemo words={["better", "cute", "beautiful", "modern"]} />

          <p className="text-sm lg:text-lg max-w-md lg:max-w-3xl text-neutral-300">
            Anyone can earn their first rupee online. Start with what you
            already know, test what works, refine it, and get paid. It&apos;s
            simpler than you think.
          </p>

          <div className="mt-4 w-full max-w-[384px] flex justify-center">
            <Link href="/dashboard/products" className="cursor-pointer">
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold text-white transition-all bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm hover:bg-violet-500/20 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-0.5 cursor-pointer">
                Start Selling
              </button>
            </Link>
          </div>
        </div>
      </BackgroundLines>

      {/* Footer */}
      <footer className="bg-black py-24 px-10">
        <div className="sm:flex flex-row h-20 w-full items-center justify-evenly m-10 hidden ">
          <GlareCardDemo text="Hello 1" />
        </div>
        {parallaxProducts.length > 0 && (
          <div className="p-5 hidden sm:block">
            <HeroParallaxDemo products={parallaxProducts} />
          </div>
        )}
       

        {/* New Footer with Social Links */}
        <div className="relative py-8 px-4 sm:px-6 lg:px-8 border-t border-neutral-800/50 bg-neutral-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center md:items-start">
              {/* Brand */}
              <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <img 
                  src="/logowhite.svg" 
                  alt="Cloudwatch" 
                  className="h-8 w-auto mb-2"
                />
                <p className="text-neutral-400 text-sm">
                  AI-Powered Digital Creator Marketplace
                </p>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                <a
                  href="https://bhupesh.blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/roushanb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/bhupesh-roushan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-500/20"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com/roushanwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/50 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>

              {/* Contact */}
              <div className="text-center md:text-right flex flex-col items-center md:items-end">
                <p className="text-neutral-400 text-sm">
                  Built with passion and ❤️ by
                </p>
                <p className="text-white font-medium">
                  Bhupesh Roushan
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800/30 text-center">
              <p className="text-neutral-500 text-xs">
                © {currentYear} Cloudwatch. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </BuyerSell>
  );
}
