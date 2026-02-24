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
// 1. Importar el hook de favoritos
import { useFavorites } from '../../../context/FavoritesContext';

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
    // 2. Obtener la lista de favoritos
    const { favorites } = useFavorites();
    const [loadedProducts, setLoadedProducts] = useState(12);
    const [searchVal, setSearchVal] = useState('');
    const [filters, setFilters] = useState<ProductFilter[]>([
        { active: false, type: 'price', label: 'Lowest', value: 0 },
        { active: false, type: 'price', label: 'Most expensive', value: 1 },
        { active: false, type: 'popularity', label: 'Best selling', value: 0 },
        { active: false, type: 'popularity', label: 'New comer', value: 1 },
    ]);

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

        setFilters((prev) => [
            ...prev,
            ...brandsFilters,
            ...categoriesFilters,
            ...gendersFilters,
        ]);
    }, []);

    const activeFilters = useMemo(() => {
        return filters.filter((e) => e.active);
    }, [filters]);

    const clearFilters = () => {
        const _filters = filters.map((filter) => ({
            ...filter,
            active: false,
        })) as ProductFilter[];

        setFilters(_filters);
        setSearchVal('');
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter((e) => {
                // 3. FILTRO FIJO: Solo incluir si el producto está en favoritos
                if (!favorites.includes(e.slug)) {
                    return false;
                }

                let show = true;
                if (searchVal) {
                    show = show &&
                        `${e.title} $${e.price} ${
                            e.discounted_price ? '$' + e.discounted_price : ''
                        } ${e.brand.title} ${e.gender.title} ${e.categories
                            .map((i) => i.meta.en?.title)
                            .join(' ')}`
                        .toLowerCase()
                        .includes(searchVal.toLowerCase());
                }

                activeFilters.forEach((filter) => {
                    switch (filter.type) {
                        case 'gender':
                            show = show && e.gender.slug === filter.value;
                            break;
                        case 'category':
                            show = show && !!e.categories.find(
                                (c) => c.meta.en?.slug === filter.value,
                            );
                            break;
                        case 'brand':
                            show = show && e.brand.slug === filter.value;
                            break;
                    }
                });

                return show;
            })
            // Los sorts se mantienen igual
            .sort((a, b) => {
                const priceFilter = activeFilters.find((e) => e.type === 'price');
                if (priceFilter) {
                    if (priceFilter.value === 0) return a.price - b.price;
                    if (priceFilter.value === 1 && priceFilter.active) return b.price - a.price;
                }
                return 0;
            })
            .sort((a, b) => {
                const popularityFilter = activeFilters.find((e) => e.type === 'popularity');
                if (popularityFilter) {
                    if (popularityFilter.value === 0) return b.units_sold - a.units_sold;
                    if (popularityFilter.value === 1 && popularityFilter.active) return b.date - a.date;
                }
                return 0;
            });
    }, [products, activeFilters, searchVal, favorites]); // 4. Agregar favorites a las dependencias

    const setProductFilter = (value: string | number) => {
        setFilters(filters.map((p) => p.label === value ? { ...p, active: !p.active } : p));
    };

    const loadMore = () => {
        setLoadedProducts((prev) => prev + 12);
    };

    return (
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 items-start lg:grid-cols-[198px,1fr] lg:grid-rows-[auto,1fr]">
            <div className="lg:row-span-2 sticky top-0">
                <div className="grid grid-cols-1 gap-8 border border-appGray-300 p-8">
                    <div className="text-2xl leading-none font-bold tracking-[-2%] italic text-red-500">
                        Mis Me gusta
                    </div>
                    {/* El resto del JSX de filtros se mantiene igual... */}
                    <div>
                        <div className="text-2xl leading-none tracking-[-2%] mb-5">Gender</div>
                        <div className="grid grid-cols-1 gap-4">
                            {filters.filter((e) => e.type === 'gender').map((filter, index) => (
                                <FormCheck
                                    key={index}
                                    value={filter.label as string}
                                    label={filter.label}
                                    onCheck={(value) => setProductFilter(value)}
                                    checked={!filter.active}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </div>
                    {/* ... (Price, Popularity, Categories, Brands se mantienen igual) */}
                    <div>
                        <div className="text-2xl leading-none tracking-[-2%] mb-5">Price</div>
                        <div className="grid grid-cols-1 gap-4">
                            {filters.filter((e) => e.type === 'price').map((filter, index) => (
                                <FormCheck
                                    key={index}
                                    value={filter.label as string}
                                    label={filter.label}
                                    onCheck={(value) => setProductFilter(value)}
                                    checked={!filter.active}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl leading-none tracking-[-2%] mb-5">Popularity</div>
                        <div className="grid grid-cols-1 gap-4">
                            {filters.filter((e) => e.type === 'popularity').map((filter, index) => (
                                <FormCheck
                                    key={index}
                                    value={filter.label as string}
                                    label={filter.label}
                                    onCheck={(value) => setProductFilter(value)}
                                    checked={!filter.active}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl leading-none tracking-[-2%] mb-5">Categories</div>
                        <div className="grid grid-cols-1 gap-4">
                            {filters.filter((e) => e.type === 'category').map((filter, index) => (
                                <FormCheck
                                    key={index}
                                    value={filter.label as string}
                                    label={filter.label}
                                    onCheck={(value) => setProductFilter(value)}
                                    checked={!filter.active}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl leading-none tracking-[-2%] mb-5">Brands</div>
                        <div className="grid grid-cols-1 gap-4">
                            {filters.filter((e) => e.type === 'brand').map((filter, index) => (
                                <FormCheck
                                    key={index}
                                    value={filter.label as string}
                                    label={filter.label}
                                    onCheck={(value) => setProductFilter(value)}
                                    checked={!filter.active}
                                    size="sm"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-start-2">
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
                    <label className="flex items-center px-5 flex-1 border border-appGray-300">
                        <div dangerouslySetInnerHTML={{ __html: SearchIcon }} className="w-[18px] h-[18px]" />
                        <input
                            type="search"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="Buscar en mis favoritos..."
                            className="bg-transparent px-1.5 py-[15px] w-full text-lg leading-none tracking-[-2%] placeholder:text-appText focus:outline-none"
                        />
                    </label>
                    <button
                        className="flex items-center gap-1.5 p-[15px] transition-colors duration-300 text-appError bg-appError/10 hover:bg-appError/20"
                        onClick={clearFilters}
                    >
                        <div dangerouslySetInnerHTML={{ __html: TrashIcon }} className="w-[18px] h-[18px]" />
                        <span className="text-lg leading-none tracking-[-2%] mb-1">Clear filters</span>
                    </button>
                </div>
                <div className="text-2xl leading-none tracking-[-2%] my-6">
                    {filteredProducts.length} Product{filteredProducts.length === 1 ? '' : 's'} guardado{filteredProducts.length === 1 ? '' : 's'}
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <button
                        className="flex max-w-max text-2xl leading-none tracking-[-0.5px] px-14 pt-3.5 pb-[18px] bg-white border border-appGray-400 mx-auto mt-12 transition-colors duration-300 hover:bg-appText hover:text-white"
                        onClick={loadMore}
                    >
                        Load more
                    </button>
                )}
            </div>
        </div>
    );
};