
import React, { useMemo } from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import { CategoriesMini } from "./CategoriesMini";
import { UniverseRail } from "./UniverseRail";
import { OriginsBar } from "./OriginsBar";
import { CharacterSearchD1 } from "./CharacterSearchD1";

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
  currentPage?: number;
  totalPages?: number;
  totalCharacters?: number;
  itemsPerPage?: number;
  discoveryMode?: boolean;
  allCharactersMode?: boolean;
}

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
  currentPage = 1,
  totalPages = 1,
  totalCharacters = 0,
  itemsPerPage = 24,
  discoveryMode = false,
  allCharactersMode = false,
}) => {
  const pageCategories = categories || [];

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

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (activeUniversoId) {
      params.set("universoId", activeUniversoId);
    }

    if (activeOrigenId) {
      params.set("origenId", activeOrigenId);
    }

    if (productMode !== "all") {
      params.set("tipoProducto", productMode);
    }

    if (allCharactersMode) {
      params.set("todos", "1");
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();
    return `/explorar${query ? `?${query}` : ""}`;
  };

  const pageStart =
    totalCharacters === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const pageEnd =
    totalCharacters === 0
      ? 0
      : Math.min(
          pageStart + pageCategories.length - 1,
          totalCharacters
        );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const countDescription = discoveryMode
    ? "Encuentra tu próximo personaje de colección."
    : origenNombre
      ? `Mostrando ${pageStart}-${pageEnd} de ${totalCharacters} personajes del origen seleccionado`
      : activeUniversoId
        ? `Mostrando ${pageStart}-${pageEnd} de ${totalCharacters} personajes del universo seleccionado`
        : `Mostrando ${pageStart}-${pageEnd} de ${totalCharacters} personajes${
            productMode === "cosplay"
              ? " con productos cosplay"
              : productMode === "figura"
                ? " con productos figura"
                : ""
          }`;

  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <div className="pt-16 sm:pt-14 lg:pt-16 bg-[#0a0a0a] min-h-screen">

          {/* ENCABEZADO PRINCIPAL */}
          <section className="container pt-5 pb-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="min-w-0">
                <h1 className="text-[26px] sm:text-3xl font-black uppercase italic tracking-tight text-white">
                  {origenNombre ? (
                    <>
                      Explora:{" "}
                      <span className="text-[#00eeff]">
                        {origenNombre}
                      </span>
                    </>
                  ) : activeUniversoId ? (
                    <>
                      Explora:{" "}
                      <span className="text-[#00eeff]">
                        {meta.title?.replace("Explorar: ", "")}
                      </span>
                    </>
                  ) : discoveryMode ? (
                    <>
                      Explora{" "}
                      <span className="text-[#00eeff]">
                        nuestro universo
                      </span>
                    </>
                  ) : (
                    <>
                      Todos los{" "}
                      <span className="text-[#00eeff]">
                        personajes
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-[0.18em] mt-3 font-bold">
                  {countDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {productModeToggleHref && (
                  <a
                    href={productModeToggleHref}
                    title={currentModeBadge}
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-full border transition uppercase tracking-[0.18em] font-black text-[10px] ${
                      productMode === "cosplay"
                        ? "border-[#00eeff] text-[#00eeff] bg-[#00eeff]/10"
                        : productMode === "figura"
                          ? "border-red-500/60 text-red-400 bg-red-500/10"
                          : "border-[#00eeff]/40 text-[#00eeff] hover:bg-[#00eeff]/10"
                    }`}
                  >
                    {productModeLabel}
                  </a>
                )}

                {clearFilterHref && (
                  <a
                    href={clearFilterHref}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition uppercase tracking-[0.18em] font-black text-[10px] bg-white/5"
                  >
                    Quitar filtro
                  </a>
                )}

                {!discoveryMode && (
                  <a
                    href="/explorar"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white transition uppercase tracking-[0.18em] font-black text-[10px]"
                  >
                    Volver a descubrir
                  </a>
                )}
              </div>
            </div>

            {/* BUSCADOR PRINCIPAL */}
            {discoveryMode && (
              <div className="mt-7 max-w-3xl mx-auto">
                <CharacterSearchD1 />
              </div>
            )}
          </section>

          {/* NAVEGACION POR UNIVERSOS */}
          <section className="mt-3">
            <div className="container mb-4">
              <h2 className="text-white text-sm sm:text-base font-black uppercase italic tracking-wide">
                Explora por{" "}
                <span className="text-[#00eeff]">
                  universos
                </span>
              </h2>
            </div>

            <UniverseRail
              items={universes}
              activeUniversoId={activeUniversoId}
            />
          </section>

          {/* FRANQUICIAS */}
          {origins.length > 0 && (
            <OriginsBar
              items={origins}
              activeId={activeOrigenId}
              basePath="/explorar"
              paramName="origenId"
              autoScroll
              sticky
              stickyTopClassName="top-[12px]"
              speedPxPerFrame={0.55}
            />
          )}

          {/* DESCUBRIMIENTO / CATALOGO */}
          <section className="relative z-0 mt-7">
            <div className="container mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-white text-lg font-black uppercase italic">
                  {discoveryMode
                    ? "Descubre personajes"
                    : "Personajes disponibles"}
                </h2>

                <p className="text-zinc-500 text-xs mt-2">
                  {discoveryMode
                    ? "Una selección diferente cada día."
                    : countDescription}
                </p>
              </div>

              {discoveryMode && (
                <a
                  href="/explorar?todos=1"
                  className="inline-flex items-center justify-center rounded-full border border-[#00eeff]/50 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#00eeff] hover:bg-[#00eeff]/10 transition whitespace-nowrap"
                >
                  Ver todos los personajes →
                </a>
              )}
            </div>

            {pageCategories.length > 0 ? (
              <CategoriesMini data={pageCategories} />
            ) : (
              <div className="text-center py-20 text-zinc-600 uppercase font-black">
                No hay personajes vinculados aún
              </div>
            )}
          </section>

          {/* PAGINACION COMPLETA */}
          {!discoveryMode && totalPages > 1 && (
            <nav
              aria-label="Paginación de personajes"
              className="flex justify-center items-center gap-2 mt-10 pb-16 flex-wrap"
            >
              <a
                href={
                  currentPage > 1
                    ? buildPageHref(currentPage - 1)
                    : "#"
                }
                className={`px-3 py-2 text-xs rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition ${
                  currentPage === 1
                    ? "opacity-40 pointer-events-none"
                    : ""
                }`}
              >
                Anterior
              </a>

              {visiblePages.map((page) => {
                const isActive = page === currentPage;

                return (
                  <a
                    key={page}
                    href={buildPageHref(page)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-9 h-9 text-xs rounded-full border transition flex items-center justify-center ${
                      isActive
                        ? "bg-red-600 border-red-500 text-white font-bold"
                        : "border-white/10 text-white/70 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {page}
                  </a>
                );
              })}

              <a
                href={
                  currentPage < totalPages
                    ? buildPageHref(currentPage + 1)
                    : "#"
                }
                className={`px-3 py-2 text-xs rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition ${
                  currentPage === totalPages
                    ? "opacity-40 pointer-events-none"
                    : ""
                }`}
              >
                Siguiente
              </a>
            </nav>
          )}

          <div className="h-16" />
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default NewPageWrapper;
