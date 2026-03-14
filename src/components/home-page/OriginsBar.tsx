import "../../styles/carrusel.css";
import React, { useEffect, useMemo, useRef, useState } from "react";

type OriginItem = {
  id: string;
  label: string;
};

type Props = {
  items: OriginItem[];
  activeId?: string | null;
  basePath?: string;
  paramName?: string;
  autoScroll?: boolean;
  sticky?: boolean;
  stickyTopClassName?: string;
};

export const OriginsBar: React.FC<Props> = ({
  items,
  activeId = null,
  basePath = "/explorar",
  paramName = "origenId",
  autoScroll = true,
  sticky = false,
  stickyTopClassName = "top-[72px]",
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  const loopItems = useMemo(() => {
    if (!items?.length) return [];
    return autoScroll ? [...items, ...items] : items;
  }, [items, autoScroll]);

  /* ========================= */
  /* AUTO SCROLL               */
  /* ========================= */

  useEffect(() => {
    if (!autoScroll) return;

    const el = scrollerRef.current;
    if (!el) return;

    const step = () => {
      if (!paused) {
        el.scrollLeft += 0.6;

        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft = 0;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, autoScroll]);

  /* ========================= */
  /* CENTER ACTIVE ORIGIN      */
  /* ========================= */

  useEffect(() => {
    if (!activeId) return;

    const el = scrollerRef.current;
    if (!el) return;

    const activeEl = el.querySelector(
      `[data-origin-id="${activeId}"]`
    ) as HTMLElement | null;

    if (!activeEl) return;

    const containerWidth = el.clientWidth;
    const elementLeft = activeEl.offsetLeft;
    const elementWidth = activeEl.offsetWidth;

    el.scrollTo({
      left: elementLeft - containerWidth / 2 + elementWidth / 2,
      behavior: "smooth",
    });
  }, [activeId]);

  const buildHref = (id: string) => {
    const params = new URLSearchParams();
    params.set(paramName, id);
    return `${basePath}?${params.toString()}`;
  };

  const sectionClass = sticky
    ? `originsBarWrap sticky ${stickyTopClassName} z-40`
    : "originsBarWrap";

  if (!items?.length) return null;

  return (
    <section className={sectionClass}>
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
            {loopItems.map((o, idx) => {
              const isActive = activeId && String(activeId) === String(o.id);

              return (
                <a
                  key={`${o.id}-${idx}`}
                  href={buildHref(o.id)}
                  data-origin-id={o.id}
                  className={`originPill ${isActive ? "originPillActive" : ""}`}
                >
                  <span className="originText">{o.label}</span>

                  <span className="line top" />
                  <span className="line right" />
                  <span className="line bottom" />
                  <span className="line left" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};