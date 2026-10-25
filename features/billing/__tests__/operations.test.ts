import { describe, expect, it } from "vite-plus/test";
import { canStartSubscriptionCheckout } from "../operations";

describe("Creem subscription checkout", (): void => {
  it("allows re-subscription only when access has ended", (): void => {
    expect(canStartSubscriptionCheckout(false)).toBe(true);
    expect(canStartSubscriptionCheckout()).toBe(true);
    expect(canStartSubscriptionCheckout(true)).toBe(false);
  });
});
