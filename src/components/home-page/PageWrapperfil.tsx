import React, { useMemo, useState } from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import { CategoriesMini } from "./CategoriesMini";

type CategoryCard = {
  meta: {
    title: string;
    slug: string;
    gallery?: { url: string }[];
  };
  productsCount: number;
};

interface Props {
  meta: { title?: string };
  categories: CategoryCard[];
}

const ITEMS_PER_PAGE = 24;

const NewPageWrapper: React.FC<Props> = ({ meta, categories }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil((categories?.length || 0) / ITEMS_PER_PAGE),
  );

  const pageCategories = useMemo(() => {
    if (!categories) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(start, start + ITEMS_PER_PAGE);
  }, [categories, currentPage]);

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safe);
  };

  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <div className="pt-24 bg-[#0a0a0a] min-h-screen">
          {/* HEADER */}
          <div className="container pb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter">
              Todos los <span className="text-red-600">Personajes</span>
            </h1>
            <div className="w-20 h-1 bg-red-600 mx-auto mt-4 mb-2" />
            <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-[0.2em] font-bold">
              Mostrando {categories?.length ?? 0} Personajes Disponibles
            </p>
          </div>

          {/* GRID DE PERSONAJES (SOLO LA PÁGINA ACTUAL) */}
          <div className="flex flex-col gap-8">
            {pageCategories.length > 0 ? (
              <CategoriesMini data={pageCategories} />
            ) : (
              <div className="text-center py-20 text-zinc-700 uppercase font-black">
                No hay personajes vinculados aún
              </div>
            )}
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 pb-10">
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
                  currentPage === totalPages
                    ? "opacity-40 cursor-not-allowed"
                    : ""
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