import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { BCMSContentManager } from '@thebcms/components-react';
import { useFavorites } from '../../../context/FavoritesContext';

interface Props {
    meta: any;
    activeColor: any;
    colorChange: (color: any) => void;
}

export const Details: React.FC<Props> = ({ meta, activeColor, colorChange }) => {
    const [selectedSize, setSelectedSize] = useState<string>(meta.sizes?.[0]?.size.meta.en.title || '');
    const { favorites, toggleFavorite } = useFavorites();

    const favoriteId = meta.model_id || meta.slug;
    const isFavorite = favorites.includes(favoriteId);

    const uniqueVersions = useMemo(() => {
        if (!meta.gallery) return [];
        return meta.gallery
            .map((item: any) => item.version || item.color)
            .filter((v: any, i: number, self: any[]) => 
                v && self.findIndex(t => t?.meta.en?.slug === v.meta.en?.slug) === i
            );
    }, [meta.gallery]);

    return (
        /* AJUSTE DE ALINEACIÓN Y ESCALA:
           - lg:mt-24: Para bajar el bloque junto con el carrusel.
           - lg:pt-[4%]: Este es el "ajuste fino" para que el título baje y se alinee con la imagen.
           - max-w-md: Para que no se vea gigante en monitores grandes.
        */
        <div className="flex flex-col relative p-6 lg:p-8 lg:pt-[4%] bg-white mt-10 lg:mt-24 lg:max-w-md mx-auto lg:ml-0">
            
            {/* HEADER: TAMAÑO REDUCIDO Y ALINEADO */}
            <div className="flex flex-col mb-8">
                <h1 className="text-2xl md:text-3xl font-bold uppercase italic tracking-tighter leading-tight text-black mb-3">
                    {meta.title}
                </h1>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">
                        Ref: { meta.model_id || '3D-DC' }
                    </span>
                    <span className="text-xl font-light text-black">${meta.price?.toFixed(2)}</span>
                </div>
            </div>

            {/* SELECCIÓN DE ESCALA */}
            <div className="mb-8">
                <p className="text-[8px] font-black uppercase tracking-[2px] mb-3 text-zinc-400">Escala Disponible</p>
                <div className="flex flex-wrap gap-2">
                    {meta.sizes?.map((s: any, i: number) => (
                        <button
                            key={i}
                            disabled={!s.available}
                            onClick={() => setSelectedSize(s.size.meta.en.title)}
                            className={classNames(
                                "w-10 h-10 border flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                                selectedSize === s.size.meta.en.title 
                                    ? "bg-black text-white border-black" 
                                    : "border-zinc-200 text-zinc-600 hover:border-black"
                            )}
                        >
                            {s.size.meta.en.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* SELECCIÓN DE VERSIÓN */}
            <div className="mb-8">
                <p className="text-[8px] font-black uppercase tracking-[2px] mb-3 text-zinc-400">Versión del Modelo</p>
                <div className="grid grid-cols-1 gap-1.5">
                    {uniqueVersions.map((v: any, i: number) => {
                        const isActive = activeColor?.meta.en.slug === v.meta.en.slug;
                        return (
                            <button
                                key={i}
                                onClick={() => colorChange(v)}
                                className={classNames(
                                    "flex items-center justify-between px-4 py-3 border text-[11px] transition-all duration-300",
                                    isActive ? "bg-black text-white border-black" : "border-zinc-100 bg-white text-zinc-800 hover:border-zinc-400"
                                )}
                            >
                                <span className="font-bold uppercase tracking-tight">{v.meta.en.title}</span>
                                {isActive && <div className="w-1 h-1 bg-white rounded-full animate-pulse" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col gap-2 mb-8">
                <button className="w-full bg-black text-white py-4 font-bold uppercase text-[10px] tracking-[2px] hover:bg-zinc-800 transition-colors">
                    Comprar Ahora
                </button>
                <button 
                    onClick={() => toggleFavorite(favoriteId)}
                    className={classNames(
                        "w-full py-4 font-bold uppercase text-[10px] tracking-[2px] border transition-colors",
                        isFavorite ? "bg-red-500 border-red-500 text-white" : "border-black text-black hover:bg-black hover:text-white"
                    )}
                >
                    {isFavorite ? 'En Favoritos' : 'Añadir a Favoritos'}
                </button>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="border-t border-zinc-100 pt-6">
                <div className="prose prose-sm text-zinc-500 font-sans italic text-[10px] leading-snug tracking-tight">
                    <BCMSContentManager items={meta.description.nodes as any} />
                </div>
            </div>
        </div>
    );
};