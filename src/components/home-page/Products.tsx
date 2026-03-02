import React, { useMemo, useState, useEffect } from 'react';
import type { ProductLite } from '../../utils/product';
import type { ClientConfig } from '@thebcms/client';
import { FormCheck } from '../form/Check';
import { ProductCard } from '../ProductCard';

export interface ProductFilter {
    type: 'category' | 'gender' | 'brand' | 'price' | 'popularity';
    label: string;
    value: string | number; 
    active: boolean;
}

export const HomeProducts: React.FC<{ products: ProductLite[]; filters: any; bcms: ClientConfig }> = ({ products, filters, bcms }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const allFilters = useMemo(() => [
        ...filters.genders.map((g: any) => ({ label: g.title, value: g.slug })),
        ...filters.categories.map((c: any) => ({ label: c.title, value: c.slug }))
    ], [filters]);

    const filteredProducts = useMemo(() => {
        if (activeFilters.length === 0) return products;
        return products.filter(p => 
            activeFilters.includes(p.gender.slug) || 
            p.categories.some(c => activeFilters.includes(c.meta.en?.slug || ''))
        );
    }, [products, activeFilters]);

    return (
        <section className="bg-black/80 py-12">
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-[1200px] mx-auto px-4 ">
                    {allFilters.map((f) => (
                        <FormCheck 
                            key={f.value}
                            value={f.value.toString()}
                            label={f.label} 
                            checked={activeFilters.includes(f.value)} 
                            onCheck={() => setActiveFilters(prev => 
                                prev.includes(f.value) ? prev.filter(v => v !== f.value) : [...prev, f.value]
                            )} 
                        />
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: isMobile ? '15px' : '25px',
                    maxWidth: '1300px',
                    margin: '0 auto',
                    padding: '0 20px',
                    width: '100%'
                }}>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.slug} card={product} bcms={bcms} />
                    ))}
                </div>
            </div>
        </section>
    );
};