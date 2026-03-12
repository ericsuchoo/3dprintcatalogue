import React from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import { HomeHero } from "./Hero";
import { HomeCategories } from "./Categories";
import { HomeCta } from "./Cta";
import { OriginsBar } from "./OriginsBar";

export type CategoryCardMeta = {
  id_universo?: number | string;
  title: string;
  slug: string;
  gallery?: any[];
};

export type CategoryCard = {
  meta: CategoryCardMeta;
  productsCount: number;
};

type OriginItem = { id: string; label: string };

export type CharacterItem = {
  id: string;
  slug?: string;
  name: string;
  image?: string;
  universe?: string;
  href?: string;
};

interface Props {
  meta: any;
  categories: CategoryCard[];
  origins?: OriginItem[];
  characters?: CharacterItem[];
}

const HomePageWrapper: React.FC<Props> = ({
  meta,
  categories,
  origins = [],
  characters = [],
}) => {
  return (
    <ContextWrapper>
      <InnerPageWrapper>
        <HomeHero
          title={meta.hero_title}
          description={meta.hero_description}
          gallery={(meta as any).hero_gallery || [meta.hero_cover_image]}
          logo_dc3={(meta as any).logo_dc3}
        />

        <OriginsBar items={origins} />

        <HomeCategories
          data={categories.slice(0, 3)}
          ctaTheme="dark-green"
        />

        <HomeCategories
          data={categories.slice(3, 6)}
          ctaTheme="orange"
        />

        <HomeCategories
          data={categories.slice(6, 9)}
          ctaTheme="dark-green"
        />

        <HomeCategories
          data={categories.slice(9, 12)}
          ctaTheme="orange"
        />

        <HomeCta
          title={meta.cta_title}
          description={meta.cta_description}
          image={meta.cta_cover_image}
          cta={{ label: meta.cta_label, href: meta.cta_link }}
          characters={characters}
        />
      </InnerPageWrapper>
    </ContextWrapper>
  );
};

export default HomePageWrapper;