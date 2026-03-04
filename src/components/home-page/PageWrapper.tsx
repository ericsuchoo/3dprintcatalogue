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

// ✅ Nuevo tipo genérico para cards (sirve para BCMS y para D1)
export type CategoryCardMeta = {
  title: string;
  slug: string;
  gallery?: any[]; // puede ser BCMS media o { url: string }
};

export type CategoryCard = {
  meta: CategoryCardMeta;
  productsCount: number; // en tu caso será conteo de personajes por universo
};

interface Props {
  meta: HomeEntryMetaItem;

  // ✅ antes: ProductCategoryEntryMetaItem; ahora: tarjeta genérica
  categories: CategoryCard[];

  products: ProductLite[];

  // 👇 por ahora lo dejamos igual para no romper tu HomeProducts
  // luego lo migramos a D1 si quieres
  filters: {
    genders: ProductGenderEntryMetaItem[];
    categories: ProductCategoryEntryMetaItem[];
  };

  bcms: ClientConfig;
}

const HomePageWrapper: React.FC<Props> = ({ meta, categories, products, filters, bcms }) => {
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

        <HomeCategories data={categories.slice(0, 6)} ctaTheme="dark-green" bcms={bcms} />

        <HomeCta
          title={meta.cta_title}
          description={meta.cta_description}
          image={meta.cta_cover_image}
          cta={{ label: meta.cta_label, href: meta.cta_link }}
          bcms={bcms}
        />

        <HomeCategories data={categories.slice(6, 12)} ctaTheme="orange" bcms={bcms} />

        <HomeProducts products={products} filters={filters} bcms={bcms} />
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default HomePageWrapper;