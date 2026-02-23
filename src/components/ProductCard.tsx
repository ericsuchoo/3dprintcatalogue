import React, { useState } from 'react';
import classNames from 'classnames';
import type { ProductLite } from '../utils/product';
import type { ClientConfig } from '@thebcms/client';

export interface ProductCardProps {
	card: ProductLite;
	bcms: ClientConfig; // Lo mantenemos en la interfaz por si Shop lo requiere
	className?: string;
	style?: React.CSSProperties;
}

// Eliminamos 'bcms' de la desestructuración para quitar el warning ts(6133)
export const ProductCard: React.FC<ProductCardProps> = ({ card, className, style }) => {
	const [selectedSize, setSelectedSize] = useState<any>(null);

	return (
		<div className={classNames('flex flex-col group h-full bg-white transition-all', className)} style={style}>
			<a href={`/shop/${card.slug}`} className="flex flex-col flex-grow">
				<div className="product-card-image-container mb-4">
					<img
						src={card.cloudflare_cover || card.cover?.url}
						alt={card.title}
						className="transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
				</div>
				<div className="px-1 mb-4">
					<h3 className="text-sm md:text-base font-bold text-appText truncate uppercase font-Helvetica">
						{card.title}
					</h3>
					<p className="text-[11px] text-appGray-500 uppercase tracking-widest mt-1 font-Helvetica">
						{card.version?.title}
					</p>
					<p className="text-lg font-black mt-2 text-appText font-Helvetica">
						${(card.discounted_price || card.price).toFixed(2)}
					</p>
				</div>
			</a>

			<div className="mt-auto px-1 pb-4">
				<div className="flex flex-wrap gap-2 mb-4">
					{card.sizes.map((size, index) => (
						<button
							key={index}
							className={classNames(
								'w-8 h-8 flex items-center justify-center border text-[10px] font-bold transition-all font-Helvetica',
								selectedSize?.title === size.size.meta.en?.title
									? 'bg-appText text-white border-appText'
									: 'border-appGray-200 text-appGray-500 hover:border-appText'
							)}
							onClick={() => setSelectedSize(size.size.meta.en)}
						>
							{size.size.meta.en?.title}
						</button>
					))}
				</div>
				<button
					className={classNames(
						"w-full py-3 text-[10px] font-bold uppercase border transition-all font-Helvetica tracking-widest",
						selectedSize ? "bg-appText text-white border-appText" : "bg-appGray-100 text-appGray-400 border-appGray-200"
					)}
					disabled={!selectedSize}
				>
					Añadir al carrito
				</button>
			</div>
		</div>
	);
};