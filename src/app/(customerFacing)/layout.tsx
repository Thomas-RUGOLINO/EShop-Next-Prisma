import { Nav, NavLink } from "@/components/Nav";

// Force Next.js to not cache the admin pages
export const dynamic = "force-dynamic";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <>
        <Nav>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/orders">My Orders</NavLink>   
        </Nav>
        <div className="container my-6">{children}</div>
        </>

    )

}