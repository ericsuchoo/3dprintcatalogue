import React, { type PropsWithChildren } from 'react';
import Header from './layout/Header';
import type { ClientConfig } from '@thebcms/client';

interface Props extends PropsWithChildren {
    bcms: ClientConfig;
}

const InnnerPageWrapper: React.FC<Props> = ({ children }) => {
    return (
        <div className="relative">
            {/* Quitamos la prop bcms del Header si tu Header no la espera */}
            <Header />
            <main>{children}</main>
        </div>
    );
};

export default InnnerPageWrapper;