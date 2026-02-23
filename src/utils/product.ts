import { bcmsPublic } from '../bcms-public';
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
    _id: string; // Importante para tu lógica de favoritos previa
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

export function productToLite(product: ProductEntry): ProductLite {
    const meta = product.meta.en as ProductEntryMetaItem;
    return {
        _id: product._id,
        title: meta.title,
        slug: meta.slug,
        // Restauramos la ruta exacta de la imagen que usabas ayer
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
        version: meta.gallery[0].version.meta.en as ProductColorEntryMetaItem,
        gallery: meta.gallery.map(item => ({
            ...item,
            cloudflare_url: (item as any).cloudflare_url
        })),
    };
}

export const productUtils = {
    all: async (): Promise<ProductLite[]> => {
        try {
            // Usamos la plantilla "product" que ya confirmamos que responde
            const entries = (await bcmsPublic.entry.getAll('product')) as ProductEntry[];
            if (!entries) return [];
            return entries.map(p => productToLite(p));
        } catch (error) {
            console.error("Error cargando productos:", error);
            return [];
        }
    }
};