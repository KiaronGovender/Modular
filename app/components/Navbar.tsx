"use client";
import { ChevronDown, ShoppingCart, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "../store/appStore";
import { getRoleBadgeLabel } from "../utils/pricing";

interface Navbarprops {
  onOpenRoleSelector?: () => void;
}

const Navbar = ({ onOpenRoleSelector }: Navbarprops) => {
  const { userRole, cart, setUserRole } = useAppStore((state) => state);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-300 mx-auto px-4 sm:px-6 md:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg sm:text-xl tracking-tight hover:opacity-70 transition-opacity"
        >
          Modular
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
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
            href="/orders"
            className={`transition-colors ${
              isActive("/orders")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={onOpenRoleSelector}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-all group"
            >
              <User className="size-3.5 sm:size-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">
                {getRoleBadgeLabel(userRole)}
              </span>
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
            <ShoppingCart className="size-4 sm:size-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 size-4 sm:size-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-[10px] sm:text-xs">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Products
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive("/orders")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Orders
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
