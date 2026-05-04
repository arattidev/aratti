import Link from "next/link";

const cards = [
  {
    href: "/business" as const,
    title: "Panel de negocios",
    description: "Publicación de ofertas, órdenes y revenue.",
  },
  {
    href: "/admin" as const,
    title: "Panel admin",
    description: "Verificación, fraude, refunds y soporte.",
  },
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 56, lineHeight: 1, marginBottom: 18 }}>Aratti Console</h1>
      <p style={{ color: "#4d4d4d", fontSize: 20, maxWidth: 680 }}>
        Centro operativo mobile-first para locales y administración de la plataforma de rescate.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginTop: 32 }}>
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              borderRadius: 20,
              padding: 28,
              background: "var(--surface-lowest)",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.1 }}>{card.title}</h2>
            <p style={{ margin: 0, color: "#4f4f4f", fontSize: 17 }}>{card.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
