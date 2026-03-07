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
      className="flex flex-col relative p-6 lg:p-8 lg:pt-[5%] mt-10 lg:mt-24 lg:max-w-md mx-auto lg:ml-auto lg:mr-20"
      style={{ background: "rgba(255, 255, 255, 0.93)" }}
    >
      <div className="flex flex-col mb-2">
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tighter leading-tight text-black mb-1
          [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff]"
          style={{
            textAlign: "center",
            fontFamily: "Voga-Medium, sans-serif",
            background: "rgb(255, 255, 255)",
          }}
        >
          {meta?.title || meta?.nombre_producto || "Producto"}
        </h1>

        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <span className="text-[10px] font-medium text-black uppercase tracking-widest">
            Ref: {meta?.model_id || meta?.id_producto || "3D-DC"}
          </span>
          <span className="text-xl font-light text-black">{priceLabel ?? ""}</span>
        </div>
      </div>

      {/* EDICIONES */}
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
                    "flex items-center justify-between px-4 py-2 border text-[11px] transition-all duration-300",
                    isActive
                      ? "bg-white text-black border-black"
                      : "border-zinc-200 bg-black text-white hover:border-zinc-400"
                  )}
                >
                  <span className="font-bold uppercase tracking-tight">
                    {e?.nombre_edicion || `Edición ${i + 1}`}
                  </span>
                  {isActive && <div className="w-1 h-1 bg-black rounded-full animate-pulse" />}
                </button>
              );
            })
          ) : (
            <div className="text-[12px] text-zinc-500 italic">Sin ediciones registradas</div>
          )}
        </div>
      </div>

      {/* ESCALAS */}
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
                    "min-w-[42px] px-3 py-3 border text-[11px] font-bold uppercase leading-none transition-all duration-300",
                    !scale?.disponible
                      ? "opacity-30 cursor-not-allowed border-zinc-300 text-zinc-400"
                      : isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
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

      {/* FAVORITOS */}
      <div className="flex flex-col gap-2 mb-8" style={{ background: "rgba(255, 255, 255, 0.92)" }}>
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

      {/* TEXTO */}
      <div className="border-t border-zinc-100 pt-4">
        {meta?.aspectos_variables ? (
          <div className="text-black font-sans italic text-[13px] leading-snug tracking-tight whitespace-pre-line mb-4">
            <span className="font-bold">Piezas alternas:</span> {meta.aspectos_variables}
          </div>
        ) : null}

        <div className="text-black font-sans italic text-[13px] leading-snug tracking-tight whitespace-pre-line">
          {meta?.description || meta?.descripcion || "Sin descripción por el momento."}
        </div>

        {meta?.disclaimer ? (
          <div className="text-black font-sans italic text-[13px] leading-snug tracking-tight whitespace-pre-line mt-4">
            {meta.disclaimer}
          </div>
        ) : null}
      </div>
    </div>
  );
};