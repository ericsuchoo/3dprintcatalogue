import React, { type ButtonHTMLAttributes } from 'react';
import ArrowIcon from '../assets/icons/arrow.svg?raw';
import classNames from 'classnames';

export type BtnTheme = 'dark-green' | 'light-green' | 'orange';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    to?: string;
    theme: BtnTheme;
    label: string;
}

export const Btn: React.FC<BtnProps> = ({ to, theme, label, ...rest }) => {
    const classes = classNames(
        'relative flex items-center px-8 py-4 rounded-[40px] focus:outline-none transition-all duration-300 hover:brightness-110 hover:shadow-lg font-Helvetica',
        {
            'bg-appAccent-darkGreen text-white': theme === 'dark-green',
            'bg-appAccent-lightGreen text-appText': theme === 'light-green',
            'bg-appAccent-orange text-white': theme === 'orange',
        },
    );

    const content = (
        <>
            <span className="text-[18px] md:text-[24px] leading-none uppercase font-bold tracking-tight">
                {label}
            </span>
            <div
                dangerouslySetInnerHTML={{ __html: ArrowIcon }}
                className="w-5 h-5 ml-3 fill-current md:w-6 md:h-6"
            />
        </>
    );

    return (
        <>
            {to ? (
                <a href={to} className={classes}>
                    {content}
                </a>
            ) : (
                <button className={classes} {...rest}>
                    {content}
                </button>
            )}
        </>
    );
};