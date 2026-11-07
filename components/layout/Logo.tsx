import Image from "next/image";
import Link from "next/link";

/** Logo provisório (do site oficial) até o arquivo final chegar. */
export function Logo({ tamanho = 40, comTexto = false, href }: { tamanho?: number; comTexto?: boolean; href?: string }) {
  const conteudo = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center rounded-full bg-brand-olive shadow-[0_3px_0_var(--brand-olive-deep)]"
        style={{ width: tamanho, height: tamanho }}
      >
        <Image src="/logo.png" alt={comTexto ? "" : "Aurora Clean"} width={tamanho} height={tamanho} priority />
      </span>
      {comTexto && <span className="whitespace-nowrap text-[20px] font-bold tracking-tight">Aurora Clean</span>}
    </span>
  );
  return href ? (
    <Link href={href} aria-label="Aurora Clean, início">
      {conteudo}
    </Link>
  ) : (
    conteudo
  );
}
