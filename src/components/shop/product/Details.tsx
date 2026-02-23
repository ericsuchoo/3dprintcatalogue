import React, { useMemo, useState } from 'react';
import type {
    ProductColorEntry,
    ProductEntryMetaItem,
} from '../../../../bcms/types/ts';
import { BCMSContentManager } from '@thebcms/components-react';
import classNames from 'classnames';
import { useFavorites } from '../../../context/FavoritesContext'; // Importamos el nuevo hook

interface Props {
    meta: ProductEntryMetaItem;
    activeColor: ProductColorEntry;
    colorChange: (color: ProductColorEntry) => void;
}

export const Details: React.FC<Props> = ({ meta, activeColor, colorChange }) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [showNotify, setShowNotify] = useState(false);
    
    // Lógica de favoritos desde el Contexto
    const { favorites, toggleFavorite } = useFavorites();
    const isFavorite = favorites.includes(meta.slug);

    const handleFavoriteClick = () => {
        toggleFavorite(meta.slug);
        // Solo disparamos la notificación si lo estamos agregando (no quitando)
        if (!isFavorite) {
            setShowNotify(true);
            setTimeout(() => setShowNotify(false), 3000);
        }
    };

    // --- Mapeos dinámicos del BCMS ---
    const availableSizesMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        meta.sizes?.forEach((s: any) => {
            if (s.size?.meta?.en?.title) {
                map[s.size.meta.en.title.toUpperCase()] = s.available;
            }
        });
        return map;
    }, [meta.sizes]);

    const displaySizes = useMemo(() => {
        return meta.sizes?.map((s: any) => s.size.meta.en.title.toUpperCase()) || [];
    }, [meta.sizes]);

    const descriptionNodes = useMemo(() => {
        const desc = meta.description as any;
        if (!desc) return [];
        return desc.en?.nodes || desc.nodes || (Array.isArray(desc.en) ? desc.en : desc);
    }, [meta.description]);

    return (
        <div className="flex flex-col relative">
            {/* NOTIFICACIÓN TIPO TOAST (Aparece al dar Me Gusta) */}
            {showNotify && (
                <div className="fixed top-24 right-5 md:right-10 z-[60] bg-black text-white px-6 py-4 shadow-2xl animate-fade-in-down border-l-4 border-red-500">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">❤️</span>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Añadido a favoritos</p>
                            <p className="text-xs italic opacity-80 uppercase">{meta.title}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. CABECERA */}
            <div className="flex items-start justify-between mb-1">
                <h1 className="text-3xl font-bold uppercase italic tracking-tighter">
                    {meta.title}
                </h1>
                <div className="text-2xl font-light">${meta.price}</div>
            </div>

            <div className="text-[10px] font-medium text-gray-500 mb-8 uppercase tracking-widest">
                { (meta as any).units_sold || '0' } Unidades en catálogo
            </div>

            {/* 2. SELECTOR DE TALLAS */}
            <div className="mb-8">
                <div className="text-[10px] font-black uppercase tracking-[2px] mb-4 opacity-50">
                    Escalas / Tallas Disponibles
                </div>
                <div className="flex flex-wrap gap-2">
                    {displaySizes.map((sizeLabel) => {
                        const isAvailable = availableSizesMap[sizeLabel];
                        return (
                            <button
                                key={sizeLabel}
                                disabled={!isAvailable}
                                onClick={() => setSelectedSize(sizeLabel)}
                                className={classNames(
                                    "px-4 h-10 border flex items-center justify-center text-[10px] font-bold transition-all duration-200",
                                    selectedSize === sizeLabel
                                        ? "bg-black text-white border-black"
                                        : isAvailable
                                        ? "border-gray-200 hover:border-black text-black bg-white"
                                        : "bg-gray-200 border-gray-200 text-gray-500 cursor-not-allowed italic"
                                )}
                            >
                                {sizeLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. SELECCIÓN DE VERSIÓN */}
            <div className="mb-8">
                <div className="text-[10px] font-black uppercase tracking-[2px] mb-4 opacity-50">
                    Seleccionar Versión
                </div>
                <div className="flex flex-col gap-2">
                    {meta.gallery?.map((item: any, index: number) => {
                        const version = item.version || item.color;
                        if (!version) return null;
                        const isActive = activeColor?.meta.en?.slug === version.meta.en?.slug;
                        
                        return (
                            <button
                                key={index}
                                onClick={() => colorChange(version)}
                                className={classNames(
                                    "group flex items-center justify-between p-4 border transition-all duration-300",
                                    isActive 
                                        ? "bg-black text-white border-black" 
                                        : "border-gray-200 hover:border-black bg-white text-black"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={classNames(
                                        "w-2 h-2 rounded-full",
                                        isActive ? "bg-white" : "bg-gray-300 group-hover:bg-black"
                                    )} />
                                    <span className="text-sm font-bold uppercase tracking-tight">
                                        {version.meta.en?.title}
                                    </span>
                                </div>
                                {isActive && (
                                    <span className="text-[9px] font-black opacity-70 italic tracking-widest">
                                        ACTIVO
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. BOTONES DE ACCIÓN (Persistentes) */}
            <div className="flex flex-col gap-2 mb-12">
                <button 
                    onClick={handleFavoriteClick}
                    className={classNames(
                        "w-full py-4 font-bold uppercase text-sm transition-all duration-300 flex items-center justify-center gap-2 tracking-[0.1em] shadow-sm",
                        isFavorite 
                            ? "bg-red-500 text-white" 
                            : "bg-black text-white hover:bg-gray-900"
                    )}
                >
                    {isFavorite ? '❤️ EN MIS FAVORITOS' : '♡ AGREGAR A FAVORITOS'}
                </button>
                
                <button className="w-full border border-black py-4 font-bold uppercase text-sm hover:bg-black hover:text-white transition-all tracking-[0.1em]">
                    Añadir al carrito
                </button>
            </div>

            {/* 5. DESCRIPCIÓN */}
            <div className="border-t border-gray-200 pt-8">
                <div className="text-[10px] font-black uppercase tracking-[2px] mb-6">
                    Descripción del modelo
                </div>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap uppercase font-Helvetica">
                    {descriptionNodes.length > 0 ? (
                        <BCMSContentManager items={descriptionNodes as any} />
                    ) : (
                        <p className="italic text-gray-400 text-xs">Sin descripción disponible.</p>
                    )}
                </div>
            </div>
        </div>
    );
};