import React, { useMemo, useState } from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import { CategoriesMini } from "./CategoriesMini";
import { UniverseRail } from "./UniverseRail";

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

type ProductMode = "all" | "cosplay" | "figura";

interface Props {
  meta: { title?: string };
  categories: CategoryCard[];
  universes?: UniverseCard[];
  activeUniversoId?: string | null;
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
  activeUniversoId = null,
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
          <div className="container pb-5">
            <div className="mt-4 mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="pr-0 lg:pr-6">
                <h1 className="text-[30px] sm:text-4xl lg:text-4xl leading-[0.95] font-black uppercase italic text-white tracking-tight">
                  {origenNombre ? (
                    <>
                      Explora:{" "}
                      <span className="text-[#00eeff] drop-shadow-[0_0_12px_rgba(0,238,255,0.35)]">
                        {origenNombre}
                      </span>
                    </>
                  ) : activeUniversoId ? (
                    <>
                      Explora:{" "}
                      <span className="text-[#00eeff] drop-shadow-[0_0_12px_rgba(0,238,255,0.35)]">
                        {meta.title?.replace("Explorar: ", "")}
                      </span>
                    </>
                  ) : (
                    <>
                      Explora por{" "}
                      <span className="text-[#00eeff] drop-shadow-[0_0_12px_rgba(0,238,255,0.35)]">
                        universos
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-[11px] md:text-sm text-zinc-500 uppercase tracking-[0.18em] mt-3 font-bold">
                  {origenNombre ? (
                    productMode === "cosplay"
                      ? `Mostrando ${categories?.length ?? 0} personajes del origen seleccionado con productos cosplay`
                      : productMode === "figura"
                        ? `Mostrando ${categories?.length ?? 0} personajes del origen seleccionado con productos figura`
                        : `Mostrando ${categories?.length ?? 0} personajes del origen seleccionado`
                  ) : activeUniversoId ? (
                    productMode === "cosplay"
                      ? `Mostrando ${categories?.length ?? 0} personajes del universo seleccionado con productos cosplay`
                      : productMode === "figura"
                        ? `Mostrando ${categories?.length ?? 0} personajes del universo seleccionado con productos figura`
                        : `Mostrando ${categories?.length ?? 0} personajes del universo seleccionado`
                  ) : productMode === "cosplay" ? (
                    `Mostrando ${categories?.length ?? 0} personajes con productos cosplay`
                  ) : productMode === "figura" ? (
                    `Mostrando ${categories?.length ?? 0} personajes con productos figura`
                  ) : (
                    "Desliza y filtra personajes por universo"
                  )}
                </p>
              </div>

              <div className="w-full mt-5 sm:mt-6 lg:mt-0 flex flex-wrap items-center justify-start lg:w-auto lg:justify-end gap-3">
                {productModeToggleHref && (
                  <a
                    href={productModeToggleHref}
                    title={currentModeBadge}
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-full border transition uppercase tracking-[0.22em] font-black text-[10px] ${
                      productMode === "cosplay"
                        ? "border-[#00eeff] text-[#00eeff] bg-[#00eeff]/14 shadow-[0_0_22px_rgba(0,238,255,0.22)] hover:bg-[#00eeff]/22 hover:text-white"
                        : productMode === "figura"
                          ? "border-red-500/60 text-red-400 bg-red-500/12 shadow-[0_0_18px_rgba(239,68,68,0.14)] hover:bg-red-500/20 hover:text-white"
                          : "border-[#00eeff]/40 text-[#00eeff] bg-[#00eeff]/8 hover:bg-[#00eeff]/14 hover:border-[#00eeff] hover:text-white"
                    }`}
                  >
                    {productModeLabel}
                  </a>
                )}

                {clearFilterHref && (
                  <a
                    href={clearFilterHref}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition uppercase tracking-[0.22em] font-black text-[10px] bg-white/5 hover:bg-white/10"
                  >
                    Quitar filtro
                  </a>
                )}
              </div>
            </div>

            <UniverseRail
              items={universes}
              activeUniversoId={activeUniversoId}
            />
          </div>

          <div className="flex flex-col gap-8">
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
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-xs md:text-sm rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition ${
                  currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 text-xs md:text-sm rounded-full border transition ${
                      isActive
                        ? "bg-red-600 border-red-500 text-white font-bold"
                        : "border-white/10 text-white/70 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-xs md:text-sm rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition ${
                  currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default NewPageWrapper;