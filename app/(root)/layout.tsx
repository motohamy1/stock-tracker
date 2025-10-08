import Header from "@/components/Header";


const Layout = ({childern} : {childern : React.ReactNode}) => {
    return (
        <main className='min-h-screen text-gray-400'>
            <Header />
            <div className='container py-10'>
                {childern}
            </div>
        </main>
    )
}
export default Layout
