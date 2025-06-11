import Navbar from "@/components/feed/navbar";

export default function Layout({
    children
}: {
    children: React.ReactNode;
}){
    return (
        <main>
            <Navbar/>
            {children}
        </main>
    )
}