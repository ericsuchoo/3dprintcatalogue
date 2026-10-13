import React from "react";
import classNames from "classnames";
import { useFavorites } from "../context/FavoritesContext";

export interface ProductLiteD1 {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number | null;
  priceMode?: "fixed" | "from" | "quote" | null;
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
  if (!Number.isFinite(pct) || pct <= 0) {
    return { final: price, hasDiscount: false };
  }

  const final = price - (price * pct) / 100;

  return {
    final: Math.max(0, final),
    hasDiscount: true,
  };
}

function getPricePresentation(card: ProductLiteD1) {
  const mode = card.priceMode ?? (card.price && Number(card.price) > 0 ? "fixed" : "quote");
  const hasNumericPrice =
    card.price !== null &&
    card.price !== undefined &&
    Number.isFinite(Number(card.price)) &&
    Number(card.price) > 0;

  if (mode === "quote" || !hasNumericPrice) {
    return {
      label: "",
      isQuote: true,
      isFrom: false,
      showDiscount: false,
      originalPrice: null as number | null,
      finalPrice: null as number | null,
    };
  }

  if (mode === "from") {
    return {
      label: `Desde ${formatMoney(Number(card.price))}`,
      isQuote: false,
      isFrom: true,
      showDiscount: false,
      originalPrice: Number(card.price),
      finalPrice: Number(card.price),
    };
  }

  const numericPrice = Number(card.price);
  const { final, hasDiscount } = calcFinalPrice(numericPrice, card.discount);

  return {
    label: formatMoney(hasDiscount ? final : numericPrice),
    isQuote: false,
    isFrom: false,
    showDiscount: hasDiscount,
    originalPrice: numericPrice,
    finalPrice: hasDiscount ? final : numericPrice,
  };
}

export const ProductCardD1: React.FC<ProductCardD1Props> = ({
  card,
  className,
  style,
}) => {
  const { favorites, toggleFavorite } = useFavorites();
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });

  const productID = card.slug;
  const isFavorite = favorites.includes(productID);

  const priceInfo = getPricePresentation(card);

  return (
    <div
      style={style}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
      }}
      className={classNames(
        "group flex flex-col h-full bg-black relative border border-white/10 hover:border-[#00eeff]/70 hover:-translate-y-1.5 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,238,255,0.15), transparent 40%)`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#00eeff]/20 via-transparent to-red-500/20" />
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(0,238,255,0.08),0_0_28px_rgba(239,68,68,0.10)]" />
      </div>

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

      <a
  href={`/shop/${card.slug}?id=${encodeURIComponent(String(card.id))}`}
  className="flex flex-col h-full relative z-10"
>
        <div className="aspect-[2/3] overflow-hidden bg-[#111] relative">
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

          <div className="absolute bottom-3 left-3 z-20 pointer-events-none md:group-hover:opacity-0 md:group-focus-within:opacity-0 transition-opacity">
            <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.18em] rounded-md border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]">
              {card.tagLabel || "FIGURA 3D"}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500" />

          {/* Vista rápida glass: visible solo con hover o foco de teclado */}
          <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center bg-black/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
            <div className="w-[min(88%,340px)] translate-y-2 transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
              <div className="relative rounded-xl border border-white/25 bg-[#111318]/75 px-4 pb-3 pt-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <h3 className="absolute inset-x-2 top-0 -translate-y-1/2 rounded-md bg-[#111318]/90 px-2 py-1 text-center text-[clamp(13px,1.25vw,20px)] font-black uppercase italic leading-tight tracking-tight text-[#D8B76C] drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] line-clamp-2">
                  {card.title}
                </h3>
                <p className="mt-2 text-[clamp(12px,1vw,16px)] font-bold uppercase tracking-[0.10em] text-[#00DFF2] line-clamp-2">
                  {card.subtitle || "Premium Series"}
                </p>
                <div className="mt-3 rounded-lg bg-[#E63843] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_0_16px_rgba(230,56,67,0.25)]">
                  Ver detalles ↗
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  {card.tagLabel || "FIGURA 3D"}
                </p>
              </div>
            </div>
          </div>
        </div>

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
              {priceInfo.showDiscount && priceInfo.originalPrice !== null ? (
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[11px] font-black text-white/50 line-through italic mb-1">
                    {formatMoney(priceInfo.originalPrice)}
                  </span>

                  <span className="text-base font-black text-white italic">
                    {priceInfo.label}
                  </span>
                </div>
              ) : (
                <p
                  className={classNames(
                    "text-base font-black italic",
                    priceInfo.isQuote
                      ? "text-[#00eeff] drop-shadow-[0_0_8px_rgba(0,238,255,0.28)]"
                      : priceInfo.isFrom
                        ? "text-red-400"
                        : "text-white"
                  )}
                >
                  {priceInfo.label}
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};