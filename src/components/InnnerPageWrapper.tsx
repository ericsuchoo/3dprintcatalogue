import React, { type PropsWithChildren } from "react";
import Header from "./layout/Header";

type Props = PropsWithChildren;

const InnerPageWrapper: React.FC<Props> = ({ children }) => {
  return (
    <div className="relative bg-black">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default InnerPageWrapper;