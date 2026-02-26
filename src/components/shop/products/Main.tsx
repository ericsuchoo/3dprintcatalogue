import React, { useEffect, useMemo, useState } from 'react';
import SearchIcon from '../../../assets/icons/search.svg?raw';
import TrashIcon from '../../../assets/icons/trash.svg?raw';
import type { ProductLite } from '../../../utils/product';
import type {
    ProductBrandEntryMetaItem,
    ProductCategoryEntryMetaItem,
    ProductGenderEntryMetaItem,
} from '../../../../bcms/types/ts';
import type { ClientConfig } from '@thebcms/client';
import type { ProductFilter } from '../../home-page/Products';
import { FormCheck } from '../../form/Check';
import { ProductCard } from '../../ProductCard';

interface Props {
    products: ProductLite[];
    genders: ProductGenderEntryMetaItem[];
    categories: ProductCategoryEntryMetaItem[];
    brands: ProductBrandEntryMetaItem[];
    bcms: ClientConfig;
}

export const Main: React.FC<Props> = ({
    products,
    genders,
    categories,
    brands,
    bcms,
}) => {
    const [loadedProducts, setLoadedProducts] = useState(12);
    const [searchVal, setSearchVal] = useState('');
    
    // Inicializamos solo con los filtros estáticos
    const [filters, setFilters] = useState<ProductFilter[]>([
        { active: false, type: 'price', label: 'Lowest', value: 0 },
        { active: false, type: 'price', label: 'Most expensive', value: 1 },
        { active: false, type: 'popularity', label: 'Best selling', value: 0 },
        { active: false, type: 'popularity', label: 'New comer', value: 1 },
    ]);

    // CORRECCIÓN: Este useEffect ahora observa los cambios en genders, categories y brands
    useEffect(() => {
        const gendersFilters = genders.map((gender) => ({
            active: false,
            label: gender.title,
            value: gender.slug,
            type: 'gender',
        })) as ProductFilter[];

        const categoriesFilters = categories.map((category) => ({
            active: false,
            label: category.title,
            value: category.slug,
            type: 'category',
        })) as ProductFilter[];

        const brandsFilters = brands.map((brand) => ({
            active: false,
            label: brand.title,
            value: brand.slug,
            type: 'brand',
        })) as ProductFilter[];

        // Seteamos los filtros base + los dinámicos
        setFilters([
            { active: false, type: 'price', label: 'Lowest', value: 0 },
            { active: false, type: 'price', label: 'Most expensive', value: 1 },
            { active: false, type: 'popularity', label: 'Best selling', value: 0 },
            { active: false, type: 'popularity', label: 'New comer', value: 1 },
            ...brandsFilters,
            ...categoriesFilters,
            ...gendersFilters,
        ]);
    }, [genders, categories, brands]); // IMPORTANTE: Agregamos las dependencias aquí

    const activeFilters = useMemo(() => filters.filter((e) => e.active), [filters]);

    const clearFilters = () => {
        setFilters(prev => prev.map(f => ({ ...f, active: false })));
        setSearchVal('');
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter((e) => {
                let show = true;
                if (searchVal) {
                    show = show && `${e.title} ${e.brand.title} ${e.gender.title} ${e.categories.map((i) => i.meta.en?.title).join(' ')}`
                        .toLowerCase()
                        .includes(searchVal.toLowerCase());
                }

                activeFilters.forEach((filter) => {
                    switch (filter.type) {
                        case 'gender': show = show && e.gender.slug === filter.value; break;
                        case 'category': show = show && !!e.categories.find((c) => c.meta.en?.slug === filter.value); break;
                        case 'brand': show = show && e.brand.slug === filter.value; break;
                    }
                });
                return show;
            })
            .sort((a, b) => {
                const priceFilter = activeFilters.find((e) => e.type === 'price');
                if (priceFilter) {
                    if (priceFilter.value === 0) return a.price - b.price;
                    if (priceFilter.value === 1 && priceFilter.active) return b.price - a.price;
                }
                return 0;
            });
    }, [products, activeFilters, searchVal]);

    const setProductFilter = (value: string | number) => {
        setFilters((prev) => prev.map((p) => p.label === value ? { ...p, active: !p.active } : p));
    };

    const loadMore = () => setLoadedProducts((prev) => prev + 12);

    return (
        <div className="mt-24 lg:mt-32 px-5 md:px-10 pb-20 max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 items-start lg:grid-cols-[200px,1fr]">
                
                <aside className="lg:sticky lg:top-28 self-start">
                    <div className="grid grid-cols-1 gap-8 border border-zinc-200 p-6 rounded-xl bg-white/5 backdrop-blur-sm">
                        <div className="text-xl font-bold uppercase tracking-tighter">Filtros</div>
                        
                        {/* TIPO / GÉNERO (Aquí aparecerán Robot, Dragón, etc.) */}
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-5 opacity-40">Tipo de Personaje</div>
                            <div className="grid grid-cols-1 gap-4">
                                {filters.filter((e) => e.type === 'gender').map((filter, index) => (
                                    <FormCheck 
                                        key={index} 
                                        value={filter.label as string} 
                                        label={filter.label} 
                                        onCheck={setProductFilter} 
                                        checked={filter.active} 
                                        size="sm" 
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-5 opacity-40">Precio</div>
                            <div className="grid grid-cols-1 gap-4">
                                {filters.filter((e) => e.type === 'price').map((filter, index) => (
                                    <FormCheck key={index} value={filter.label as string} label={filter.label} onCheck={setProductFilter} checked={filter.active} size="sm" />
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-5 opacity-40">Categorias</div>
                            <div className="grid grid-cols-1 gap-4">
                                {filters.filter((e) => e.type === 'category').map((filter, index) => (
                                    <FormCheck key={index} value={filter.label as string} label={filter.label} onCheck={setProductFilter} checked={filter.active} size="sm" />
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-5 opacity-40">Creadores</div>
                            <div className="grid grid-cols-1 gap-4">
                                {filters.filter((e) => e.type === 'brand').map((filter, index) => (
                                    <FormCheck key={index} value={filter.label as string} label={filter.label} onCheck={setProductFilter} checked={filter.active} size="sm" />
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="lg:col-start-2">
                    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8 mb-10">
                        <label className="flex items-center px-5 flex-1 border border-zinc-200 rounded-lg group focus-within:border-black transition-all">
                            <div dangerouslySetInnerHTML={{ __html: SearchIcon }} className="w-4 h-4 opacity-30 group-focus-within:opacity-100" />
                            <input
                                type="search"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                placeholder="Buscar figuras..."
                                className="bg-transparent px-4 py-4 w-full text-lg focus:outline-none placeholder:text-zinc-400"
                            />
                        </label>
                        <button
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors font-bold uppercase text-xs tracking-widest"
                            onClick={clearFilters}
                        >
                            <div dangerouslySetInnerHTML={{ __html: TrashIcon }} className="w-4 h-4" />
                            <span>Limpiar Filtros</span>
                        </button>
                    </div>

                    <div className="mb-8 border-b border-zinc-100 pb-4">
                        <div className="text-[10px] font-black uppercase tracking-[3px] opacity-40">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'Modelo' : 'Modelos'} Encontrados
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                card={product}
                                style={{ display: index < loadedProducts ? '' : 'none' }}
                                bcms={bcms}
                            />
                        ))}
                    </div>

                    {loadedProducts < filteredProducts.length && (
                        <div className="flex justify-center mt-16">
                            <button
                                className="px-14 py-4 border-2 border-black text-black font-black uppercase text-xs tracking-[4px] hover:bg-black hover:text-white transition-all duration-300"
                                onClick={loadMore}
                            >
                                Ver más modelos
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};