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
  discount?: number; // porcentaje (ej 10) o monto (según tu DB). Si es porcentaje, ajustamos abajo.
  units?: number | null;
  coverUrl: string;

  personajeId?: string | number | null;
  universoId?: string | number | null;
  proveedorId?: string | number | null;
}

export interface ProductCardD1Props {
  card: ProductLiteD1;
  className?: string;
  style?: React.CSSProperties;
}

function formatMoney(n: number) {
  // si quieres sin decimales: return `$${Math.round(n)}`
  return `$${Number(n).toFixed(0)}`;
}

// Si tu `discount` es porcentaje (0-100), usa esto.
// Si es monto fijo, dime y lo cambio.
function calcFinalPrice(price: number, discount?: number) {
  if (!discount) return { final: price, hasDiscount: false };
  const pct = Number(discount);
  if (!Number.isFinite(pct) || pct <= 0) return { final: price, hasDiscount: false };
  const final = price - (price * pct) / 100;
  return { final: Math.max(0, final), hasDiscount: true };
}

export const ProductCardD1: React.FC<ProductCardD1Props> = ({ card, className, style }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const productID = card.slug;
  const isFavorite = favorites.includes(productID);

  const { final, hasDiscount } = calcFinalPrice(card.price, card.discount);

  return (
    <div
      style={style}
      className={classNames(
        "group flex flex-col h-full bg-black relative border border-white/5 hover:border-white/20 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl",
        className
      )}
    >
      {/* Etiqueta superior */}
      <div className="absolute top-3 left-3 z-30">
        <span className="bg-white text-black text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-tighter shadow-[2px_2px_0px_rgba(0,0,0,1)] border border-black">
          Modelo
        </span>
      </div>

      {/* Favoritos */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(productID);
        }}
        className="absolute top-3 right-3 z-40 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300"
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <svg
          className={classNames(
            "w-4 h-4 transition-colors",
            isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-white hover:stroke-black"
          )}
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      {/* Link */}
      <a href={`/shop/${card.slug}`} className="flex flex-col h-full relative">
        {/* Imagen */}
        <div className="aspect-[3/4] overflow-hidden bg-[#111] relative">
          {card.coverUrl ? (
            <img
              src={card.coverUrl}
              alt={card.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-40"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
              Sin imagen
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 bg-black/20 backdrop-blur-[2px]">
            <div className="bg-white text-black font-black text-[11px] px-6 py-3 rounded-full uppercase tracking-[2px] shadow-[4px_4px_0px_#000] border-2 border-black transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              Ver Detalles
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col p-4 bg-black border-t border-white/5">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[2px] mb-1 italic">
                {card.subtitle || "Original Series"}
              </p>
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">
                {card.title}
              </h3>
            </div>

            <div className="text-right">
              {hasDiscount ? (
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[11px] font-black text-white/50 line-through italic">
                    {formatMoney(card.price)}
                  </span>
                  <span className="text-base font-black text-white italic">
                    {formatMoney(final)}
                  </span>
                </div>
              ) : (
                <p className="text-base font-black text-white italic">{formatMoney(card.price)}</p>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};