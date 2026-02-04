"use client";
import { ChevronDown, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "../store/appStore";
import { getRoleBadgeLabel } from "../utils/pricing";

interface Navbarprops {
  onOpenRoleSelector?: () => void;
}

const Navbar = ({ onOpenRoleSelector }: Navbarprops) => {
  const { userRole, cart } = useAppStore((state) => state);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-300 mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl tracking-tight hover:opacity-70 transition-opacity"
        >
          Modular
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className={`transition-colors ${
              isActive("/")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Products
          </Link>
          <Link
            href="/dashboard"
            className={`transition-colors ${
              isActive("/dashboard")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={onOpenRoleSelector}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-all group"
            >
              <User className="size-4" />
              <span className="text-sm">{getRoleBadgeLabel(userRole)}</span>
              <ChevronDown className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            {userRole === "retail" && (
              <span className="absolute -top-1 -right-1 size-2 bg-primary rounded-full animate-pulse" />
            )}
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ShoppingCart className="size-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 size-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
