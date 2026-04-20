'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {LogOut} from "lucide-react";
import NavItems from "@/components/NavItems";
import { signOut } from "@/lib/actions/auth.actions";

const UserDropdown = ({ user, intialStocks }: { user: { id: string; name: string; email: string; image?: string | null } | null, intialStocks: StockWithWatchlistStatus[] }) => {

    const router = useRouter();

    if (!user) {
        return (
            <Button
                onClick={() => router.push('/sign-in')}
                className='bg-yellow-500 text-yellow-900 hover:bg-yellow-600 font-bold'
            >
                Sign In
            </Button>
        );
    }

    const handleSignOut = async () => {
       await signOut();
       router.push('/sign-in')
    }

    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center gap-3 text-gray-400 hover:text-yellow-500 p-0 sm:p-2'>
                    <Avatar className='h-8 w-8'>
                        {user.image && (
                            <AvatarImage src={user.image} alt={user.name} />
                        )}
                        <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
                            {user.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className='hidden md:flex flex-col items-start'>
                        <span className='text-base font-medium text-gray-400'>
                            {user.name}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='text-gray-400'>
                <DropdownMenuLabel>
                    <div className='flex relative items-center justify-between gap-3 py-2'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                                {user.image && (
                                    <AvatarImage src={user.image} alt={user.name} />
                                )}
                                <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
                                    {user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-base font-medium text-gray-400'>
                                    {user.name}
                                </span>
                                <span className='text-sm text-gray-500'>
                                    {user.email}
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={handleSignOut}
                            variant='ghost'
                            size='icon'
                            className='text-gray-400 hover:text-yellow-500 transition-colors'
                        >
                            <LogOut className='w-4 h-4'/>
                        </Button>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className='sm:hidden bg-gray-600'/>
                <nav className='sm:hidden'>
                    <NavItems
                        intialStocks={intialStocks}
                        isAuthenticated={!!user}
                        userEmail={user?.email}
                    />
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown
