"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from "motion/react";

export const HeroParallax = ({
  products,
}: {
  products: {
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
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const translateX = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const translateXReverse = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const rotateX = useTransform(scrollYProgress, [0, 0.2], [12, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0.3, 1]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.2], [-500, 300]);
  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden  antialiased relative flex flex-col self-auto perspective-[1000px] transform-3d "
    >
      <Header />
      
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div style={{ willChange: "transform" }} className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div style={{ willChange: "transform" }} className="flex flex-row mb-20 space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div style={{ willChange: "transform" }} className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-10 md:py-16 px-4 w-full left-0 top-0 text-center z-10">
      <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50">
        <span className="text-neutral-400 text-sm font-medium">
          <span className="text-emerald-400">✦</span> Trusted by 10,000+ creators
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
        Premium Digital
        <br />
        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          Products
        </span>
      </h1>
      <p className="max-w-2xl mx-auto text-neutral-400 text-lg md:text-xl mt-6 leading-relaxed">
        Discover high-quality templates, AI tools, and digital assets designed to elevate your creative work
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
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
  translate: MotionValue<number>;
}) => {
  const [imgError, setImgError] = React.useState(false);
  
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      key={product.title}
      className="group/product h-48 sm:h-72 2xl:h-80 w-[18rem] sm:w-[24rem] 2xl:w-md relative shrink-0"
    >
      <a href={product.link} className="block h-full w-full">
        {/* Outer glow ring */}
        <div className="relative h-full w-full rounded-2xl border border-white/10 group-hover/product:border-violet-500/40 transition-all duration-500 shadow-xl group-hover/product:shadow-violet-500/20 overflow-hidden">
          <div className="relative h-full w-full rounded-2xl overflow-hidden bg-neutral-900">

            {imgError ? (
              <div className="h-full w-full flex items-center justify-center bg-white/5 backdrop-blur-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span className="text-xl font-bold text-white">{product.title.charAt(0)}</span>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={product.thumbnail}
                  className="object-cover h-full w-full transition-transform duration-700 group-hover/product:scale-110 opacity-90 group-hover/product:opacity-100"
                  alt={product.title}
                  onError={() => setImgError(true)}
                />
                {/* Bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Top fade */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
              </>
            )}

            {/* Glass label bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 border-t border-white/10 transition-all duration-300">
              {/* Category badge */}
              {product.category && (
                <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/30 border border-violet-400/30 text-violet-300 uppercase tracking-wide">
                  {product.category.replace(/-/g, ' ')}
                </span>
              )}
              <h3 className="text-white font-semibold text-sm drop-shadow-md leading-tight line-clamp-1 mb-1">
                {product.title}
              </h3>
              {product.description && (
                <p className="text-white/50 text-xs line-clamp-1 leading-snug opacity-0 group-hover/product:opacity-100 transition-opacity duration-300">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                {product.price !== undefined && (
                  <p className="text-xs font-semibold text-emerald-400 drop-shadow">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                )}
                {product.averageRating !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white/70 text-xs">
                      {product.averageRating.toFixed(1)}
                      {product.reviewCount && ` (${product.reviewCount})`}
                    </span>
                  </div>
                )}
              </div>
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/10 text-white/60 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-white/40 border border-white/5">
                      +{product.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* View pill */}
            <div className="absolute top-3 right-3 bg-black/60 border border-white/20 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover/product:opacity-100 transition-all duration-300 shadow-lg">
              View →
            </div>

            {/* Corner shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover/product:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10" />
          </div>
        </div>
      </a>
    </motion.div>
  );
};
