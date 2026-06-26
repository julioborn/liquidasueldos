"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, FileText, SlidersHorizontal, CalendarDays, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/empresas",     label: "Empresas",      icon: Building2 },
  { href: "/empleados",    label: "Empleados",     icon: Users },
  { href: "/convenios",    label: "Convenios",     icon: FileText },
  { href: "/parametros",   label: "Parámetros",    icon: SlidersHorizontal },
  { href: "/periodos",     label: "Períodos",      icon: CalendarDays },
  { href: "/liquidaciones",label: "Liquidaciones", icon: Receipt },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
