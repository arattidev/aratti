import { describe, expect, it } from "vitest";

function computeServiceFee(subtotalArs: number, commissionPercentage: number): number {
  return Math.round(subtotalArs * (commissionPercentage / 100));
}

function computeSellerAmount(totalArs: number, marketplaceFeeArs: number): number {
  return totalArs - marketplaceFeeArs;
}

describe("marketplace fee calculation", () => {
  it("calculates 2% fee for a 10000 ARS subtotal", () => {
    const subtotal = 10000;
    const fee = computeServiceFee(subtotal, 2);
    expect(fee).toBe(200);
  });

  it("rounds the fee to integer ARS to avoid fractional cents in MP", () => {
    const subtotal = 1333;
    const fee = computeServiceFee(subtotal, 2);
    expect(Number.isInteger(fee)).toBe(true);
    expect(fee).toBe(27);
  });

  it("preserves full subtotal for the seller after the marketplace_fee deduction", () => {
    const subtotal = 25000;
    const fee = computeServiceFee(subtotal, 2);
    const total = subtotal + fee;
    const seller = computeSellerAmount(total, fee);
    expect(seller).toBe(subtotal);
  });

  it("never produces a negative seller amount", () => {
    const subtotal = 1;
    const fee = computeServiceFee(subtotal, 100);
    const total = subtotal + fee;
    expect(computeSellerAmount(total, fee)).toBeGreaterThanOrEqual(0);
  });
});
