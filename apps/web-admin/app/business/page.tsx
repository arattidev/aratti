import Link from "next/link";

const items = [
  { label: "Ventas hoy", value: "$82.400" },
  { label: "Packs activos", value: "14" },
  { label: "Packs vendidos", value: "37" },
  { label: "Ganancias", value: "$312.900" },
];

export default function BusinessPage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 72px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
        <h1 style={{ margin: 0, fontSize: 50, lineHeight: 1 }}>Business Dashboard</h1>
        <Link
          href="/"
          style={{
            borderRadius: 999,
            background: "var(--surface-low)",
            padding: "10px 18px",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Back
        </Link>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
        {items.map((item) => (
          <article key={item.label} style={{ borderRadius: 18, padding: 20, background: "var(--surface-lowest)" }}>
            <p style={{ margin: 0, color: "#5f5f5f", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</p>
            <h2 style={{ margin: "10px 0 0", fontSize: 34 }}>{item.value}</h2>
          </article>
        ))}
      </section>

      <section style={{ borderRadius: 20, padding: 24, background: "var(--surface-lowest)" }}>
        <h2 style={{ marginTop: 0, fontSize: 34 }}>Acciones rápidas</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button style={primaryButton}>Crear oferta</button>
          <button style={secondaryButton}>Pausar oferta</button>
          <button style={secondaryButton}>Ver órdenes</button>
          <button style={secondaryButton}>Configurar payouts</button>
        </div>
      </section>
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #6c5a00 0%, #efc900 100%)",
  color: "#2f2800",
  padding: "0 18px",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};

const secondaryButton: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 12,
  border: "none",
  background: "var(--surface-low)",
  color: "#111",
  padding: "0 18px",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};
