// @ts-nocheck
"use client";

// Fiche produit instantanée : dès qu'un lien est collé (barre de l'accueil, barre du menu, formulaire de demande),
// on lit la page via /api/preview et on montre photo, titre, boutique, prix en yens et dans la devise du visiteur.
// Si la boutique ne se laisse pas lire, un message rassurant remplace la fiche : la demande marche quand même.

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { extractUrl } from "../lib/linkPreview";
import { useCurrency } from "../lib/useCurrency";
import { formatMoney } from "../lib/currency";

const LOCALES = { en: "en-US", fr: "fr-FR", ja: "ja-JP", es: "es-ES", it: "it-IT", de: "de-DE", ko: "ko-KR", zh: "zh-CN", pt: "pt-BR", id: "id-ID", vi: "vi-VN", nl: "nl-NL" };

const COPY = {
  en: { reading: "Reading the page…", found: "Found on {store}", price: "Store price", note: "Your free quote covers everything else: our fee and shipping.", ask: "Get my free quote for this item", fail: "We can't read this page automatically. No problem: send us the link and we'll check it ourselves.", askFail: "Send this link", noPrice: "We'll confirm the price in your quote." },
  fr: { reading: "Lecture de la page…", found: "Trouvé sur {store}", price: "Prix sur la boutique", note: "Votre devis gratuit inclut le reste : nos frais et la livraison.", ask: "Obtenir mon devis gratuit pour cet article", fail: "Nous ne pouvons pas lire cette page automatiquement. Pas de souci : envoyez-nous le lien, nous vérifions nous-mêmes.", askFail: "Envoyer ce lien", noPrice: "Nous confirmons le prix dans votre devis." },
  ja: { reading: "ページを読み込み中…", found: "{store} で見つかりました", price: "ショップでの価格", note: "無料のお見積りに、手数料と送料を含めてご案内します。", ask: "この商品の無料見積りを依頼", fail: "このページは自動で読み込めませんでした。ご安心ください。リンクをお送りいただければ私たちが確認します。", askFail: "このリンクを送る", noPrice: "価格はお見積りでご案内します。" },
  es: { reading: "Leyendo la página…", found: "Encontrado en {store}", price: "Precio en la tienda", note: "Tu presupuesto gratis incluye el resto: nuestra tarifa y el envío.", ask: "Obtener mi presupuesto gratis para este artículo", fail: "No podemos leer esta página automáticamente. No pasa nada: envíanos el enlace y lo revisamos nosotros.", askFail: "Enviar este enlace", noPrice: "Confirmamos el precio en tu presupuesto." },
  it: { reading: "Lettura della pagina…", found: "Trovato su {store}", price: "Prezzo nel negozio", note: "Il tuo preventivo gratuito include il resto: la nostra tariffa e la spedizione.", ask: "Ricevi il preventivo gratuito per questo articolo", fail: "Non riusciamo a leggere questa pagina automaticamente. Nessun problema: mandaci il link e lo controlliamo noi.", askFail: "Invia questo link", noPrice: "Confermiamo il prezzo nel preventivo." },
  de: { reading: "Seite wird gelesen…", found: "Gefunden bei {store}", price: "Preis im Shop", note: "Dein kostenloses Angebot enthält den Rest: unsere Gebühr und den Versand.", ask: "Kostenloses Angebot für diesen Artikel", fail: "Diese Seite können wir nicht automatisch lesen. Kein Problem: Schick uns den Link, wir prüfen ihn selbst.", askFail: "Diesen Link senden", noPrice: "Den Preis bestätigen wir im Angebot." },
  ko: { reading: "페이지를 읽는 중…", found: "{store}에서 찾았습니다", price: "상점 가격", note: "무료 견적에 수수료와 배송비를 포함해 안내해 드립니다.", ask: "이 상품 무료 견적 받기", fail: "이 페이지는 자동으로 읽을 수 없습니다. 걱정 마세요. 링크를 보내주시면 저희가 직접 확인합니다.", askFail: "이 링크 보내기", noPrice: "가격은 견적에서 확인해 드립니다." },
  zh: { reading: "正在读取页面…", found: "来自 {store}", price: "商店价格", note: "免费报价会包含其余费用：我们的服务费和运费。", ask: "获取此商品的免费报价", fail: "我们无法自动读取此页面。没关系：把链接发给我们，我们亲自查看。", askFail: "发送此链接", noPrice: "我们会在报价中确认价格。" },
  pt: { reading: "Lendo a página…", found: "Encontrado em {store}", price: "Preço na loja", note: "Seu orçamento grátis inclui o resto: nossa tarifa e o envio.", ask: "Receber orçamento grátis para este item", fail: "Não conseguimos ler esta página automaticamente. Sem problema: envie o link e verificamos nós mesmos.", askFail: "Enviar este link", noPrice: "Confirmamos o preço no seu orçamento." },
  id: { reading: "Membaca halaman…", found: "Ditemukan di {store}", price: "Harga di toko", note: "Penawaran gratis Anda mencakup sisanya: biaya kami dan ongkos kirim.", ask: "Dapatkan penawaran gratis untuk barang ini", fail: "Kami tidak bisa membaca halaman ini secara otomatis. Tidak masalah: kirim tautannya, kami periksa sendiri.", askFail: "Kirim tautan ini", noPrice: "Kami konfirmasi harganya di penawaran Anda." },
  vi: { reading: "Đang đọc trang…", found: "Tìm thấy trên {store}", price: "Giá tại cửa hàng", note: "Báo giá miễn phí bao gồm phần còn lại: phí dịch vụ và vận chuyển.", ask: "Nhận báo giá miễn phí cho món này", fail: "Chúng tôi không đọc được trang này tự động. Không sao: gửi đường dẫn, chúng tôi tự kiểm tra.", askFail: "Gửi đường dẫn này", noPrice: "Chúng tôi xác nhận giá trong báo giá." },
  nl: { reading: "Pagina wordt gelezen…", found: "Gevonden op {store}", price: "Prijs in de winkel", note: "Je gratis offerte omvat de rest: onze kosten en de verzending.", ask: "Gratis offerte voor dit artikel", fail: "We kunnen deze pagina niet automatisch lezen. Geen probleem: stuur de link en we kijken zelf.", askFail: "Deze link versturen", noPrice: "We bevestigen de prijs in je offerte." },
};
export const LINK_PREVIEW_COPY = COPY;

