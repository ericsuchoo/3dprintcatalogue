import React from "react";
import ContextWrapper from "../../ContextWrapper";
import InnerPageWrapper from "../../InnnerPageWrapper";
import { Main } from "./Main";

interface Props {
  data: {
    meta: any;
    otherProducts?: any[];
  };
}

const ProductPageWrapper: React.FC<Props> = ({ data }) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper>
        {data?.meta ? <Main data={data} /> : null}
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductPageWrapper;