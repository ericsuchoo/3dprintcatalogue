import React from 'react';
import ContextWrapper from '../ContextWrapper';
import InnerPageWrapper from '../InnnerPageWrapper';
import type { HomeEntryMetaItem, ProductCategoryEntryMetaItem } from '../../../bcms/types/ts';
import { type ProductLite } from '../../utils/product';
import { CategoriesMini } from './CategoriesMini'; 
import { HomeProducts } from './Products';
import type { ClientConfig } from '@thebcms/client';

interface Props {
    meta: HomeEntryMetaItem;
    categories: { meta: any; productsCount: number; }[];
    products: ProductLite[];
    filters: { 
        personajes: any[]; 
        categories: ProductCategoryEntryMetaItem[]; 
    };
    bcms: ClientConfig;
}

const NewPageWrapper: React.FC<Props> = ({ meta, categories, products, filters, bcms }) => {
    
    const chunkCategories = (arr: any[], size: number) => {
        const chunks = [];
        if (!arr || arr.length === 0) return [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const categoryChunks = chunkCategories(categories, 12);
    const themes: Array<"dark-green" | "orange"> = ["dark-green", "orange"];

    return (
        <ContextWrapper>
            <InnerPageWrapper bcms={bcms}>
                <div className="pt-24 bg-[#0a0a0a] min-h-screen">
                    <div className="container pb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter">
                            Todos los <span className="text-red-600">Personajes</span>
                        </h1>
                        <div className="w-20 h-1 bg-red-600 mx-auto mt-4 mb-2"></div>
                        <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-[0.2em] font-bold">
                            Mostrando {categories.length} personajes cargados
                        </p>
                    </div>

                    <div className="flex flex-col gap-8">
                        {categoryChunks.length > 0 ? (
                            categoryChunks.map((chunk, index) => (
                                <CategoriesMini 
                                    key={index}
                                    data={chunk} 
                                    ctaTheme={themes[index % themes.length]} 
                                    bcms={bcms} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 text-zinc-700 uppercase font-black">
                                No hay personajes vinculados aún
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="bg-[#0a0a0a] pb-20">
                    <HomeProducts 
                        products={products} 
                        // Mapeamos personajes a genders por compatibilidad interna del componente
                        filters={{ ...filters, genders: filters.personajes } as any} 
                        bcms={bcms} 
                    />
                </div>
            </InnerPageWrapper>
        </ContextWrapper>
    );
};

export default NewPageWrapper;