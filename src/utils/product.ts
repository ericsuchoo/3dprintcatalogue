import type { PropMediaDataParsed } from '@thebcms/types';
import type {
    ProductBrandEntryMetaItem,
    ProductCategoryEntry,
    ProductColorEntryMetaItem, // El tipo técnico sigue siendo este
    ProductEntry,
    ProductEntryMetaItem,
    ProductGenderEntryMetaItem,
    ProductSizeGroup,
} from '../../bcms/types/ts';

export interface ProductLite {
    title: string;
    slug: string;
    cover: PropMediaDataParsed;
    cloudflare_cover?: string;
    price: number;
    discounted_price?: number;
    sizes: ProductSizeGroup[];
    gender: ProductGenderEntryMetaItem;
    categories: ProductCategoryEntry[];
    brand: ProductBrandEntryMetaItem;
    units_sold: number;
    date: number;
    version: ProductColorEntryMetaItem; 
    gallery: any[]; 
}

export const productToLite = (product: ProductEntry): ProductLite => {
    const meta = product.meta.en as ProductEntryMetaItem;

    return {
        title: meta.title,
        slug: meta.slug,
        cover: meta.gallery[0].image,
        cloudflare_cover: (meta.gallery[0] as any).cloudflare_url, 
        price: meta.price,
        discounted_price: meta.discounted_price,
        sizes: meta.sizes,
        gender: meta.gender.meta.en as ProductGenderEntryMetaItem,
        categories: meta.categories,
        brand: meta.brand.meta.en as ProductBrandEntryMetaItem,
        units_sold: meta.units_sold || 0,
        date: product.createdAt,
        // ACTUALIZACIÓN: Ahora mapea a la propiedad .version que creaste
        version: meta.gallery[0].version.meta.en as ProductColorEntryMetaItem,
        gallery: meta.gallery.map(item => ({
            ...item,
            cloudflare_url: (item as any).cloudflare_url
        })),
    };
};