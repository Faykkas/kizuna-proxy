// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/language";

// Bandeau « Notice » du haut de page. Jusqu'au 5 décembre 2026, il parle des commandes de Noël (12 langues) et renvoie vers
// l'article ; ensuite (ou si on retire CHRISTMAS_NOTICE_END), il revient à l'annonce enregistrée dans la table `announce`.
const CHRISTMAS_NOTICE_END = new Date(2026, 11, 6).getTime(); // jusqu'au 5 décembre inclus
const CHRISTMAS_URL = "/blog/order-christmas-gifts-from-japan-2026";
const CHRISTMAS_TEXT = {
  en: "Christmas orders are open until December 5. Order now, limited holiday items sell out.",
  fr: "Commandes de Noël ouvertes jusqu'au 5 décembre. Commandez dès maintenant, les articles de fêtes s'épuisent.",
  ja: "クリスマスのご注文は12月5日まで受付中。数量限定のホリデー商品は売り切れるので、今すぐご注文を。",
  es: "Pedidos de Navidad abiertos hasta el 5 de diciembre. Pide ya: los artículos navideños se agotan.",
  it: "Ordini di Natale aperti fino al 5 dicembre. Ordina subito: gli articoli natalizi si esauriscono.",
  de: "Weihnachtsbestellungen bis 5. Dezember. Jetzt bestellen, Weihnachtsartikel sind schnell ausverkauft.",
  ko: "크리스마스 주문은 12월 5일까지입니다. 한정 홀리데이 상품은 품절되니 지금 주문하세요.",
  zh: "圣诞订单受理至12月5日。限量圣诞商品会售罄，请立即下单。",
  pt: "Pedidos de Natal abertos até 5 de dezembro. Peça agora: itens natalinos esgotam.",
  id: "Pesanan Natal dibuka sampai 5 Desember. Pesan sekarang, barang Natal cepat habis.",
  vi: "Nhận đơn Giáng sinh đến 5/12. Đặt ngay, hàng Giáng sinh sẽ hết nhanh.",
  nl: "Kerstbestellingen open tot 5 december. Bestel nu, kerstartikelen raken uitverkocht.",
};

export default function AnnounceBar({ announce }: { announce?: any }) {
  const { lang } = useLanguage();
  const [christmas, setChristmas] = useState(false);
  useEffect(() => {
    setChristmas(Date.now() < CHRISTMAS_NOTICE_END);
  }, []);

  if (!christmas && !announce?.active) return null;
  return (
    <div className="announce-bar">
      <div className="announce-inner">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{color:"var(--gold)",flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span className="announce-pill">Notice</span>
        {christmas ? (
          <span className="announce-text">
            <a href={CHRISTMAS_URL} style={{ color: "inherit", textDecoration: "none" }}>
              🎄 {CHRISTMAS_TEXT[lang] || CHRISTMAS_TEXT.en} <strong>→</strong>
            </a>
          </span>
        ) : (
          <span className="announce-text">
            {announce.text_en}
            {announce.from_date && <> <strong>{announce.from_date}</strong></>}
            {announce.to_date && <> → <strong>{announce.to_date}</strong></>}
          </span>
        )}
      </div>
    </div>
  );
}
