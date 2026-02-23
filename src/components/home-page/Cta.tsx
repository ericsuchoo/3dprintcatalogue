import React from 'react';
import { BCMSImage } from '@thebcms/components-react';
import type { PropMediaDataParsed } from '@thebcms/types';
import { Btn } from '../Btn';
import type { ClientConfig } from '@thebcms/client';

interface Props {
    title: string;
    description: string;
    image: PropMediaDataParsed;
    cta: {
        label: string;
        href: string;
    };
    bcms: ClientConfig;
}

export const HomeCta: React.FC<Props> = ({ title, description, image, cta, bcms }) => {
    return (
        <section className="relative overflow-hidden group">
            <div className="container relative z-10 py-20 md:py-32">
                <div className="max-w-[630px]">
                    <h2 className="text-white text-[32px] leading-tight font-bold mb-4 md:text-[48px] font-Helvetica drop-shadow-lg">
                        {title}
                    </h2>
                    <p className="text-white/90 text-lg leading-snug mb-10 md:text-xl font-Helvetica drop-shadow-md">
                        {description}
                    </p>
                    <div className="inline-block">
                        <Btn
                            theme="orange" // Ahora coincide con appAccent.orange de tu tailwind.config
                            label={cta.label}
                            to={cta.href}   // Usamos 'to' como pide tu Btn.tsx
                        />
                    </div>
                </div>
            </div>
            
            <div className="absolute top-0 left-0 size-full z-0">
                {/* Overlay oscuro para que el texto resalte */}
                <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-500 group-hover:opacity-30" />
                <BCMSImage
                    media={image}
                    clientConfig={bcms}
                    className="size-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
            </div>
        </section>
    );
};