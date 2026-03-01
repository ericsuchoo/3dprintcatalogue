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

    const currentSizeDescription = useMemo(() => {
        const found = meta.sizes?.find((s: any) => s.size.meta.en.title === selectedSize);
        return found?.size.meta.en.description_size || '';
    }, [selectedSize, meta.sizes]);

    const uniqueVersions = useMemo(() => {
        if (!meta.gallery) return [];
        return meta.gallery
            .map((item: any) => item.version || item.color)
            .filter((v: any, i: number, self: any[]) => 
                v && self.findIndex(t => t?.meta.en?.slug === v.meta.en?.slug) === i
            );
    }, [meta.gallery]);

    return (
        /* lg:ml-auto empuja el cuadro a la derecha. lg:mr-0 quita margen derecho 'rgba(255, 0, 0, 0.93)'*/
        <div 
            className="flex flex-col relative p-6 lg:p-8 lg:pt-[5%] mt-10 lg:mt-24 lg:max-w-md mx-auto lg:ml-auto lg:mr-20"
           style={{ background: 'rgba(255, 255, 255, 0.93)'}}
        >
            <div className="flex flex-col mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tighter leading-tight text-black mb-1
                [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff drop-shadow-[2px_2px_2px_rgba(255,0,0,1)] "
                 style={{ textAlign:'center',fontFamily: 'Voga-Medium, sans-serif', background: 'rgb(255, 255, 255)' ,}}>
                    {meta.title}
                </h1>
                <div className="flex items-center justify-between border-b border-zinc-10 pb-4">
                    <span className="text-[10px] font-medium text-black uppercase tracking-widest">
                        Ref: { meta.model_id || '3D-DC' }
                    </span>
                    <span className="text-xl font-light text-black">${meta.price?.toFixed(2)}</span>
                </div>
            </div>

            <div className="mb-1">
                <p className="text-[10px] font-black uppercase tracking-[2px] mb-3 text-black">Versión del Modelo</p>
                <div className="grid grid-cols-1 gap-1.5">
                    {uniqueVersions.map((v: any, i: number) => {
                        const isActive = activeColor?.meta.en.slug === v.meta.en.slug;
                        return (
                            <button
                                key={i}
                                onClick={() => colorChange(v)}
                                className={classNames(
                                    "flex items-center justify-between px-4 py-1 border text-[11px] transition-all duration-300",
                                    isActive ? "bg-white text-black border-black" : "border-zinc-100 bg-black text-white hover:border-zinc-400"
                                )}
                            >
                                <span className="font-bold uppercase tracking-tight">{v.meta.en.title}</span>
                                {isActive && <div className="w-1 h-1 bg-black rounded-full animate-pulse" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[2px] mb-3 text-black">Escala Disponible</p>  
                   {currentSizeDescription && (
                    <div className="animate-fadeIn">
                        <p className="text-[12px] font-medium text-black italic  px-2 py-1 border-l-2 border-zinc-200"style={{ background: 'rgba(255, 255, 255, 0)' }}>
                            {currentSizeDescription}
                        </p>
                    </div>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                    {meta.sizes?.map((s: any, i: number) => (
                        <button
                            key={i}
                            disabled={!s.available}
                            onClick={() => setSelectedSize(s.size.meta.en.title)}
                            className={classNames(
                                "w-10 h-10 border flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                                selectedSize === s.size.meta.en.title ? "bg-white text-black border-black" : " bg-black border-zinc-200 text-white hover:border-black"
                            )}
                        >
                            {s.size.meta.en.title}
                        </button>
                    ))}
                </div>
                
           
            </div>

            <div className="flex flex-col gap-2 mb-8"style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
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

            <div className="border-t border-zinc-100 pt-1 ">
                <div className="prose prose-sm text-black font-sans italic text-[13px] leading-snug tracking-tight">
                    <BCMSContentManager items={meta.description.nodes as any} />
                </div>
            </div>
        </div>
    );
};