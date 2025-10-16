'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

const UserDropdown = ({ user }: { user: { id: string; name: string; email: string } }) => {

    const router = useRouter();

    const handleSignOut = async () => {
       await signOut();
       router.push('/sign-in')
    }

    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center gap-3 text-gray-400 hover:text-yellow-500'>
                    <Avatar className='h-8 w-8'>
                        {/*<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />*/}
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
                <div className='flex relative items-center gap-3 py-2'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
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
                </DropdownMenuLabel>
                <DropdownMenuSeparator className='text-gray-500'/>
                <DropdownMenuItem onClick={handleSignOut}
                                  className='text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer'>
                    <LogOut className='w-4 h-4 mr-2 hidden sm:block'/>
                        Sign-out
                </DropdownMenuItem>
                <DropdownMenuSeparator className='hidden sm:block bg-gray-600'/>
                <nav className='sm:hidden'>
                    <NavItems />
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown
