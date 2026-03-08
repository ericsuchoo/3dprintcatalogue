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
        <div className="container bg-black pb-14 md:pb-20 lg:pb-[136px]">
          {data?.meta ? <Main data={data} /> : null}
        </div>
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default ProductPageWrapper;