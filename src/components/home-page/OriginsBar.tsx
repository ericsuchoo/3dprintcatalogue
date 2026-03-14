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
  speedPxPerFrame?: number;
};

export const OriginsBar: React.FC<Props> = ({
  items,
  activeId = null,
  basePath = "/explorar",
  paramName = "origenId",
  autoScroll = true,
  sticky = false,
  stickyTopClassName = "top-[72px]",
  speedPxPerFrame = 0.55,
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [readyToScroll, setReadyToScroll] = useState(false);

  const loopItems = useMemo(() => {
    if (!items?.length) return [];
    return autoScroll ? [...items, ...items] : items;
  }, [items, autoScroll]);

  const buildHref = (id: string) => {
    const params = new URLSearchParams();
    params.set(paramName, id);
    return `${basePath}?${params.toString()}`;
  };

  const sectionClass = sticky
    ? `originsBarWrap sticky ${stickyTopClassName} z-40`
    : "originsBarWrap";

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    if (startTimeoutRef.current) {
      window.clearTimeout(startTimeoutRef.current);
    }

    if (!activeId) {
      setReadyToScroll(true);
      return;
    }

    const activeNodes = Array.from(
      el.querySelectorAll(`[data-origin-id="${activeId}"]`)
    ) as HTMLElement[];

    if (!activeNodes.length) {
      setReadyToScroll(true);
      return;
    }

    const targetEl =
      activeNodes.length > 1 ? activeNodes[Math.floor(activeNodes.length / 2)] : activeNodes[0];

    const containerWidth = el.clientWidth;
    const elementLeft = targetEl.offsetLeft;
    const elementWidth = targetEl.offsetWidth;

    setReadyToScroll(false);

    el.scrollTo({
      left: Math.max(0, elementLeft - containerWidth / 2 + elementWidth / 2),
      behavior: "smooth",
    });

    startTimeoutRef.current = window.setTimeout(() => {
      setReadyToScroll(true);
    }, 700);

    return () => {
      if (startTimeoutRef.current) {
        window.clearTimeout(startTimeoutRef.current);
      }
    };
  }, [activeId, items, autoScroll]);

  useEffect(() => {
    if (!autoScroll || !readyToScroll) return;

    const el = scrollerRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth + 5;
    if (!hasOverflow) return;

    const step = () => {
      if (!paused) {
        el.scrollLeft += speedPxPerFrame;

        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) {
          el.scrollLeft = 0;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [paused, autoScroll, readyToScroll, speedPxPerFrame, loopItems]);

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