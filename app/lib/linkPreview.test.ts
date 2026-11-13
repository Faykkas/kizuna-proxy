import test from "node:test";
import assert from "node:assert/strict";
import { cleanTitle, decodeEntities, detectCharset, extractUrl, isPrivateAddress, parseProductHtml, parseYen, storeName } from "./linkPreview.ts";

test("aperçu : Mercari (og + prix sans devise sur boutique japonaise)", () => {
  const html = `<html><head>
    <meta property="og:title" content="【まとめ売り】任天堂 スーパーマリオ カード by メルカリ">
    <meta content="https://static.mercdn.net/item/detail/orig/photos/m123_1.jpg" property="og:image">
    <meta name="product:price:amount" content="125000">
  </head></html>`;
  const p = parseProductHtml(html, "https://jp.mercari.com/item/m12345678901");
  assert.deepEqual(p, { title: "【まとめ売り】任天堂 スーパーマリオ カード", image: "https://static.mercdn.net/item/detail/orig/photos/m123_1.jpg", priceJpy: 125000, store: "Mercari" });
});

test("aperçu : JSON-LD avec devise JPY et image relative", () => {
  const html = `<title>Blu-ray | Bushiroad</title><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","name":"BanG Dream! Blu-ray","image":["/img/a.jpg"],"offers":{"@type":"Offer","price":"10,000","priceCurrency":"JPY"}}]}</script>`;
  const p = parseProductHtml(html, "https://bushiroad-store.com/products/1");
  assert.equal(p?.priceJpy, 10000);
  assert.equal(p?.image, "https://bushiroad-store.com/img/a.jpg");
  assert.equal(p?.title, "BanG Dream! Blu-ray"); // le nom du produit (JSON-LD) passe avant le <title> de la page
});

test("aperçu : prix dans une autre devise ignoré, prix sans devise ignoré hors boutique japonaise", () => {
  const usd = `<meta property="og:title" content="Shoe"><meta property="product:price:amount" content="120"><meta property="product:price:currency" content="USD">`;
  assert.equal(parseProductHtml(usd, "https://example.com/p")?.priceJpy, null);
  const bare = `<meta property="og:title" content="Shoe"><meta property="product:price:amount" content="120">`;
  assert.equal(parseProductHtml(bare, "https://example.com/p")?.priceJpy, null);
  assert.equal(parseProductHtml(bare, "https://www.nike.com/jp/t/x")?.priceJpy, 120);
});

test("aperçu : pages de blocage anti-robots = pas d'aperçu", () => {
  assert.equal(parseProductHtml("<title>Just a moment...</title>", "https://suruga-ya.jp/x"), null);
  assert.equal(parseProductHtml("<title>Access Denied</title>", "https://japan.coach.com/x"), null);
  assert.equal(parseProductHtml("<html></html>", "https://a.jp/x"), null);
});

test("aperçu : titres nettoyés et entités décodées", () => {
  assert.equal(cleanTitle("任天堂 リュック｜Yahoo!フリマ（旧PayPayフリマ）"), "任天堂 リュック");
  assert.equal(cleanTitle("Mini Shoulder Bag - Shop"), "Mini Shoulder Bag");
  assert.equal(cleanTitle("Nike Air Max Plus の新品/中古フリマ(通販)｜スニダン"), "Nike Air Max Plus");
  assert.equal(cleanTitle("Amazon.co.jp: ポケモンカード デッキ"), "ポケモンカード デッキ");
  assert.equal(decodeEntities("Nike Moon Shoe OG Women&#x27;s &amp; more&nbsp;!"), "Nike Moon Shoe OG Women's & more !");
});

test("aperçu : lecture des prix en yens", () => {
  assert.equal(parseYen("38,500"), 38500);
  assert.equal(parseYen("¥4,400"), 4400);
  assert.equal(parseYen("12100.0"), 12100);
  assert.equal(parseYen(605), 605);
  assert.equal(parseYen("0"), null);
  assert.equal(parseYen("prix"), null);
  assert.equal(parseYen("999999999"), null);
});

test("aperçu : noms de boutiques", () => {
  assert.equal(storeName("jp.mercari.com"), "Mercari");
  assert.equal(storeName("paypayfleamarket.yahoo.co.jp"), "Yahoo! Flea Market");
  assert.equal(storeName("item.rakuten.co.jp"), "Rakuten");
  assert.equal(storeName("www.amazon.co.jp"), "Amazon Japan");
  assert.equal(storeName("www.kickslab.com"), "kickslab.com");
});

test("aperçu : jeu de caractères (Shift_JIS de Premium Bandai)", () => {
  assert.equal(detectCharset("text/html; charset=Shift_JIS", ""), "shift_jis");
  assert.equal(detectCharset("text/html", '<meta charset="windows-31j">'), "shift_jis");
  assert.equal(detectCharset(null, ""), "utf-8");
});

test("aperçu : adresses internes refusées", () => {
  for (const ip of ["127.0.0.1", "10.0.0.5", "172.16.3.4", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) assert.equal(isPrivateAddress(ip), true, ip);
  for (const ip of ["104.18.2.3", "8.8.8.8", "2606:4700::1111"]) assert.equal(isPrivateAddress(ip), false, ip);
});

test("aperçu : lien extrait d'un texte collé", () => {
  assert.equal(extractUrl("regarde ça https://jp.mercari.com/item/m123 merci"), "https://jp.mercari.com/item/m123");
  assert.equal(extractUrl("https://item.fril.jp/abc。"), "https://item.fril.jp/abc");
  assert.equal(extractUrl("Pokémon cards please"), null);
  assert.equal(extractUrl("http://localhost"), null);
});
