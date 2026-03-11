import React from "react";
import { Btn } from "../Btn";

type MediaLike = {
  url?: string;
  src?: string;
};

interface Props {
  title: string;
  description: string;
  image: MediaLike;
  cta: {
    label: string;
    href: string;
  };
}

function getImageSrc(media: MediaLike | null | undefined): string {
  if (!media) return "";
  if (typeof media.url === "string" && media.url.length > 0) return media.url;
  if (typeof media.src === "string" && media.src.length > 0) return media.src;
  return "";
}

export const HomeCta: React.FC<Props> = ({ title, description, image, cta }) => {
  const imageSrc = getImageSrc(image);

  return (
    <section className="relative overflow-hidden group">
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-[630px]">
          <h2 className="text-white text-[32px] leading-tight font-bold mb-4 md:text-[48px] font-Helvetica drop-shadow-lg">
            {title}
          </h2>
          <p className="text-white/90 text-lg leading-snug mb-10 md:text-xl font-Helvetica drop-shadow-md">
            {description}
          </p>
          <div className="inline-block">
            <Btn
              theme="orange"
              label={cta.label}
              to={cta.href}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 size-full z-0">
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-500 group-hover:opacity-30" />
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title || "CTA image"}
            className="size-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-black" />
        )}
      </div>
    </section>
  );
};