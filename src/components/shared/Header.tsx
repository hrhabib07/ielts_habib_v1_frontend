"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { getDecodedTokenClient, logout } from "@/src/lib/auth";
import type { UserRole } from "@/src/lib/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ role: UserRole; userId: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const updateUser = () => {
      const decoded = getDecodedTokenClient();
      if (decoded) {
        setUser({ role: decoded.role, userId: decoded.userId });
      } else {
        setUser(null);
      }
    };
    updateUser();
    window.addEventListener("auth-state-changed", updateUser);
    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("auth-state-changed", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;

  const publicNav = [
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Get VIP access" },
  ];

  const studentNav = [
    { href: "/profile/reading", label: "Reading" },
    { href: "/profile/reading", label: "Analytics" }, // same page, could add #analytics later
  ];

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IELTS Habib
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            user.role === "STUDENT" ? (
              <>
                {studentNav.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              <Link
                href={user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/instructor"}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )
          ) : (
            publicNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {user ? (
            <div className="relative" ref={profileRef}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setProfileOpen((o) => !o)}
              >
                <User className="h-4 w-4" />
                Profile
                <ChevronDown className="h-4 w-4" />
              </Button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card py-1 shadow-lg">
                  {user.role === "STUDENT" && (
                    <Link
                      href="/profile/reading"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Sparkles className="h-4 w-4" />
                    Get VIP access
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-4 mt-8">
                {user ? (
                  user.role === "STUDENT" ? (
                    <>
                      <Link href="/profile/reading" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium">
                        Reading
                      </Link>
                      <Link href="/profile/reading" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium">
                        Analytics
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/instructor"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium"
                    >
                      Dashboard
                    </Link>
                  )
                ) : (
                  publicNav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))
                )}
                <div className="border-t pt-4 space-y-2">
                  {user ? (
                    <>
                      {user.role === "STUDENT" && (
                        <Link href="/profile/reading" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm">
                          Profile
                        </Link>
                      )}
                      <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm">
                        <Sparkles className="h-4 w-4" /> Get VIP access
                      </Link>
                      <button
                        type="button"
                        className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
                        onClick={() => { setMobileMenuOpen(false); logout(); }}
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium">
                        Login
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
