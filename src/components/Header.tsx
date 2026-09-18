import Link from "next/link";

const links = [
  ["/", "Início"],
  ["/confirmar", "Confirmar presença"],
  ["/participantes", "Participantes"],
  ["/contas", "Prestação de contas"],
] as const;

export function Header() {
  return (
    <header className="siteHeader">
      <div className="navShell">
        <Link className="brand" href="/" aria-label="Página inicial">
          <span className="brandMark">EQ</span>
          <span>POLI · 30 anos</span>
        </Link>
        <nav aria-label="Navegação principal">
          {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
