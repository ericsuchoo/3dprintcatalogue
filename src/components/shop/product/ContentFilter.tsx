import React, { useEffect, useState } from "react";
import classNames from "classnames";

type Nivel = "safe" | "suggestive" | "nsfw";

interface Props {
  hasSuggestive: boolean;
  hasNSFW: boolean;
}

export const ContentFilter: React.FC<Props> = ({
  hasSuggestive,
  hasNSFW,
}) => {
  const [nivel, setNivel] = useState<Nivel>("safe");

  useEffect(() => {
    const stored = localStorage.getItem("contenido_nivel") as Nivel;
    if (stored) setNivel(stored);
  }, []);

  const changeNivel = (next: Nivel) => {
    setNivel(next);
    localStorage.setItem("contenido_nivel", next);
    window.dispatchEvent(new Event("contenido-change"));
  };

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => changeNivel("safe")}
        className={classNames(
          "px-3 py-1 text-[10px] font-black tracking-wider rounded-full border",
          nivel === "safe"
            ? "bg-white text-black border-white"
            : "bg-black text-white border-white/20"
        )}
      >
        SAFE
      </button>

      {hasSuggestive && (
        <button
          onClick={() => changeNivel("suggestive")}
          className={classNames(
            "px-3 py-1 text-[10px] font-black tracking-wider rounded-full border",
            nivel === "suggestive"
              ? "bg-red-500 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              : "bg-black text-white border-red-500/40"
          )}
        >
          SUGGESTIVE
        </button>
      )}

      {hasNSFW && (
        <button
          onClick={() => changeNivel("nsfw")}
          className={classNames(
            "px-3 py-1 text-[10px] font-black tracking-wider rounded-full border",
            nivel === "nsfw"
              ? "bg-red-600 text-white border-red-600 shadow-[0_0_14px_rgba(239,68,68,0.8)]"
              : "bg-black text-white border-red-500/40"
          )}
        >
          NSFW 🔞
        </button>
      )}
    </div>
  );
};