import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { useFavorites } from "../../../context/FavoritesContext";
import { ContentFilter } from "./ContentFilter";

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

  const editions = useMemo(() => Array.isArray(meta?.editions) ? meta.editions : [], [meta]);
  const scales = useMemo(() => Array.isArray(meta?.scales) ? meta.scales : [], [meta]);

  // 🔥 DETECCIÓN REAL
  const hasSuggestive = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "suggestive")
  );

  const hasNSFW = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "nsfw")
  );

  return (
    <div className="flex flex-col relative p-4 bg-white/95 border border-black/10 shadow">
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        {meta?.title}
      </h1>

      <p className="text-xs mb-4">
        Versión del modelo
      </p>

      {/* 🔥 TOGGLE */}
      {(hasSuggestive || hasNSFW) && (
        <ContentFilter
          hasSuggestive={hasSuggestive}
          hasNSFW={hasNSFW}
        />
      )}

      <div className="mt-3 space-y-2">
        {editions.map((e: EditionItem, i: number) => {
          const isActive =
            String(activeEdition?.id_edicion ?? "") ===
            String(e?.id_edicion ?? "");

          return (
            <button
              key={i}
              onClick={() => editionChange(e)}
              className={classNames(
                "px-3 py-2 text-xs font-bold uppercase",
                isActive ? "bg-white border-red-500 border" : "bg-black text-white"
              )}
            >
              {e.nombre_edicion}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => toggleFavorite(favoriteId)}
        className="mt-4 border py-2"
      >
        {isFavorite ? "En favoritos" : "Añadir a favoritos"}
      </button>
    </div>
  );
};