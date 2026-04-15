import { describe, expect, it } from "vitest";

import { haversineDistanceKm } from "./geo";

describe("haversineDistanceKm", () => {
  it("returns near zero for same coordinates", () => {
    const distance = haversineDistanceKm({ lat: -34.6037, lng: -58.3816 }, { lat: -34.6037, lng: -58.3816 });
    expect(distance).toBeLessThan(0.001);
  });

  it("estimates Palermo to Recoleta distance", () => {
    const distance = haversineDistanceKm({ lat: -34.5789, lng: -58.4342 }, { lat: -34.5884, lng: -58.3974 });
    expect(distance).toBeGreaterThan(2);
    expect(distance).toBeLessThan(5);
  });
});
