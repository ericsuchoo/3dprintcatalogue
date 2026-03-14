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
    scales.find((s) => s.disponible)?.descripcion ||
    scales[0]?.descripcion ||
    "";

  return (
    <div
      className="flex flex-col relative p-3 sm:p-4 lg:p-6 xl:p-8 mt-0 w-full max-w-none border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      style={{ background: "rgba(255, 255, 255, 0.96)" }}
    >
      <div className="flex flex-col mb-4 sm:mb-5">
        <h1
          className="text-[24px] sm:text-[22px] lg:text-[28px] font-bold tracking-tighter leading-tight text-black mb-3 uppercase
          [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff]"
          style={{
            textAlign: "center",
            fontFamily: "Voga-Medium, sans-serif",
            background: "rgb(255, 255, 255)",
          }}
        >
          <span
            className="block w-full px-3 py-2 border-2 border-red-500 bg-white text-black
            shadow-[0_0_8px_rgba(239,68,68,0.35)]
            transition-all duration-300"
          >
            {meta?.title || meta?.nombre_producto || "Producto"}
          </span>
        </h1>

        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 gap-3">
          <span className="text-[10px] sm:text-[9px] lg:text-[10px] font-medium text-black uppercase tracking-[0.18em]">
            Ref: {meta?.model_id || meta?.id_producto || "3D-DC"}
          </span>

          <span className="text-[18px] sm:text-[16px] lg:text-[20px] font-light text-black whitespace-nowrap">
            {priceLabel ?? ""}
          </span>
        </div>
      </div>

      <div className="mb-5 sm:mb-6">
        <p className="text-[11px] sm:text-[10px] lg:text-[10px] font-black uppercase tracking-[1.8px] mb-3 text-black">
          Versión del modelo
        </p>

        <div className="grid grid-cols-1 gap-2">
          {editions.length ? (
            editions.map((e, i) => {
              const isActive =
                String(activeEdition?.id_edicion ?? activeEdition?.nombre_edicion ?? "") ===
                String(e?.id_edicion ?? e?.nombre_edicion ?? "");

              return (
                <button
                  key={`${e?.id_edicion ?? e?.nombre_edicion ?? i}-${i}`}
                  onClick={() => editionChange(e)}
                  className={classNames(
                    "relative flex items-center justify-between px-3 py-2.5 border text-[11px] sm:text-[10px] lg:text-[11px] transition-all duration-300 uppercase tracking-tight font-bold text-left",
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
            })
          ) : (
            <div className="text-[11px] sm:text-[11px] lg:text-[12px] text-zinc-500 italic">
              Sin ediciones registradas
            </div>
          )}
        </div>
      </div>

      {scales.length > 0 && (
        <div className="mb-6 sm:mb-7">
          <p className="text-[11px] sm:text-[10px] lg:text-[10px] font-black uppercase tracking-[1.8px] mb-3 text-black">
            Escala disponible
          </p>

          {activeScaleDescription && (
            <div className="text-[12px] sm:text-[11px] lg:text-[12px] italic text-zinc-700 leading-relaxed mb-4 whitespace-pre-line">
              {activeScaleDescription}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {scales.map((scale, index) => {
              const isActive =
                String(activeScale?.id_escala ?? "") === String(scale?.id_escala ?? "");

              return (
                <button
                  key={`${scale?.id_escala ?? scale?.nombre_escala ?? index}-${index}`}
                  onClick={() => setActiveScale(scale)}
                  className={classNames(
                    "min-w-[44px] sm:min-w-[42px] lg:min-w-[46px] px-2.5 py-2.5 border text-[10px] sm:text-[9px] lg:text-[10px] font-bold uppercase leading-none transition-all duration-300",
                    !scale?.disponible
                      ? "opacity-25 cursor-not-allowed border-zinc-300 bg-white text-zinc-400"
                      : isActive
                        ? "bg-white text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.55)] scale-[1.02]"
                        : "bg-black text-white border-black hover:bg-zinc-900"
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
            "w-full py-3 font-bold uppercase text-[10px] sm:text-[9px] lg:text-[10px] tracking-[2px] border transition-colors",
            isFavorite
              ? "bg-red-500 border-red-500 text-white"
              : "border-black text-black hover:bg-black hover:text-white"
          )}
        >
          {isFavorite ? "En Favoritos" : "Añadir a Favoritos"}
        </button>
      </div>

      <div className="border-t border-zinc-200 pt-4">
        {meta?.aspectos_variables ? (
          <div className="mb-4 rounded-sm border-l-4 border-red-500 bg-red-50 px-3 py-3 shadow-sm">
            <div className="text-[12px] sm:text-[11px] lg:text-[14px] italic leading-relaxed tracking-tight text-black">
              <span className="font-extrabold uppercase text-red-600 tracking-[0.04em]">
                Piezas alternas:
              </span>{" "}
              <span className="font-semibold">{meta.aspectos_variables}</span>
            </div>
          </div>
        ) : null}

        <div className="text-black font-sans italic text-[12px] sm:text-[11px] lg:text-[13px] leading-relaxed tracking-tight whitespace-pre-line">
          {meta?.description || meta?.descripcion || "Sin descripción por el momento."}
        </div>

        {meta?.disclaimer ? (
          <div className="text-black/60 font-sans italic text-[10px] sm:text-[9px] lg:text-[10px] leading-relaxed tracking-tight whitespace-pre-line mt-4">
            {meta.disclaimer}
          </div>
        ) : null}
      </div>
    </div>
  );
};