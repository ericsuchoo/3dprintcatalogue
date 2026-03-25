import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { useFavorites } from "../../../context/FavoritesContext";
import { ContentFilter } from "./ContentFilter"; // 🔥 NUEVO

type EditionItem = {
  id_edicion?: number | string;
  nombre_edicion?: string;
  img?: string | null;
  images?: { url: string; nivel?: string }[]; // 🔥 soporte nivel
};

type ScaleItem = {
  id_escala?: number | string;
  nombre_escala?: string;
  descripcion?: string;
  disponible?: boolean;
};

interface Props {
  meta: any;
  activeEdition: EditionItem | null;
  editionChange: (e: EditionItem) => void;
}

export const Details: React.FC<Props> = ({ meta, activeEdition, editionChange }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const [activeScale, setActiveScale] = useState<ScaleItem | null>(null);

  const favoriteId = meta?.model_id || meta?.slug || String(meta?.id_producto ?? "");
  const isFavorite = favorites.includes(favoriteId);

  const editions = useMemo<EditionItem[]>(() => {
    return Array.isArray(meta?.editions) ? meta.editions : [];
  }, [meta]);

  const scales = useMemo<ScaleItem[]>(() => {
    return Array.isArray(meta?.scales) ? meta.scales : [];
  }, [meta]);

  // 🔥 DETECCIÓN REAL DE CONTENIDO
  const hasSuggestive = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "suggestive")
  );

  const hasNSFW = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "nsfw")
  );

  const priceInfo = useMemo(() => {
    const rawPrice = meta?.price;
    const numericPrice =
      rawPrice === null || rawPrice === undefined || Number.isNaN(Number(rawPrice))
        ? null
        : Number(rawPrice);

    const mode =
      meta?.priceMode ??
      (numericPrice !== null && numericPrice > 0 ? "fixed" : "quote");

    if (mode === "quote" || numericPrice === null || numericPrice <= 0) {
      return {
        label: "Cotizar",
        isQuote: true,
        helper: "El precio final depende de escala, acabado y complejidad del modelo.",
      };
    }

    if (mode === "from") {
      return {
        label: `Desde $${numericPrice.toFixed(0)}`,
        isQuote: false,
        helper: "Precio base estimado. Puede variar según versión, escala y acabado.",
      };
    }

    return {
      label: `$${numericPrice.toFixed(0)}`,
      isQuote: false,
      helper: null,
    };
  }, [meta]);

  const activeScaleDescription =
    activeScale?.descripcion ||
    scales.find((s) => s.disponible)?.descripcion ||
    scales[0]?.descripcion ||
    "";

  return (
    <div
      className="flex flex-col relative p-3 sm:p-4 lg:p-6 xl:p-8 mt-0 w-full max-w-none border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      style={{ background: "rgba(255, 255, 255, 0.96)" }}
    >
      <div className="flex flex-col mb-6 sm:mb-7 lg:mb-5">
        <h1 className="text-[24px] sm:text-[34px] lg:text-[28px] font-bold tracking-tighter leading-tight text-black mb-4 uppercase">
          <span className="block w-full px-3 py-2.5 border-2 border-red-500 bg-white text-black shadow-[0_0_8px_rgba(239,68,68,0.35)]">
            {meta?.title || meta?.nombre_producto || "Producto"}
          </span>
        </h1>

        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 gap-3">
          <span className="text-[10px] font-medium text-black uppercase tracking-[0.18em]">
            Ref: {meta?.model_id || meta?.id_producto || "3D-DC"}
          </span>

          <span className={classNames(
            priceInfo.isQuote
              ? "text-[18px] font-black uppercase text-[#00b7ff]"
              : "text-[20px] font-light text-black"
          )}>
            {priceInfo.label}
          </span>
        </div>

        {priceInfo.helper && (
          <div className="mt-3 text-[12px] text-zinc-500 italic">
            {priceInfo.helper}
          </div>
        )}
      </div>

      {/* 🔥 VERSIONES */}
      <div className="mb-7">
        <p className="text-[14px] font-black uppercase tracking-[1.8px] mb-4 text-black">
          Versión del modelo
        </p>

        {/* 🔥 AQUÍ APARECE EL TOGGLE */}
        {(hasSuggestive || hasNSFW) && (
          <ContentFilter
            hasSuggestive={hasSuggestive}
            hasNSFW={hasNSFW}
          />
        )}

        <div className="grid grid-cols-1 gap-3 mt-3">
          {editions.map((e: EditionItem, i: number) => {
            const isActive =
              String(activeEdition?.id_edicion ?? "") ===
              String(e?.id_edicion ?? "");

            return (
              <button
                key={i}
                onClick={() => editionChange(e)}
                className={classNames(
                  "relative flex items-center justify-between px-3 py-2.5 border text-[11px] uppercase font-bold",
                  isActive
                    ? "bg-white text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.55)]"
                    : "border-black bg-black text-white"
                )}
              >
                {e?.nombre_edicion}
              </button>
            );
          })}
        </div>
      </div>

      {/* resto igual */}
      {/* ... NO TOQUÉ TU CÓDIGO DE ESCALAS / FAVORITOS / DESCRIPCIÓN */}
    </div>
  );
};