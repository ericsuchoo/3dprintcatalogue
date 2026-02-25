import React from 'react';
import ContextWrapper from '../../ContextWrapper';
import InnerPageWrapper from '../../InnnerPageWrapper';
import type { ClientConfig } from '@thebcms/client';
import { Main } from './Main';
import type { ProductLite } from '../../../utils/product';

interface Props {
    data: {
        meta: any; 
        otherProducts: ProductLite[];
    };
    bcms: ClientConfig;
}

const ProductPageWrapper: React.FC<Props> = ({ data, bcms }) => {
    return (
        <ContextWrapper>
            <InnerPageWrapper bcms={bcms}>
                <div className="container bg-black/70 pb-14 md:pb-20 lg:pb-[136px]">
                    {data.meta && (
                        <Main
                            meta={data.meta}
                            otherProducts={data.otherProducts}
                            bcms={bcms}
                        />
                    )}
                </div>
            </InnerPageWrapper>
        </ContextWrapper>
    );
};

export default ProductPageWrapper;