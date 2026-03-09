import "../../styles/carrusel.css";
import React, { useEffect, useMemo, useRef, useState } from "react";

type OriginItem = { id: string; label: string };

type Props = {
  items: OriginItem[];
  speedPxPerFrame?: number;
};

export const OriginsBar: React.FC<Props> = ({ items, speedPxPerFrame = 0.8 }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  const loopItems = useMemo(() => {
    if (!items?.length) return [];
    return [...items, ...items];
  }, [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth + 5;
    if (!hasOverflow) return;

    const step = () => {
      if (!paused) {
        el.scrollLeft += speedPxPerFrame;

        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft = 0;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, speedPxPerFrame, loopItems.length]);

  if (!items?.length) return null;

  const buildHref = (id: string) => {
    const params = new URLSearchParams();
    params.set("origenId", id);
    return `/explorar?${params.toString()}`;
  };

  return (
    <section className="originsBarWrap">
      <div className="originsBarInner">

        <div className="originsBarHeader">
          <div className="originsKicker">ORÍGENES</div>
          <div className="originsHint">SELECCIÓN RÁPIDA</div>
        </div>

        <div className="fadeLeft" />
        <div className="fadeRight" />

        <div
          ref={scrollerRef}
          className="originsScroller"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="originsRow">
            {loopItems.map((o, idx) => (
              <a
                key={`${o.id}-${idx}`}
                href={buildHref(o.id)}
                className="originPill"
              >
                <span className="originText">
                  {o.label}
                  <span className="hoverText" aria-hidden="true">
                    {o.label}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};