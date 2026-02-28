"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
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

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig,
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig,
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig,
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig,
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig,
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig,
  );
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
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20 ">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row  mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 ">
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
        <div className="relative h-full w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-lg transition-all duration-300 group-hover/product:border-violet-500/50">
          
          {imgError ? (
            <div className="h-full w-full flex items-center justify-center bg-neutral-800">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{product.title.charAt(0)}</span>
              </div>
            </div>
          ) : (
            <>
              <img
                src={product.thumbnail}
                className="object-cover h-full w-full transition-transform duration-500 group-hover/product:scale-105"
                alt={product.title}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-medium text-sm">
              {product.title}
            </h3>
          </div>
          
          <div className="absolute top-3 right-3 bg-violet-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/product:opacity-100 transition-opacity">
            View
          </div>
        </div>
      </a>
    </motion.div>
  );
};
