"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Spinner } from "./ui/spinner";
import { UserProfile } from "./user-profile";

type HeaderProps = {
  className?: string;
};

export interface NavigationLink {
  href: string;
  label: string;
  active?: boolean;
}

const navigationLinks: NavigationLink[] = [
  { href: "/", label: "Home", active: true },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Header({ className }: HeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  return (
    <header
      className={cn(
        "sticky z-50 top-0 bg-background border-b w-full supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
        className,
      )}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
          >
            <div className="text-2xl">
              <Logo />
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">
              shadcn.io
            </span>
          </Link>
        </div>

        {!isMobile && (
          <NavigationMenu className="flex">
            <NavigationMenuList className="gap-1">
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => e.preventDefault()}
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "lg",
                      }),
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80 hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {isPending ? (
          <Spinner />
        ) : session ? (
          <UserProfile session={session} />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "lg",
                }),
              )}
            >
              Sign In
            </Link>
            <Link
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "lg",
                }),
              )}
              href="/auth/sign-up"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function Logo(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 324 323"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Logo</title>
      <rect
        x="88.1023"
        y="144.792"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 88.1023 144.792)"
        fill="currentColor"
      />
      <rect
        x="85.3459"
        y="244.537"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 85.3459 244.537)"
        fill="currentColor"
      />
    </svg>
  );
}
