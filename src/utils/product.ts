import type { PropMediaDataParsed } from '@thebcms/types';
import type {
    ProductBrandEntryMetaItem,
    ProductCategoryEntry,
    ProductColorEntryMetaItem,
    ProductEntry,
    ProductEntryMetaItem,
    ProductGenderEntryMetaItem,
    ProductSizeGroup,
} from '../../bcms/types/ts';

export interface ProductLite {
    title: string;
    slug: string;
    cover: PropMediaDataParsed;
    cloudflare_cover?: string; // <-- Añadimos esto para la miniatura de la tienda
    price: number;
    discounted_price?: number;
    sizes: ProductSizeGroup[];
    gender: ProductGenderEntryMetaItem;
    categories: ProductCategoryEntry[];
    brand: ProductBrandEntryMetaItem;
    units_sold: number;
    date: number;
    color: ProductColorEntryMetaItem;
    // Añadimos la galería completa para que llegue al componente Details
    gallery: any[]; 
}

export const productToLite = (product: ProductEntry): ProductLite => {
    const meta = product.meta.en as ProductEntryMetaItem;

    return {
        title: meta.title,
        slug: meta.slug,
        // Mantenemos cover por compatibilidad, pero priorizamos Cloudflare si existe
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
        color: meta.gallery[0].color.meta.en as ProductColorEntryMetaItem,
        // Mapeamos la galería para incluir el campo de Cloudflare
        gallery: meta.gallery.map(item => ({
            ...item,
            cloudflare_url: (item as any).cloudflare_url
        })),
    };
};