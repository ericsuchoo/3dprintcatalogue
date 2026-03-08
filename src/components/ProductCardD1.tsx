import React from "react";
import classNames from "classnames";
import { useFavorites } from "../context/FavoritesContext";

export interface ProductLiteD1 {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  discount?: number;
  units?: number | null;
  coverUrl: string;

  personajeId?: string | number | null;
  universoId?: string | number | null;
  proveedorId?: string | number | null;

  tagLabel?: string | null;
}

export interface ProductCardD1Props {
  card: ProductLiteD1;
  className?: string;
  style?: React.CSSProperties;
}

function formatMoney(n: number) {
  return `$${Number(n).toFixed(0)}`;
}

function calcFinalPrice(price: number, discount?: number) {
  if (!discount) return { final: price, hasDiscount: false };

  const pct = Number(discount);
  if (!Number.isFinite(pct) || pct <= 0) return { final: price, hasDiscount: false };

  const final = price - (price * pct) / 100;

  return {
    final: Math.max(0, final),
    hasDiscount: true,
  };
}

export const ProductCardD1: React.FC<ProductCardD1Props> = ({
  card,
  className,
  style,
}) => {
  const { favorites, toggleFavorite } = useFavorites();

  const productID = card.slug;
  const isFavorite = favorites.includes(productID);

  const { final, hasDiscount } = calcFinalPrice(card.price, card.discount);

  return (
    <div
      style={style}
      className={classNames(
        "group flex flex-col h-full bg-black relative border border-white/5 hover:border-red-500/60 hover:-translate-y-1 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl",
        className
      )}
    >
      {/* FAVORITE BUTTON */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(productID);
        }}
        className="absolute top-3 right-3 z-40 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300"
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <svg
          className={classNames(
            "w-4 h-4 transition-colors",
            isFavorite
              ? "fill-red-500 stroke-red-500"
              : "fill-none stroke-white hover:stroke-black"
          )}
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      <a href={`/shop/${card.slug}`} className="flex flex-col h-full relative">
        <div className="aspect-[3/4] overflow-hidden bg-[#111] relative">
          {/* IMAGE */}
          {card.coverUrl ? (
            <img
              src={card.coverUrl}
              alt={card.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-60"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
              Sin imagen
            </div>
          )}

          {/* TAG LABEL */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.18em] rounded-md border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]">
              {card.tagLabel || "FIGURA 3D"}
            </span>
          </div>

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500" />

          {/* HOVER CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 bg-black/25 backdrop-blur-[2px]">
            <div className="bg-red-500 text-white font-black text-[11px] px-6 py-3 rounded-full uppercase tracking-[2px] shadow-[0_0_20px_rgba(239,68,68,0.35)] border border-red-400 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              Ver detalles
            </div>
          </div>
        </div>

        {/* CARD FOOTER */}
        <div className="flex flex-col p-4 bg-black border-t border-white/5">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[2px] mb-1 italic truncate">
                {card.subtitle || "Premium Series"}
              </p>

              <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight line-clamp-2">
                {card.title}
              </h3>
            </div>

            <div className="text-right shrink-0">
              {hasDiscount ? (
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[11px] font-black text-white/50 line-through italic mb-1">
                    {formatMoney(card.price)}
                  </span>

                  <span className="text-base font-black text-white italic">
                    {formatMoney(final)}
                  </span>
                </div>
              ) : (
                <p className="text-base font-black text-white italic">
                  {formatMoney(card.price)}
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};