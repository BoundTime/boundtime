/**
 * Einheitlicher Kopf für öffentliche (pre-login) Seiten – Dark Luxury, konsistent mit App.
 */
export function PublicPageHeader({
  title,
  subtitle,
  eyebrow = "BoundTime",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-8 md:mb-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/55 md:text-[11px]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-[15px]">{subtitle}</p>
      ) : null}
      <div
        className="mt-5 h-px w-full max-w-md bg-gradient-to-r from-amber-400/35 via-amber-200/12 to-transparent"
        aria-hidden
      />
    </header>
  );
}
