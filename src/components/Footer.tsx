import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div>
        <strong>POLI — Engenharia Química</strong>
        <p>Um encontro feito pela turma, para a turma.</p>
      </div>
      <Link href="/admin">Área da organização</Link>
    </footer>
  );
}
