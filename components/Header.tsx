import React from 'react'
import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";

const Header = ({ user }: { user: { id: string; name: string; email: string } }) => {
    return (
        <header className='sticky top-0 header'>
            <div className='container header-wrapper'>
                <Link href='/'>
                    <Image src='/assets/icons/logo.svg'
                        alt='logo'
                        priority={true}
                        width={180}
                        height={40}
                        className='h-8 w-auto cursor-pointer'
                    />
                </Link>
                <nav className='hidden sm:block'>
                    <NavItems />
                </nav>
                <UserDropdown user={user} />
            </div>
        </header>
    )
}
export default Header
