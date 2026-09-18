"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import {
  cloudinaryCardLoader,
  cloudinaryHeroLoader,
  cloudinaryLqipUrl,
} from "@/src/lib/cloudinary-image";
import { cn } from "@/lib/utils";

type TestLandingMediaProps = {
  src: string;
  alt: string;
  sizes: string;
  variant: "hero" | "card";
  priority?: boolean;
  skeletonTone?: "dark" | "light";
  className?: string;
  imageClassName?: string;
};

export function TestLandingMedia({
  src,
  alt,
  sizes,
  variant,
  priority = false,
  skeletonTone = "dark",
  className,
  imageClassName,
}: TestLandingMediaProps) {
  const isLightSkeleton = skeletonTone === "light";
  const reduceMotion = useReducedMotion();
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const lqip = cloudinaryLqipUrl(src);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden",
        isLightSkeleton ? "bg-stone-100" : "bg-sky-950",
        className,
      )}
      style={
        loaded
          ? undefined
          : {
              backgroundImage: `url(${lqip})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
      }
    >
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        loader={variant === "hero" ? cloudinaryHeroLoader : cloudinaryCardLoader}
        onLoad={handleLoad}
        className={cn(
          isLightSkeleton ? "object-contain" : "object-cover",
          variant === "hero" || reduceMotion
            ? "opacity-100"
            : cn(
                "transition-[opacity,transform] duration-500 ease-out",
                loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]",
              ),
          imageClassName,
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          reduceMotion
            ? loaded
              ? "hidden"
              : "opacity-100"
            : cn(
                "transition-opacity duration-500 ease-out",
                loaded ? "opacity-0" : "opacity-100",
              ),
        )}
        aria-hidden
      >
        <div
          className={cn(
            "absolute inset-0",
            isLightSkeleton
              ? "animate-pulse bg-stone-200/45"
              : variant === "hero"
                ? "bg-sky-950/25"
                : "bg-sky-950/30",
          )}
        />
        {!reduceMotion ? (
          <div
            className={cn(
              "test-landing-media-shimmer",
              isLightSkeleton && "test-landing-media-shimmer-light",
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
