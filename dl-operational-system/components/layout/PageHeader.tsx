import { cn } from "@/lib/utils";

/**
 * Cabeçalho de página padronizado: label pequeno + título + subtítulo,
 * com slot opcional de ações à direita. Reutilizado em todas as páginas
 * para manter consistência visual.
 *
 * `titleHighlight` permite destacar uma palavra do título em verde neon
 * (ex.: "VISÃO GERAL DA OPERAÇÃO" com "GERAL" em destaque).
 */
export function PageHeader({
  label,
  title,
  titleHighlight,
  subtitle,
  actions,
  className,
}: {
  label: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      <div className="space-y-2">
        <p className="dl-label">{label}</p>
        <h1 className="text-2xl font-bold tracking-tight text-content md:text-3xl">
          {renderTitle(title, titleHighlight)}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-sm text-content-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

function renderTitle(title: string, highlight?: string) {
  if (!highlight || !title.includes(highlight)) return title;
  const [before, after] = title.split(highlight);
  return (
    <>
      {before}
      <span className="text-neon">{highlight}</span>
      {after}
    </>
  );
}
