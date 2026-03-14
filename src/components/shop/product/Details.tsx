import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { useFavorites } from "../../../context/FavoritesContext";

type EditionItem = {
  id_edicion?: number | string;
  nombre_edicion?: string;
  img?: string | null;
  images?: { url: string }[];
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

  const priceLabel = useMemo(() => {
    const p = meta?.price;
    if (p === null || p === undefined || Number.isNaN(Number(p))) return null;
    return `$${Number(p).toFixed(2)}`;
  }, [meta]);

  const activeScaleDescription =
    activeScale?.descripcion ||
    scales.find((s: ScaleItem) => s.disponible)?.descripcion ||
    scales[0]?.descripcion ||
    "";

  return (
    <div
      className="flex flex-col relative p-3 sm:p-4 lg:p-6 xl:p-8 mt-0 w-full max-w-none min-h-[620px] sm:min-h-[880px] lg:min-h-0 border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      style={{ background: "rgba(255,255,255,0.96)" }}
    >
      <div className="flex flex-col mb-6 sm:mb-7 lg:mb-5">
        <h1
          className="text-[26px] sm:text-[36px] lg:text-[28px] font-bold tracking-tighter leading-tight text-black mb-4 uppercase"
          style={{ textAlign: "center", fontFamily: "Voga-Medium, sans-serif" }}
        >
          <span className="block w-full px-3 py-2.5 border-2 border-red-500 bg-white">
            {meta?.title || meta?.nombre_producto || "Producto"}
          </span>
        </h1>

        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <span className="text-[11px] sm:text-[20px] lg:text-[12px] uppercase tracking-[0.18em]">
            Ref: {meta?.model_id || meta?.id_producto || "3D-DC"}
          </span>

          <span className="text-[20px] sm:text-[26px] lg:text-[20px] font-light whitespace-nowrap">
            {priceLabel ?? ""}
          </span>
        </div>
      </div>

      <div className="mb-7 sm:mb-8 lg:mb-6">
        <p className="text-[12px] sm:text-[22px] lg:text-[14px] font-black uppercase tracking-[1.8px] mb-4">
          Versión del modelo
        </p>

        <div className="grid grid-cols-1 gap-3 lg:gap-2">
          {editions.length ? (
            editions.map((e: EditionItem, i: number) => {
              const isActive =
                String(activeEdition?.id_edicion ?? activeEdition?.nombre_edicion ?? "") ===
                String(e?.id_edicion ?? e?.nombre_edicion ?? "");

              return (
                <button
                  key={`${e?.id_edicion ?? e?.nombre_edicion ?? i}-${i}`}
                  onClick={() => editionChange(e)}
                  className={classNames(
                    "relative flex items-center justify-between px-3 py-2.5 border text-[12px] sm:text-[20px] lg:text-[12px] uppercase font-bold",
                    isActive
                      ? "bg-white text-black border-red-500 shadow"
                      : "border-black bg-black text-white"
                  )}
                >
                  <span>{e?.nombre_edicion || `Edición ${i + 1}`}</span>

                  {isActive && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-[14px] sm:text-[20px] lg:text-[12px] text-zinc-500 italic">
              Sin ediciones registradas
            </div>
          )}
        </div>
      </div>

      {scales.length > 0 && (
        <div className="mb-8 sm:mb-9 lg:mb-7">
          <p className="text-[12px] sm:text-[22px] lg:text-[14px] font-black uppercase tracking-[1.8px] mb-4">
            Escala disponible
          </p>

          {activeScaleDescription && (
            <div className="text-[13px] sm:text-[20px] lg:text-[13px] italic mb-5">
              {activeScaleDescription}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {scales.map((scale: ScaleItem, index: number) => {
              const isActive =
                String(activeScale?.id_escala ?? "") === String(scale?.id_escala ?? "");

              return (
                <button
                  key={`${scale?.id_escala ?? scale?.nombre_escala ?? index}-${index}`}
                  onClick={() => setActiveScale(scale)}
                  className={classNames(
                    "min-w-[48px] px-3 py-2.5 border text-[12px] sm:text-[18px] lg:text-[11px] uppercase font-bold",
                    !scale?.disponible
                      ? "opacity-25 border-zinc-300 bg-white text-zinc-400"
                      : isActive
                        ? "bg-white text-black border-red-500 shadow"
                        : "bg-black text-white border-black"
                  )}
                  disabled={!scale?.disponible}
                >
                  {scale?.nombre_escala || "N/A"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={() => toggleFavorite(favoriteId)}
          className={classNames(
            "w-full py-3.5 font-bold uppercase text-[12px] sm:text-[20px] lg:text-[12px] tracking-[2px] border",
            isFavorite
              ? "bg-red-500 border-red-500 text-white"
              : "border-black text-black hover:bg-black hover:text-white"
          )}
        >
          {isFavorite ? "En Favoritos" : "Añadir a Favoritos"}
        </button>
      </div>

      <div className="border-t border-zinc-200 mt-4 pt-3">
        {meta?.aspectos_variables && (
          <div className="mb-5 border-l-4 border-red-500 bg-red-50 px-3 py-3.5">
            <div className="text-[14px] sm:text-[20px] lg:text-[14px] italic">
              <span className="font-extrabold uppercase text-red-600">
                Piezas alternas:
              </span>{" "}
              <span className="font-semibold">{meta.aspectos_variables}</span>
            </div>
          </div>
        )}

        <div className="text-[14px] sm:text-[20px] lg:text-[13px] italic">
          {meta?.description || meta?.descripcion || "Sin descripción por el momento."}
        </div>

        {meta?.disclaimer && (
          <div className="text-[12px] sm:text-[18px] lg:text-[11px] italic mt-5 text-black/60">
            {meta.disclaimer}
          </div>
        )}
      </div>
    </div>
  );
};