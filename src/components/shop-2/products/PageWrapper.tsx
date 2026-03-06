import React from "react";
import ContextWrapper from "../../ContextWrapper";
import InnerPageWrapper from "../../InnnerPageWrapper";
import { Main } from "./Main";
import type { ShopPageDataD1 } from "../../../types/shop-d1";

interface Props {
  data: ShopPageDataD1;
}

const ProductsPageWrapper: React.FC<Props> = ({ data }) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <div className="container pb-14 md:pb-20 lg:pb-[136px]">
          <Main data={data} />
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductsPageWrapper;