import React, { useEffect } from "react";
import classNames from "classnames";

type Image = {
  url: string;
};

interface Props {
  images: Image[];
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

export const FullscreenGallery: React.FC<Props> = ({
  images,
  activeIndex,
  onClose,
  onChange,
}) => {

  // ESC para cerrar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="hidden lg:flex fixed inset-0 z-[999] bg-black/95 backdrop-blur-md items-center justify-center">

      {/* CLICK FUERA */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* CONTENIDO */}
      <div className="relative w-full max-w-[1200px] flex flex-col items-center gap-6 z-10">

        {/* IMAGEN */}
        <img
          src={images[activeIndex]?.url}
          className="max-h-[80vh] object-contain"
        />

        {/* THUMBNAILS */}
        <div className="flex gap-2 overflow-x-auto px-4">

          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={classNames(
                "w-20 aspect-[3/4] rounded-md overflow-hidden border",
                i === activeIndex
                  ? "border-white scale-105"
                  : "opacity-50"
              )}
            >
              <img
                src={img.url}
                className="w-full h-full object-cover"
              />
            </button>
          ))}

        </div>
      </div>

    </div>
  );
};