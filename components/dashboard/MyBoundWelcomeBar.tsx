import Link from "next/link";

export type MyBoundWelcomeBarProps = {
  nick: string;
  visitsToday: number;
  unreadMessages: number;
  daysBound: number;
  boundDollars: number;
};

function berlinHour(now: Date): number {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  return parseInt(parts.find((p) => p.type === "hour")?.value ?? "12", 10);
}

function greetingPhrase(h: number): string {
  if (h >= 5 && h < 12) return "Guten Morgen";
  if (h >= 12 && h < 18) return "Guten Tag";
  return "Guten Abend";
}

function StatTile({
  value,
  label,
  href,
  valueClassName = "text-white",
  capAt99 = true,
}: {
  value: number;
  label: string;
  href: string;
  valueClassName?: string;
  capAt99?: boolean;
}) {
  const display =
    capAt99 && value > 99 ? "99+" : capAt99 ? String(value) : value.toLocaleString("de-DE");
  return (
    <Link
      href={href}
      className="group min-w-0 overflow-hidden rounded-lg border border-white/10 bg-black/30 px-2.5 py-2.5 transition-colors hover:border-white/20 hover:bg-black/40 md:px-3 md:py-2.5"
    >
      <p
        className={`text-lg font-medium leading-tight tabular-nums md:text-xl ${valueClassName}`}
      >
        {display}
      </p>
      <p className="mt-1 hyphens-auto break-words text-[10px] font-medium uppercase leading-snug tracking-wide text-gray-500 group-hover:text-gray-400">
        {label}
      </p>
    </Link>
  );
}

export function MyBoundWelcomeBar({
  nick,
  visitsToday,
  unreadMessages,
  daysBound,
  boundDollars,
}: MyBoundWelcomeBarProps) {
  const h = berlinHour(new Date());
  const greeting = greetingPhrase(h);
  const displayName = nick?.trim() || "Mitglied";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-white md:text-[19px]">
          {greeting}, {displayName}
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Hier läuft alles zusammen — dein Feed, deine Dynamiken, deine Verbindungen.
        </p>
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4 md:gap-2">
        <StatTile
          value={visitsToday}
          label="Profilbesuche heute"
          href="/dashboard/aktivitaet/besucher"
        />
        <StatTile
          value={unreadMessages}
          label="Neue Nachrichten"
          href="/dashboard/nachrichten"
          valueClassName={unreadMessages > 0 ? "text-[#7B1111]" : "text-white"}
        />
        <StatTile
          value={daysBound}
          label="Tage gebunden"
          href="/dashboard/keuschhaltung"
          valueClassName={daysBound > 0 ? "text-[#7B1111]" : "text-white"}
        />
        <StatTile
          value={boundDollars}
          label="BoundDollars"
          href="/dashboard/keuschhaltung"
          valueClassName="text-[#8A6D2E]"
          capAt99={false}
        />
      </div>
    </div>
  );
}
