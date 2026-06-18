import Link from "next/link";

const NAV = [
  { href: "/empresas", label: "Empresas" },
  { href: "/empleados", label: "Empleados" },
  { href: "/convenios", label: "Convenios" },
  { href: "/parametros", label: "Parámetros" },
  { href: "/periodos", label: "Períodos" },
  { href: "/liquidaciones", label: "Liquidaciones" },
];

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1">
      <aside className="w-56 border-r p-4">
        <p className="mb-4 font-semibold">Liquidasueldos</p>
        <nav className="flex flex-col gap-2 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
