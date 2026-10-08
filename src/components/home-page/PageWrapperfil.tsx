
import React, { useMemo } from "react";
import { CharacterSearchD1 } from "./CharacterSearchD1";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";

import { CategoriesMini } from "./CategoriesMini";
import { UniverseRail } from "./UniverseRail";
import { OriginsBar } from "../home-page/OriginsBar";
import { CharacterExplorerLite } from "../home-page/CharacterExplorerLite";

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

  // Buscador provisional: solo personajes de la página actual.
  const explorerItems = useMemo(
    () =>
      pageCategories.map((c) => ({
        id: String(c.meta.id_personaje),
        title: c.meta.title,
        href: `/shop?personajeId=${c.meta.id_personaje}${
          productMode === "cosplay"
            ? "&tipoProducto=cosplay"
            : productMode === "figura"
              ? "&tipoProducto=figura"
              : ""
        }`,
      })),
    [pageCategories, productMode]
  );

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
    ? "Una selección de personajes para descubrir"
    : origenNombre
      ? `Mostrando ${pageStart}-${pageEnd} de ${totalCharacters} personajes del origen seleccionado${
          productMode === "cosplay"
            ? " con productos cosplay"
            : productMode === "figura"
              ? " con productos figura"
              : ""
        }`
      : activeUniversoId
        ? `Mostrando ${pageStart}-${pageEnd} de ${totalCharacters} personajes del universo seleccionado${
            productMode === "cosplay"
              ? " con productos cosplay"
              : productMode === "figura"
                ? " con productos figura"
                : ""
          }`
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
          <div className="container pb-4">
            <div className="mt-4 mb-1 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="pr-0 lg:pr-6">
                <h1 className="text-[30px] sm:text-2xl lg:text-2xl leading-[0.95] font-black uppercase italic text-white tracking-tight">
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
                  ) : discoveryMode ? (
                    <>
                      Explora por{" "}
                      <span className="text-[#00eeff] drop-shadow-[0_0_12px_rgba(0,238,255,0.35)]">
                        universos
                      </span>
                    </>
                  ) : (
                    <>
                      Todos los{" "}
                      <span className="text-[#00eeff] drop-shadow-[0_0_12px_rgba(0,238,255,0.35)]">
                        personajes
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-[20px] md:text-sm text-zinc-500 uppercase tracking-[0.18em] mt-3 font-bold">
                  {countDescription}
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

                {!discoveryMode && (
                  <a
                    href="/explorar"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/50 transition uppercase tracking-[0.18em] font-black text-[10px]"
                  >
                    Volver a descubrir
                  </a>
                )}
              </div>
            </div>
          </div>

          <UniverseRail
            items={universes}
            activeUniversoId={activeUniversoId}
          />

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

          <div className="flex flex-col gap-4 relative z-0 mt-[20px]">
            
{discoveryMode && (
  <div className="container py-5">
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-5 items-start">
      <div>
        <h2 className="text-white text-lg font-black uppercase italic">
          Descubre personajes
        </h2>

        <p className="text-zinc-500 text-xs mt-2">
          Explora una selección diaria o encuentra directamente
          tus personajes favoritos.
        </p>
      </div>

      <CharacterSearchD1 />

      <a
        href="/explorar?todos=1"
        className="inline-flex items-center justify-center rounded-full border border-[#00eeff]/50 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#00eeff] hover:bg-[#00eeff]/10 transition whitespace-nowrap"
      >
        Ver todos los personajes →
      </a>
    </div>
  </div>
)}


            {pageCategories.length > 0 ? (
              <CategoriesMini data={pageCategories} />
            ) : (
              <div className="text-center py-20 text-zinc-700 uppercase font-black">
                No hay personajes vinculados aún
              </div>
            )}
          </div>

          {!discoveryMode && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 pb-10 flex-wrap">
              <a
                href={
                  currentPage > 1
                    ? buildPageHref(currentPage - 1)
                    : "#"
                }
                className={`px-3 py-1 text-xs md:text-sm rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition ${
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
                    className={`w-8 h-8 text-xs md:text-sm rounded-full border transition flex items-center justify-center ${
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
                className={`px-3 py-1 text-xs md:text-sm rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition ${
                  currentPage === totalPages
                    ? "opacity-40 pointer-events-none"
                    : ""
                }`}
              >
                Siguiente
              </a>
            </div>
          )}

          <div className="mt-24 mb-32 px-4 sm:px-6 bg-[#0a0a0a]">
            <div className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <CharacterExplorerLite items={explorerItems} />
            </div>
          </div>
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default NewPageWrapper;
