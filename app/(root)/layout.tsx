import Header from "@/components/Header";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";


const Layout = async ({children} : {children : React.ReactNode}) => {

    const session = await auth.api.getSession({ headers: await headers()});

    const user = session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
    } : null;

    return (
        <main className='min-h-screen text-gray-400'>
            <Header user={user} />
            <div className='container py-10'>
                {children}
            </div>
        </main>
    )
}
export default Layout
