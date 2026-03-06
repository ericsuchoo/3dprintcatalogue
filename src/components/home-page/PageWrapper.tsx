import React from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import type {
  HomeEntryMetaItem,
  ProductCategoryEntryMetaItem,
  ProductGenderEntryMetaItem,
} from "../../../bcms/types/ts";
import { type ProductLite } from "../../utils/product";
import { HomeHero } from "./Hero";
import { HomeCategories } from "./Categories";
import { HomeCta } from "./Cta";
import { HomeProducts } from "./Products";
import type { ClientConfig } from "@thebcms/client";

// ✅ barra de "orígenes"
import { OriginsBar } from "./OriginsBar"; // <- si OriginsBar es default export, cambia esto (ver nota abajo)

export type CategoryCardMeta = {
  title: string;
  slug: string;
  gallery?: any[];
};

export type CategoryCard = {
  meta: CategoryCardMeta;
  productsCount: number;
};

type OriginItem = { id: string; label: string };

interface Props {
  meta: HomeEntryMetaItem;
  categories: CategoryCard[];
  products: ProductLite[];
  filters: {
    genders: ProductGenderEntryMetaItem[];
    categories: ProductCategoryEntryMetaItem[];
  };

  // ✅ hazlo opcional para que no reviente si no llega desde index.astro
  origins?: OriginItem[];

  bcms: ClientConfig;
}

const HomePageWrapper: React.FC<Props> = ({
  meta,
  categories,
 
  origins = [],
  bcms,
}) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper bcms={bcms}>
        <HomeHero
          title={meta.hero_title}
          description={meta.hero_description}
          gallery={(meta as any).hero_gallery || [meta.hero_cover_image]}
          logo_dc3={(meta as any).logo_dc3}
          bcms={bcms}
        />
        //*conteo de  universos cards <HomeCategories data={categories.slice(9, 12)} ctaTheme="orange" bcms={bcms} />

        <OriginsBar items={origins} />

        <HomeCategories data={categories.slice(0, 4)} ctaTheme="dark-green" bcms={bcms} />

        <HomeCategories data={categories.slice(4, 8)} ctaTheme="orange" bcms={bcms} />

        <HomeCategories data={categories.slice(8, 12)} ctaTheme="dark-green" bcms={bcms} />

        
        <HomeCta
          title={meta.cta_title}
          description={meta.cta_description}
          image={meta.cta_cover_image}
          cta={{ label: meta.cta_label, href: meta.cta_link }}
          bcms={bcms}
        />
        
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default HomePageWrapper;