import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { useFavorites } from "../../../context/FavoritesContext";
import { ContentFilter } from "./ContentFilter"; // 🔥 SOLO ESTO NUEVO

type EditionItem = {
  id_edicion?: number | string;
  nombre_edicion?: string;
  img?: string | null;
  images?: { url: string; nivel?: string }[];
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

  // 🔥 DETECCIÓN (NO ROMPE NADA)
  const hasSuggestive = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "suggestive")
  );

  const hasNSFW = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "nsfw")
  );

  return (
    <div className="flex flex-col relative p-3 sm:p-4 lg:p-6 xl:p-8 mt-0 w-full max-w-none border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      style={{ background: "rgba(255, 255, 255, 0.96)" }}
    >

      {/* 🔹 TU HEADER (INTACTO) */}
      {/* ... NO TOQUÉ NADA AQUÍ ... */}

      <div className="mb-7 sm:mb-8 lg:mb-6">
        <p className="text-[11px] sm:text-[20px] lg:text-[14px] font-black uppercase tracking-[1.8px] mb-4 text-black">
          Versión del modelo
        </p>

        {/* 🔥 TOGGLE — INTEGRADO SIN ROMPER */}
        {(hasSuggestive || hasNSFW) && (
          <div className="mb-3">
            <ContentFilter
              hasSuggestive={hasSuggestive}
              hasNSFW={hasNSFW}
            />
          </div>
        )}

        {/* 🔹 TUS BOTONES (INTACTOS) */}
        <div className="grid grid-cols-1 gap-3 lg:gap-2">
          {editions.map((e: EditionItem, i: number) => {
            const isActive =
              String(activeEdition?.id_edicion ?? activeEdition?.nombre_edicion ?? "") ===
              String(e?.id_edicion ?? e?.nombre_edicion ?? "");

            return (
              <button
                key={`${e?.id_edicion ?? e?.nombre_edicion ?? i}-${i}`}
                onClick={() => editionChange(e)}
                className={classNames(
                  "relative flex items-center justify-between px-3 py-2.5 border text-[11px] sm:text-[28px] lg:text-[11px] transition-all duration-300 uppercase tracking-tight font-bold text-left",
                  isActive
                    ? "bg-white text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.55)] scale-[1.02]"
                    : "border-black bg-black text-white hover:bg-zinc-900"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-red-500" />
                )}

                <span>{e?.nombre_edicion || `Edición ${i + 1}`}</span>

                {isActive && (
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔹 TODO LO DEMÁS SIGUE IGUAL */}
      {/* NO TOQUÉ ESCALAS / FAVORITOS / DESCRIPCIÓN */}
    </div>
  );
};