import React from 'react';
import ContextWrapper from '../ContextWrapper';
import InnerPageWrapper from '../InnnerPageWrapper';
import { HomeHero } from './Hero';
import { HomeCategories } from './Categories';
import { HomeCta } from './Cta';
import { HomeProducts } from './Products';

// Añadimos logo_dc3 a la lista de cosas que recibe el componente
const HomePageWrapper = ({ meta, categories, products, filters, bcms, logo_dc3 }: any) => {
    return (
        <ContextWrapper>
            <InnerPageWrapper bcms={bcms}>
                <HomeHero
                    title={meta.hero_title}
                    description={meta.hero_description}
                    gallery={(meta as any).hero_gallery || [meta.hero_cover_image]}
                    bcms={bcms}
                    // IMPORTANTE: Aquí le entregamos el gato al Hero
                    logo_dc3={logo_dc3} 
                />
                
                {/* Enviamos la lista completa de categorías (Marvel, DC, Disney) */}
                <HomeCategories data={categories} ctaTheme="dark-green" bcms={bcms} />
                
                <HomeCta
                    title={meta.cta_title}
                    description={meta.cta_description}
                    image={meta.cta_cover_image}
                    cta={{ label: meta.cta_label, href: meta.cta_link }}
                    bcms={bcms}
                />
                
                <HomeProducts products={products} filters={filters} bcms={bcms} />
            </InnerPageWrapper>
        </ContextWrapper>
    );
};

export default HomePageWrapper;