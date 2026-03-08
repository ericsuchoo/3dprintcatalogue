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
      className="flex flex-col relative p-6 lg:p-7 mt-0 lg:mt-0 max-w-[460px] w-full mx-auto xl:ml-auto xl:mr-0 border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
      style={{ background: "rgba(255, 255, 255, 0.96)" }}
    >
      <div className="flex flex-col mb-3">
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tighter leading-tight text-black mb-2 uppercase
          [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff]"
          style={{
            textAlign: "center",
            fontFamily: "Voga-Medium, sans-serif",
            background: "rgb(255, 255, 255)",
          }}
        >
          <span
            className="inline-block px-4 py-1.5 border-2 border-red-500 bg-white text-black
            shadow-[0_0_8px_rgba(239,68,68,0.35)]
            hover:shadow-[0_0_14px_rgba(239,68,68,0.55)]
            transition-all duration-300"
          >
            {meta?.title || meta?.nombre_producto || "Producto"}
          </span>
        </h1>

        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <span className="text-[10px] font-medium text-black uppercase tracking-widest">
            Ref: {meta?.model_id || meta?.id_producto || "3D-DC"}
          </span>
          <span className="text-[20px] font-light text-black">{priceLabel ?? ""}</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[2px] mb-3 text-black">
          Versión del modelo
        </p>

        <div className="grid grid-cols-1 gap-1.5">
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
                    "relative flex items-center justify-between px-4 py-2 border text-[11px] transition-all duration-300 uppercase tracking-tight font-bold",
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
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-[12px] text-zinc-500 italic">Sin ediciones registradas</div>
          )}
        </div>
      </div>

      {scales.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[2px] mb-3 text-black">
            Escala disponible
          </p>

          {activeScaleDescription && (
            <div className="text-[12px] italic text-zinc-700 leading-snug mb-4 whitespace-pre-line">
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
                    "min-w-[46px] px-3 py-3 border text-[11px] font-bold uppercase leading-none transition-all duration-300",
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

      <div className="flex flex-col gap-2 mb-8">
        <button
          onClick={() => toggleFavorite(favoriteId)}
          className={classNames(
            "w-full py-4 font-bold uppercase text-[10px] tracking-[2px] border transition-colors",
            isFavorite
              ? "bg-red-500 border-red-500 text-white"
              : "border-black text-black hover:bg-black hover:text-white"
          )}
        >
          {isFavorite ? "En Favoritos" : "Añadir a Favoritos"}
        </button>
      </div>

      <div className="border-t border-zinc-200 pt-5">
        {meta?.aspectos_variables ? (
          <div className="mb-5 rounded-sm border-l-4 border-red-500 bg-red-50 px-4 py-3 shadow-sm">
            <div className="text-[15px] md:text-[16px] italic leading-snug tracking-tight text-black">
              <span className="font-extrabold uppercase text-red-600 tracking-[0.04em]">
                Piezas alternas:
              </span>{" "}
              <span className="font-semibold">{meta.aspectos_variables}</span>
            </div>
          </div>
        ) : null}

        <div className="text-black font-sans italic text-[13px] leading-snug tracking-tight whitespace-pre-line">
          {meta?.description || meta?.descripcion || "Sin descripción por el momento."}
        </div>

        {meta?.disclaimer ? (
          <div className="text-#c900e481 font-sans italic text-[10px] leading-snug tracking-tight whitespace-pre-line mt-4">
            {meta.disclaimer}
          </div>
        ) : null}
      </div>
    </div>
  );
};