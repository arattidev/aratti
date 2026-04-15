import Link from "next/link";

const rows = [
  { id: "rf_1", order: "AR-AB123", amount: 1200, status: "REQUESTED", reason: "No pude retirar" },
  { id: "rf_2", order: "AR-CD445", amount: 2400, status: "REQUESTED", reason: "Cobro duplicado" },
];

export default function AdminRefundsPage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 72px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 44 }}>Refund management</h1>
        <Link href="/admin" style={pillLink}>
          Volver
        </Link>
      </header>

      <section style={{ borderRadius: 20, background: "var(--surface-lowest)", overflow: "hidden" }}>
        {rows.map((row) => (
          <article
            key={row.id}
            style={{
              padding: "16px 20px",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              gap: 8,
              alignItems: "center",
              background: "var(--surface-lowest)",
            }}
          >
            <div>
              <strong>{row.order}</strong>
              <p style={{ margin: "2px 0 0", color: "#606060" }}>{row.reason}</p>
            </div>
            <span>${row.amount.toLocaleString("es-AR")}</span>
            <span>{row.status}</span>
            <span>{row.id}</span>
            <button style={actionButton}>Aprobar</button>
          </article>
        ))}
      </section>
    </main>
  );
}

const pillLink: React.CSSProperties = {
  minHeight: 42,
  padding: "0 14px",
  borderRadius: 999,
  background: "var(--surface-low)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 1,
  textTransform: "uppercase",
};

const actionButton: React.CSSProperties = {
  minHeight: 36,
  borderRadius: 10,
  border: "none",
  background: "var(--primary)",
  color: "#3f3400",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  padding: "0 12px",
};
