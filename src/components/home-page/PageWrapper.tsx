import ContextWrapper from '../ContextWrapper';
import InnerPageWrapper from '../InnnerPageWrapper';
import type {
    HomeEntryMetaItem,
    ProductCategoryEntryMetaItem,
    ProductGenderEntryMetaItem,
} from '../../../bcms/types/ts';
import { type ProductLite } from '../../utils/product';
import { HomeHero } from './Hero';
import { HomeCategories } from './Categories';
import { HomeCta } from './Cta';
import { HomeProducts } from './Products';
import type { ClientConfig } from '@thebcms/client';
import { bcmsPublic } from '../../bcms-public.ts';

interface Props {
    meta: HomeEntryMetaItem;
    categories: {
        meta: ProductCategoryEntryMetaItem;
        productsCount: number;
    }[];
    products: ProductLite[];
    filters: {
        genders: ProductGenderEntryMetaItem[];
        categories: ProductCategoryEntryMetaItem[];
    };
    bcms: ClientConfig;
}

const HomePageWrapper: React.FC<Props> = ({
    meta,
    categories,
    products,
    filters,
    bcms,
}) => {
    // Obtenemos la config de BCMS una sola vez para limpiar el código
    const bcmsConfig = bcmsPublic.getConfig();

    return (
        <ContextWrapper>
            <InnerPageWrapper bcms={bcms}>
                {/* CAMBIO: Ahora pasamos 'gallery' en lugar de 'image' */}
                <HomeHero
                    title={meta.hero_title}
                    description={meta.hero_description}
                    // Si tienes un campo de galería en BCMS llamado 'hero_gallery', úsalo.
                    // Si no, metemos la imagen actual en un array [meta.hero_cover_image]
                    gallery={(meta as any).hero_gallery || [meta.hero_cover_image]}
                    bcms={bcmsConfig}
                />
                
                <HomeCategories
                    data={categories.slice(0, 6)}
                    ctaTheme="dark-green"
                    bcms={bcmsConfig}
                />
                
                <HomeCta
                    title={meta.cta_title}
                    description={meta.cta_description}
                    image={meta.cta_cover_image}
                    cta={{
                        label: meta.cta_label,
                        href: meta.cta_link,
                    }}
                    bcms={bcmsConfig}
                />
                
                <HomeCategories
                    data={categories.slice(6, 12)}
                    ctaTheme="orange"
                    bcms={bcmsConfig}
                />
                
                <HomeProducts
                    products={products}
                    filters={filters}
                    bcms={bcmsConfig}
                />
            </InnerPageWrapper>
        </ContextWrapper>
    );
};

export default HomePageWrapper;