import React from "react";
import ContextWrapper from "../../ContextWrapper";
import InnerPageWrapper from "../../InnnerPageWrapper";
import { Main } from "../../shop/products/Main";
import type { ShopPageDataD1 } from "../../../types/shop-d1";

interface Props {
  data: ShopPageDataD1;
}

const ProductsPageWrapper: React.FC<Props> = ({ data }) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <Main data={data} favoritesOnly />
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductsPageWrapper;