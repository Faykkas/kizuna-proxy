// Titres des colonnes du pied de page « pro » (12 langues). Les libellés de liens réutilisent translations.ts (t.nav, t.footerNav…).

export type FooterCopy = { shop: string; help: string; guides: string; contact: string; allGuides: string; pay: string; request: string };

export const FOOTER_COPY: Record<string, FooterCopy> = {
  en: { shop: "Shop & services", help: "Help", guides: "Popular guides", contact: "Contact", allGuides: "All guides", pay: "Secure payment & shipping", request: "Send a request" },
  fr: { shop: "Boutique & services", help: "Aide", guides: "Guides populaires", contact: "Contact", allGuides: "Tous les guides", pay: "Paiement sécurisé & expédition", request: "Envoyer une demande" },
  ja: { shop: "ショップ・サービス", help: "ヘルプ", guides: "人気ガイド", contact: "お問い合わせ", allGuides: "すべてのガイド", pay: "安全な決済と配送", request: "依頼を送る" },
  es: { shop: "Tienda y servicios", help: "Ayuda", guides: "Guías populares", contact: "Contacto", allGuides: "Todas las guías", pay: "Pago seguro y envío", request: "Enviar una solicitud" },
  it: { shop: "Negozio e servizi", help: "Aiuto", guides: "Guide popolari", contact: "Contatti", allGuides: "Tutte le guide", pay: "Pagamento sicuro e spedizione", request: "Invia una richiesta" },
  de: { shop: "Shop & Services", help: "Hilfe", guides: "Beliebte Ratgeber", contact: "Kontakt", allGuides: "Alle Ratgeber", pay: "Sichere Zahlung & Versand", request: "Anfrage senden" },
  ko: { shop: "상점 & 서비스", help: "도움말", guides: "인기 가이드", contact: "문의", allGuides: "모든 가이드", pay: "안전한 결제 & 배송", request: "요청 보내기" },
  zh: { shop: "商店与服务", help: "帮助", guides: "热门指南", contact: "联系我们", allGuides: "全部指南", pay: "安全支付与配送", request: "提交需求" },
  pt: { shop: "Loja e serviços", help: "Ajuda", guides: "Guias populares", contact: "Contato", allGuides: "Todos os guias", pay: "Pagamento seguro e envio", request: "Enviar um pedido" },
  id: { shop: "Toko & layanan", help: "Bantuan", guides: "Panduan populer", contact: "Kontak", allGuides: "Semua panduan", pay: "Pembayaran aman & pengiriman", request: "Kirim permintaan" },
  vi: { shop: "Cửa hàng & dịch vụ", help: "Trợ giúp", guides: "Hướng dẫn phổ biến", contact: "Liên hệ", allGuides: "Tất cả hướng dẫn", pay: "Thanh toán an toàn & vận chuyển", request: "Gửi yêu cầu" },
  nl: { shop: "Shop & diensten", help: "Hulp", guides: "Populaire gidsen", contact: "Contact", allGuides: "Alle gidsen", pay: "Veilig betalen & verzending", request: "Aanvraag versturen" },
};

export function footerCopy(lang?: string): FooterCopy {
  return FOOTER_COPY[lang || "en"] || FOOTER_COPY.en;
}
