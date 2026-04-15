export const homeStats = [
  {
    key: "co2",
    value: "12kg",
    label: "CO2 AHORRADO",
    tone: "primary",
  },
  {
    key: "saved",
    value: "$4.2k",
    label: "PESOS SALVADOS",
    tone: "neutral",
  },
] as const;

export const categories = ["Panadería", "Restos", "Súper", "Frutas", "Café", "Veggie"];

export const fallbackOffers = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    businessId: "22222222-2222-2222-2222-222222222222",
    businessName: "Panadería La Unión",
    title: "Pack Surprise Mix",
    rescuePriceArs: 1200,
    originalPriceArs: 3000,
    quantityAvailable: 12,
    pickupStartAt: new Date().toISOString(),
    pickupEndAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
    isFeatured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    businessId: "44444444-4444-4444-4444-444444444444",
    businessName: "Green Bites",
    title: "Menú Green Lunch",
    rescuePriceArs: 2400,
    originalPriceArs: 4200,
    quantityAvailable: 8,
    pickupStartAt: new Date().toISOString(),
    pickupEndAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
    isFeatured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  },
] as const;
