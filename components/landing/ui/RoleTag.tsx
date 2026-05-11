type Role = "Hotwife" | "Cuckold" | "Bull" | "Paar" | string;

const roleStyles: Record<string, { bg: string; text: string; border: string }> = {
  Hotwife: {
    bg: "rgba(139,26,26,0.18)",
    text: "#E87070",
    border: "rgba(139,26,26,0.45)",
  },
  Cuckold: {
    bg: "rgba(74,56,120,0.18)",
    text: "#9A82E0",
    border: "rgba(74,56,120,0.45)",
  },
  Bull: {
    bg: "rgba(50,80,50,0.20)",
    text: "#6EC27A",
    border: "rgba(50,80,50,0.45)",
  },
  Paar: {
    bg: "rgba(200,169,81,0.12)",
    text: "#C8A951",
    border: "rgba(200,169,81,0.35)",
  },
};

const fallback = {
  bg: "rgba(90,90,90,0.18)",
  text: "#A89BC0",
  border: "rgba(90,90,90,0.35)",
};

export function RoleTag({ role }: { role: Role }) {
  const s = roleStyles[role] ?? fallback;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {role}
    </span>
  );
}
