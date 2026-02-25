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
    _id: string;
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

    // 1. Galería estándar (se mantiene pura para evitar errores de tipos)
    const gallery = meta.gallery || [];
    const firstGalleryItem = gallery.length > 0 ? gallery[0] : null;

    /**
     * 2. OPTIMIZACIÓN SOLO PARA PORTADA:
     * Usamos el Banner Card ligero para las miniaturas del catálogo.
     */
    const bannerCard = (meta as any).banner_card;
    const optimizedCover = bannerCard || firstGalleryItem?.image;

    return {
        _id: product._id,
        title: meta.title || 'Sin título',
        slug: meta.slug || '',
        
        cover: optimizedCover as PropMediaDataParsed,
        cloudflare_cover: bannerCard ? undefined : (firstGalleryItem as any)?.cloudflare_url, 
        
        price: meta.price || 0,
        discounted_price: meta.discounted_price,
        sizes: meta.sizes || [],

        gender: (meta.gender?.meta?.en || { title: 'Otro', slug: 'otro' }) as ProductGenderEntryMetaItem,
        categories: meta.categories || [],
        brand: (meta.brand?.meta?.en || { title: 'Dino Cat 3D', slug: 'dino-cat' }) as ProductBrandEntryMetaItem,
        
        units_sold: meta.units_sold || 0,
        date: product.createdAt || Date.now(),
        version: (firstGalleryItem?.version?.meta?.en || { title: 'Estándar', slug: 'estandar' }) as ProductColorEntryMetaItem,

        gallery: gallery.map(item => ({
            ...item,
            cloudflare_url: (item as any).cloudflare_url
        })),
    };
}

/**
 * AQUÍ ESTÁ LA SOLUCIÓN:
 * Añadimos el export que le falta a tu página de Favoritos
 */
export const productUtils = {
    all: async (): Promise<ProductLite[]> => {
        try {
            const entries = (await bcmsPublic.entry.getAll('product')) as ProductEntry[];
            if (!entries) return [];
            
            return entries
                .filter(p => p && p.meta && p.meta.en)
                .map(p => productToLite(p));
        } catch (error) {
            console.error("Error cargando productos para favoritos:", error);
            return [];
        }
    }
};