type State = { status: "idle" | "loading" | "ok" | "fail"; url?: string; data?: any };

/** Suit le texte saisi : dès qu'il contient un lien, l'aperçu est chargé (après une courte pause de frappe). */
export function useLinkPreview(raw: string): State {
  const url = extractUrl(raw);
  const [state, setState] = useState<State>({ status: "idle" });
  const ctlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    ctlRef.current?.abort();
    if (!url) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading", url });
    const ctl = new AbortController();
    ctlRef.current = ctl;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`, { signal: ctl.signal });
        const j = await res.json();
        if (ctl.signal.aborted) return;
        if (j?.ok && j.preview) {
          setState({ status: "ok", url, data: j.preview });
          track("link_preview", { store: j.preview.store, price: j.preview.priceJpy ? "yes" : "no" });
        } else {
          setState({ status: "fail", url });
          track("link_preview_fail", { host: (() => { try { return new URL(url).hostname; } catch { return ""; } })() });
        }
      } catch (e) {
        if (!ctl.signal.aborted) setState({ status: "fail", url });
      }
    }, 550);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [url]);

  return state;
}

function requestHref(url: string, title?: string) {
  const q = title ? `${title}\n${url}` : url;
  return `/request?q=${encodeURIComponent(q)}&link=${encodeURIComponent(url)}`;
}

export default function LinkPreviewCard({ raw, lang = "en", variant = "hero", showButton = true }: { raw: string; lang?: string; variant?: "hero" | "nav" | "form"; showButton?: boolean }) {
  const c = COPY[lang] || COPY.en;
  const locale = LOCALES[lang] || "en-US";
  const st = useLinkPreview(raw);
  const { currency, rates } = useCurrency(locale);
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => setImgOk(true), [st.data?.image]);

  if (st.status === "idle") return null;

  if (st.status === "loading") {
    return (
      <div className={`lp lp-${variant} lp-loading`} aria-live="polite">
        <span className="lp-skel-img" aria-hidden="true" />
        <span className="lp-skel-lines" aria-hidden="true"><i /><i /></span>
        <span className="lp-reading">{c.reading}</span>
      </div>
    );
  }

  if (st.status === "fail") {
    return (
      <div className={`lp lp-${variant} lp-fail`} aria-live="polite">
        <p>{c.fail}</p>
        {showButton ? <a className="btn btn-gold lp-btn" href={requestHref(st.url)}>{c.askFail} →</a> : null}
      </div>
    );
  }

  const d = st.data;
  const rate = rates && currency !== "JPY" ? rates[currency] : null;
  const approx = d.priceJpy && rate ? formatMoney(d.priceJpy, rate, currency, locale) : null;
  return (
    <div className={`lp lp-${variant} lp-ok`} aria-live="polite">
      <a className="lp-img" href={d.url} target="_blank" rel="noopener noreferrer nofollow">
        {d.image && imgOk ? <img src={d.image} alt="" referrerPolicy="no-referrer" loading="lazy" onError={() => setImgOk(false)} /> : <span className="lp-img-empty" aria-hidden="true">🛍️</span>}
      </a>
      <div className="lp-body">
        <span className="lp-store">✓ {c.found.replace("{store}", d.store)}</span>
        <strong className="lp-title">{d.title}</strong>
        {d.priceJpy ? (
          <div className="lp-price">
            <span className="lp-price-lbl">{c.price}</span>
            <b>¥{d.priceJpy.toLocaleString("en-US")}</b>
            {approx ? <span className="lp-approx">≈ {approx}</span> : null}
          </div>
        ) : (
          <p className="lp-noprice">{c.noPrice}</p>
        )}
        <p className="lp-note">{c.note}</p>
        {showButton ? <a className="btn btn-gold lp-btn" href={requestHref(d.url, d.title)} onClick={() => track("link_preview_ask", { store: d.store })}>{c.ask} →</a> : null}
      </div>
    </div>
  );
}
