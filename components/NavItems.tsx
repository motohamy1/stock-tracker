'use client'

import React from 'react'
import Link from "next/link";
import { NAV_ITEMS } from '@/lib/constants';
import {usePathname} from "next/navigation";


const NavItems = () => {

    const pathName = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathName === '/';
        return pathName.startsWith(path);
    }

    return (
        <nav className='flex text-gray-500 font-bold items-center justify-center'>
            <ul className='flex gap-6'>
                {NAV_ITEMS.map(({ name, href}) => (
                    <li key={href}>
                        <Link href={href} className={`hover:text-yellow-500 transition-colors ${isActive(href) ? 'text-gray-100' : ''}`}>
                            {name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
export default NavItems
