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
   <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_620px] gap-12">
          {data?.meta ? <Main data={data} /> : null}
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductPageWrapper;