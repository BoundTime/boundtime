type Transaction = {
  description: string;
  amount: number;
  created_at: string;
};

type Props = {
  balance: number;
  transactions?: Transaction[];
};

export function BoundDollarsCard({ balance, transactions = [] }: Props) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center rounded-md text-xl"
          style={{ width: 32, height: 32, background: "rgba(201,169,81,0.1)" }}
        >
          🪙
        </div>
        <span className="text-[13px] font-medium text-gray-400">BoundDollars</span>
      </div>

      {/* Betrag */}
      <p
        className="text-[28px] font-medium leading-tight"
        style={{ color: "#8A6D2E" }}
      >
        {Math.round(Number(balance)).toLocaleString("de-DE")}
      </p>
      <p className="text-[12px] text-gray-500 mt-0.5">Dein aktuelles Guthaben</p>

      {/* Transaktions-History */}
      {transactions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
          {transactions.slice(0, 5).map((tx, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-[12px] text-gray-400 truncate min-w-0">{tx.description}</span>
              <span
                className="text-[12px] font-medium shrink-0"
                style={{ color: tx.amount >= 0 ? "#1D9E75" : "#e55" }}
              >
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount} BD
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
