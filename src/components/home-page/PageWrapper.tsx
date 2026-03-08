import React from "react";
import ContextWrapper from "../ContextWrapper";
import InnerPageWrapper from "../InnnerPageWrapper";
import type {
  HomeEntryMetaItem,
} from "../../../bcms/types/ts";
import { HomeHero } from "./Hero";
import { HomeCategories } from "./Categories";
import { HomeCta } from "./Cta";
import type { ClientConfig } from "@thebcms/client";

// barra de orígenes
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

interface Props {
  meta: HomeEntryMetaItem;
  categories: CategoryCard[];
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

        <OriginsBar items={origins} />

        <HomeCategories
          data={categories.slice(0, 3)}
          ctaTheme="dark-green"
          bcms={bcms}
        />

        <HomeCategories
          data={categories.slice(3, 6)}
          ctaTheme="orange"
          bcms={bcms}
        />

        <HomeCategories
          data={categories.slice(6, 9)}
          ctaTheme="dark-green"
          bcms={bcms}
        />

        <HomeCategories
          data={categories.slice(9, 12)}
          ctaTheme="orange"
          bcms={bcms}
        />

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