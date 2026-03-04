import React, { useEffect, useMemo, useRef } from "react";
import "../../styles/carrusel.css";

type OriginItem = { id: string; label: string };

type Props = {
  items: OriginItem[];
};

export const OriginsBar: React.FC<Props> = ({ items }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Duplicamos lista para “loop” visual
  const loopItems = useMemo(() => [...items, ...items], [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    const speed = 18; // px/seg (lento)

    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;

      el.scrollLeft += speed * dt;

      // cuando llegamos al final de la primera mitad, regresamos sin salto
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // pausa en hover
    const onEnter = () => cancelAnimationFrame(raf);
    const onLeave = () => {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <section className="originsBarWrap">
      <div className="originsBarInner">
        <div className="originsBarHeader">
          <div className="originsKicker">ORÍGENES</div>
          <div className="originsHint">SELECCIÓN RÁPIDA</div>
        </div>

        <div className="fadeLeft" />
        <div className="fadeRight" />

        <div ref={scrollerRef} className="originsScroller">
          <div className="originsRow">
            {loopItems.map((it, idx) => (
              <button key={`${it.id}-${idx}`} className="originPill" type="button">
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};