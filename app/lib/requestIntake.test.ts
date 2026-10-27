import test from "node:test";
import assert from "node:assert/strict";
import { cleanRequest, discordPayload, originOf } from "./requestIntake.ts";

const base = { name: "Ana", email: " Ana@Example.COM ", country: "Brazil", items: "  Coach bag  ", status: "converted", customer_id: "evil" };

test("une demande valide est nettoyée : email en minuscules, texte rogné, statut forcé à « new », customer_id ignoré", () => {
  const r = cleanRequest(base);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.row.email, "ana@example.com");
  assert.equal(r.row.items, "Coach bag");
  assert.equal(r.row.status, "new");
  assert.equal(r.row.customer_id, null);
  assert.equal(r.row.lead_type, "consumer");
});

test("refuse : pas d'objet, email invalide, demande vide, date invalide", () => {
  assert.equal(cleanRequest(null).ok, false);
  assert.equal(cleanRequest([]).ok, false);
  assert.equal(cleanRequest({ ...base, email: "pas-un-email" }).ok, false);
  assert.equal(cleanRequest({ ...base, items: "   " }).ok, false);
  assert.equal(cleanRequest({ ...base, deadline: "demain" }).ok, false);
  assert.equal(cleanRequest({ ...base, deadline: "2026-13-45" }).ok, false);
});

test("nom : repli sur le début de l'email ; business reconnu ; champs inconnus ignorés", () => {
  const r = cleanRequest({ email: "bob@x.io", items: "figurines", lead_type: "business", inconnu: "x", is_admin: true });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.row.name, "bob");
  assert.equal(r.row.lead_type, "business");
  assert.ok(!("inconnu" in r.row) && !("is_admin" in r.row));
});

test("longueurs bornées et caractères de contrôle retirés", () => {
  const r = cleanRequest({ email: "a@b.co", items: "x".repeat(9000), country: "FR\u0000\u0007" });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.row.items.length, 5000);
  assert.equal(r.row.country, "FR");
});

test("origine : utm, source déclarée ou page du site", () => {
  const o = (x: Partial<Parameters<typeof originOf>[0]>) => originOf({ utm_source: null, utm_content: null, discovery_source: null, ...x });
  assert.equal(o({}), "—");
  assert.equal(o({ utm_content: "page:/blog/buy-sanrio-japan" }), "/blog/buy-sanrio-japan");
  assert.equal(o({ utm_source: "facebook", utm_content: "groupe-pokemon" }), "facebook · groupe-pokemon");
});

test("message Discord : champs vides absents, valeurs bornées, pas de mentions", () => {
  const r = cleanRequest({ email: "a@b.co", items: "y".repeat(3000), country: "USA" });
  assert.ok(r.ok);
  if (!r.ok) return;
  const p = discordPayload(r.row, "https://exemple/admin");
  assert.deepEqual(p.allowed_mentions.parse, []);
  const names = p.embeds[0].fields.map((f) => f!.name);
  assert.ok(names.includes("Demande") && names.includes("Email") && !names.includes("Budget"));
  for (const f of p.embeds[0].fields) assert.ok(f!.value.length <= 1000);
  assert.ok(p.content.length <= 2000);
});
