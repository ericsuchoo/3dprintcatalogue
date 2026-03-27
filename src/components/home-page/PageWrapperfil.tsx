import React, { useMemo, useState } from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import { CategoriesMini } from "./CategoriesMini";
import { UniverseRail } from "./UniverseRail";
import { OriginsBar } from "../home-page/OriginsBar";
import { CharacterExplorerLite } from "../home-page/CharacterExplorerLite"; // 👈 NUEVO

type CategoryCard = {
  meta: {
    id_personaje?: string | number;
    title: string;
    slug: string;
    gallery?: { url: string }[];
  };
  productsCount: number;
};

type UniverseCard = {
  id: string;
  title: string;
  imageUrl: string | null;
};

type OriginItem = {
  id: string;
  label: string;
};

type ProductMode = "all" | "cosplay" | "figura";

interface Props {
  meta: { title?: string };
  categories: CategoryCard[];
  universes?: UniverseCard[];
  origins?: OriginItem[];
  activeUniversoId?: string | null;
  activeOrigenId?: string | null;
  clearFilterHref?: string | null;
  origenNombre?: string | null;
  productMode?: ProductMode;
  productModeToggleHref?: string | null;
}

const ITEMS_PER_PAGE = 24;

const NewPageWrapper: React.FC<Props> = ({
  meta,
  categories,
  universes = [],
  origins = [],
  activeUniversoId = null,
  activeOrigenId = null,
  clearFilterHref,
  origenNombre = null,
  productMode = "all",
  productModeToggleHref = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((categories?.length || 0) / ITEMS_PER_PAGE));

  const pageCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return (categories || []).slice(start, start + ITEMS_PER_PAGE);
  }, [categories, currentPage]);

  const explorerItems = useMemo(() => {
    return (categories || []).map((c) => ({
      id: String(c.meta.id_personaje),
      title: c.meta.title,
      href: `/shop?personajeId=${c.meta.id_personaje}`,
    }));
  }, [categories]);

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safe);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const productModeLabel =
    productMode === "all"
      ? "Filtrar: cosplay"
      : productMode === "cosplay"
        ? "Filtrar: figuras"
        : "Ver todos";

  const currentModeBadge =
    productMode === "all"
      ? "Modo actual: todos"
      : productMode === "cosplay"
        ? "Modo actual: cosplay"
        : "Modo actual: figuras";

  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <div className="pt-40 sm:pt-36 lg:pt-24 bg-[#0a0a0a] min-h-screen">
          <div className="container pb-6">
            <div className="mt-4 mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="pr-0 lg:pr-6">
                <h1 className="text-[30px] sm:text-4xl lg:text-4xl leading-[0.95] font-black uppercase italic text-white tracking-tight">
                  Explora por{" "}
                  <span className="text-[#00eeff]">universos</span>
                </h1>
              </div>

              <div className="w-full mt-5 sm:mt-6 lg:mt-0 flex flex-wrap gap-3">
                {productModeToggleHref && (
                  <a href={productModeToggleHref} className="px-4 py-2 rounded-full border text-xs">
                    {productModeLabel}
                  </a>
                )}
              </div>
            </div>

            <UniverseRail items={universes} activeUniversoId={activeUniversoId} />
          </div>

          {origins.length > 0 && (
            <OriginsBar
              items={origins}
              activeId={activeOrigenId}
              basePath="/explorar"
              paramName="origenId"
              autoScroll
              sticky
              stickyTopClassName="top-[72px]"
              speedPxPerFrame={0.55}
            />
          )}

          <div className="flex flex-col gap-8 relative z-0 mt-[110px]">
            {pageCategories.length > 0 ? (
              <CategoriesMini data={pageCategories} />
            ) : (
              <div className="text-center py-20 text-zinc-700 uppercase font-black">
                No hay personajes vinculados aún
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 pb-10 flex-wrap">
              <button onClick={() => goToPage(currentPage - 1)}>Anterior</button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button key={page} onClick={() => goToPage(page)}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => goToPage(currentPage + 1)}>Siguiente</button>
            </div>
          )}

          {/* 🔥 NUEVO BLOQUE (buscador real) */}
          <div className="container">
            <CharacterExplorerLite items={explorerItems} />
          </div>
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default NewPageWrapper;