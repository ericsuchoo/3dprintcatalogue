import React from "react";

type Origin = { id: string; label: string };

export const OriginsBar: React.FC<{ items: Origin[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-black/80">
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-white/90 text-xs uppercase tracking-[0.35em]">
            Orígenes
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-[0.25em]">
            Selección rápida
          </div>
        </div>

        {/* “mini slider” horizontal (scroll) */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 pr-2">
            {items.map((t) => (
              <button
                key={t.id}
                type="button"
                className="
                  shrink-0
                  rounded-full
                  border border-white/15
                  bg-white/5
                  px-4 py-2
                  text-white/90
                  text-xs
                  uppercase
                  tracking-[0.18em]
                  transition
                  hover:bg-white/10
                  hover:border-white/25
                  active:scale-[0.98]
                  backdrop-blur
                "
                // por ahora sin acción
                onClick={() => {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* fades laterales para look pro */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/80 to-transparent" />
        </div>
      </div>
    </section>
  );
};