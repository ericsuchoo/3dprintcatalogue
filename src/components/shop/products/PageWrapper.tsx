import React from "react";
import ContextWrapper from "../../ContextWrapper";
import InnerPageWrapper from "../../InnnerPageWrapper";
import { Main } from "./Main";
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
    selectedCharacter?: {
      id: string;
      name: string;
    } | null;
    quickCharacterSuggestions?: {
      id: string;
      title: string;
      href: string;
    }[];
  };
}

const ProductsPageWrapper: React.FC<Props> = ({ data }) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <Main data={data} />
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductsPageWrapper;