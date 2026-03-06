import React, { useState } from "react";
import { Gallery } from "./Gallery";
import { Details } from "./Details";

interface Props {
  meta: any;
}

export const Main: React.FC<Props> = ({ meta }) => {
  const [activeEdition, setActiveEdition] = useState<any>(() => {
    return meta?.editions?.[0] || null;
  });

  return (
    <div>
      <div className="bg-black grid grid-cols-1 gap-8 mb-14 lg:grid-cols-2">
        <Gallery
          gallery={meta?.editions || []}
          activeEdition={activeEdition}
          onEditionChange={setActiveEdition}
        />
        <Details
          meta={meta}
          activeEdition={activeEdition}
          editionChange={(e: any) => setActiveEdition(e)}
        />
      </div>
    </div>
  );
};