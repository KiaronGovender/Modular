"use client";
import { ChevronDown, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex max-w-300 justify-between items-center mx-auto h-16 px-8">
        {/* Logo*/}
        <Link
          href=""
          className="text-xl tracking-tight hover:opacity-70 transition-opacity"
        >
          Modular
        </Link>
        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className={`transition-colors ${isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Products
          </Link>
          <Link
            href="/order"
            className={`transition-colors ${isActive("/order") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Orders
          </Link>
        </nav>
        {/*actions*/}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-all group">
              <User className="size-4" />
              <span>Role</span>
              <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
          <Link
            href="/cart"
            className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ShoppingCart className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
