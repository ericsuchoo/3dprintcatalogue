import React from "react";
import ContextWrapper from "../../ContextWrapper";
import InnerPageWrapper from "../../InnnerPageWrapper";
import { Main } from "../../shop/products/Main";
import type { ShopPageDataD1 } from "../../../types/shop-d1";

interface Props {
  data: ShopPageDataD1 & {
    personajeNombre?: string | null;
    universoNombre?: string | null;
    proveedorNombre?: string | null;
    activeFilterLabels?: string[];
    clearFilterHref?: string | null;
    initialUniversoId?: string | null;
    initialProveedorId?: string | null;
    initialSort?: "newest" | "price_asc" | "price_desc";
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      itemsPerPage: number;
      pageCount?: number;
      basePath: string;
      personajeId?: string | null;
      universoId?: string | null;
      proveedorId?: string | null;
      sort?: "newest" | "price_asc" | "price_desc";
    };
    selectedCharacter?: {
      id: string;
      name: string;
    } | null;
    quickCharacterSuggestions?: {
      id: string;
      title: string;
      href: string;
      universe?: string;
      tags?: string[];
    }[];
  };
}

const ProductsPageWrapper: React.FC<Props> = ({ data }) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <Main data={data} favoritesOnly={true} />
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductsPageWrapper;