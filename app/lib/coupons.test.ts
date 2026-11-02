import test from "node:test";
import assert from "node:assert/strict";
import { checkCoupon, COUPON_KINDS, endOfDayTokyo, generateCode, isValidCode, normalizeCode, priceWithCoupon, type CouponRow } from "./coupons.ts";

const base: CouponRow = { id: "c1", code: "NOEL500", kind: "christmas", amount_jpy: 500, customer_email: null, expires_at: null, max_total_uses: null, active: true };
const now = new Date("2026-12-10T00:00:00Z");
const ok = { email: "anna@example.com", now, usedByThisEmail: false, totalUsed: 0, link: { isShipping: false, feeBeforeCoupon: 2500 } };

test("montants conseillés : Noël 500, Trustpilot 500, Reddit 500, Reddit avec photos 750", () => {
  assert.equal(COUPON_KINDS.christmas.amount, 500);
  assert.equal(COUPON_KINDS.trustpilot.amount, 500);
  assert.equal(COUPON_KINDS.reddit.amount, 500);
  assert.equal(COUPON_KINDS.reddit_photo.amount, 750);
  assert.equal(COUPON_KINDS.christmas.personal, false);
  assert.equal(COUPON_KINDS.trustpilot.personal && COUPON_KINDS.reddit.personal && COUPON_KINDS.reddit_photo.personal, true);
});

test("codes : saisie nettoyée (majuscules, sans espaces), validité, génération sans caractères ambigus", () => {
  assert.equal(normalizeCode("  noel 500 "), "NOEL500");
  assert.equal(normalizeCode("kz-ab12_cd"), "KZ-AB12CD");
  assert.equal(normalizeCode("é<script>"), "SCRIPT");
  assert.equal(normalizeCode(null), "");
  assert.equal(isValidCode("NOEL500"), true);
  assert.equal(isValidCode("AB"), false);
  assert.equal(isValidCode("-ABC"), false);
  for (let i = 0; i < 200; i++) {
    const c = generateCode();
    assert.match(c, /^KZ-[A-HJ-NP-Z2-9]{8}$/);
    assert.equal(isValidCode(c), true);
  }
});

test("date limite : fin de journée à Tokyo, inclus", () => {
  assert.equal(endOfDayTokyo("2026-12-31"), "2026-12-31T14:59:59.000Z");
  assert.equal(endOfDayTokyo("31/12/2026"), null);
  assert.equal(endOfDayTokyo("2026-02-30"), null);
});

test("coupon valable : accepté", () => {
  assert.deepEqual(checkCoupon({ ...ok, coupon: base }), { ok: true });
});

test("refus : inconnu ou désactivé → invalid", () => {
  assert.deepEqual(checkCoupon({ ...ok, coupon: null }), { ok: false, reason: "invalid" });
  assert.deepEqual(checkCoupon({ ...ok, coupon: { ...base, active: false } }), { ok: false, reason: "invalid" });
});

test("refus : lien de livraison ou sans frais de service → not_eligible", () => {
  assert.deepEqual(checkCoupon({ ...ok, coupon: base, link: { isShipping: true, feeBeforeCoupon: 2500 } }), { ok: false, reason: "not_eligible" });
  assert.deepEqual(checkCoupon({ ...ok, coupon: base, link: { isShipping: false, feeBeforeCoupon: 0 } }), { ok: false, reason: "not_eligible" });
});

test("refus : expiré, mais valable le jour même jusqu'à la fin de la journée", () => {
  const exp = endOfDayTokyo("2026-12-10");
  assert.deepEqual(checkCoupon({ ...ok, coupon: { ...base, expires_at: exp }, now: new Date("2026-12-10T14:00:00Z") }), { ok: true });
  assert.deepEqual(checkCoupon({ ...ok, coupon: { ...base, expires_at: exp }, now: new Date("2026-12-10T16:00:00Z") }), { ok: false, reason: "expired" });
});

test("refus : email absent ou invalide → email_required", () => {
  assert.deepEqual(checkCoupon({ ...ok, coupon: base, email: "" }), { ok: false, reason: "email_required" });
  assert.deepEqual(checkCoupon({ ...ok, coupon: base, email: "pas-un-email" }), { ok: false, reason: "email_required" });
});

test("coupon nominatif : seulement pour son client, sinon « invalid » (on ne révèle pas qu'il existe)", () => {
  const personal = { ...base, code: "KZ-ABCD2345", kind: "trustpilot", customer_email: "Anna@Example.com" };
  assert.deepEqual(checkCoupon({ ...ok, coupon: personal }), { ok: true });
  assert.deepEqual(checkCoupon({ ...ok, coupon: personal, email: "bob@example.com" }), { ok: false, reason: "invalid" });
});

test("une seule utilisation par client", () => {
  assert.deepEqual(checkCoupon({ ...ok, coupon: base, usedByThisEmail: true }), { ok: false, reason: "used" });
});

test("limite d'utilisations totales", () => {
  const limited = { ...base, max_total_uses: 10 };
  assert.deepEqual(checkCoupon({ ...ok, coupon: limited, totalUsed: 9 }), { ok: true });
  assert.deepEqual(checkCoupon({ ...ok, coupon: limited, totalUsed: 10 }), { ok: false, reason: "sold_out" });
});

test("prix avec coupon : la remise réduit les frais de service, les frais PayPal (6 %) sont recalculés", () => {
  // Article 10 000 + frais 2 500 : PayPal = 6 % de 12 500 = 750 → total 13 250.
  const before = priceWithCoupon({ itemAmount: 10000, fee: 2500, tax: 0, couponAmount: 0 });
  assert.deepEqual(before, { discount: 0, fee: 2500, paypal: 750, total: 13250 });
  // Coupon 500 : frais 2 000, PayPal 6 % de 12 000 = 720 → total 12 720 (le client économise 530, dont 30 de frais PayPal).
  const after = priceWithCoupon({ itemAmount: 10000, fee: 2500, tax: 0, couponAmount: 500 });
  assert.deepEqual(after, { discount: 500, fee: 2000, paypal: 720, total: 12720 });
});

test("la remise ne dépasse jamais les frais de service (pas de frais négatifs)", () => {
  const r = priceWithCoupon({ itemAmount: 3000, fee: 300, tax: 0, couponAmount: 750 });
  assert.equal(r.discount, 300);
  assert.equal(r.fee, 0);
  assert.equal(r.total, 3000 + 0 + 0 + Math.floor((3000 * 6 + 50) / 100));
});

test("les taxes ne sont pas remisées mais entrent dans la base des frais PayPal", () => {
  const r = priceWithCoupon({ itemAmount: 0, fee: 2500, tax: 1000, couponAmount: 500 });
  assert.equal(r.fee, 2000);
  assert.equal(r.paypal, Math.floor(((0 + 2000 + 1000) * 6 + 50) / 100));
  assert.equal(r.total, 2000 + 1000 + r.paypal);
});

test("e-mail du coupon : code, montant, mode d'emploi, date limite en date de Tokyo", async () => {
  const { couponMessage } = await import("./coupons.ts");
  const m = couponMessage({ code: "KZ-ABCD2345", amount_jpy: 750, kind: "reddit_photo", expires_at: endOfDayTokyo("2026-12-31") });
  assert.equal(m.subject, "Your ¥750 Kizuna Proxy coupon");
  assert.match(m.body, /KZ-ABCD2345/);
  assert.match(m.body, /Thank you so much for your review/);
  assert.match(m.body, /Valid until 2026-12-31\./);
  const noel = couponMessage({ code: "NOEL500", amount_jpy: 500, kind: "christmas", expires_at: null });
  assert.doesNotMatch(noel.body, /Valid until/);
  assert.match(noel.body, /Thank you for shopping/);
});
