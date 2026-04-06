// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { detectLang, LANG_LABELS } from "../translations";

// ─── EVENTS CONTENT ───────────────────────────────────────────────────────────
const EVENTS_CONTENT = {
  en: {
    eyebrow: "Tokyo Events · Exclusive Access",
    title: "Tokyo Events &",
    titleEm: "Exclusive Releases",
    lead: "Some of the most sought-after items in Japan are never listed online — they only exist at specific events, pop-ups, and store openings. We are on the ground in Tokyo and attend these for you.",
    whatTitle: "What We Cover",
    howTitle: "How It Works",
    pricingTitle: "Pricing is discussed privately",
    pricingText: "Event service fees vary depending on the event, queue time, purchase limits, and item cost. We do not publish a fixed price for events because every situation is different. Contact us directly for a clear, honest quote.",
    ctaText: "Interested in a Tokyo event?",
    ctaBtn: "Contact us privately →",
    faqTitle: "Frequently Asked Questions",
    cards: [
      { icon: "🎴", title: "Pokémon Center Events", desc: "Exclusive card releases, promo cards, and limited plush only at official Pokémon Center Tokyo locations. Some sets sell out within hours." },
      { icon: "🎮", title: "Nintendo Store Tokyo", desc: "Japan-exclusive Switch games, limited bundles, event-only merch, and collabs only sold at Nintendo's flagship store in Shibuya Parco." },
      { icon: "👟", title: "Supreme & Streetwear Drops", desc: "Weekly Supreme Japan drops, BAPE exclusives, Neighborhood collabs, and limited sneaker releases across Harajuku and Shibuya." },
      { icon: "🏮", title: "Pop-up Events & Collabs", desc: "Anime collaborations, brand pop-ups, Wonder Festival, limited artist merch — goods that disappear in a matter of hours." },
      { icon: "🃏", title: "Card Game Events", desc: "Pokémon, One Piece TCG, Dragon Ball Super — exclusive promo cards and event merch only for in-person attendees." },
      { icon: "🏪", title: "Department Store Exclusives", desc: "Isetan, Mitsukoshi, Takashimaya — Japanese department stores regularly host exclusive brand events unavailable anywhere else." },
    ],
    steps: [
      { n: "01", title: "Contact us privately", body: "Send us a message about the event or item — dates, store name, or any links you have." },
      { n: "02", title: "We check availability", body: "We confirm queue requirements, opening times, and purchase limits before any commitment." },
      { n: "03", title: "Pricing & confirmation", body: "Event pricing is discussed case by case. Everything is communicated before you pay anything." },
      { n: "04", title: "We attend & ship", body: "We queue and purchase in person. We photograph everything and ship directly to you worldwide." },
    ],
    faqs: [
      { q: "How far in advance should I contact you?", a: "As early as possible — ideally at least a week before. Some events require pre-registration. The earlier you reach out, the better we can prepare." },
      { q: "What if the item sells out?", a: "We always inform you in advance if an item is likely to sell out quickly. If we cannot secure it, you owe us nothing for the attempt." },
      { q: "Can you attend events outside Tokyo?", a: "Our primary coverage is Tokyo. Other cities may be possible but require additional discussion and travel costs." },
      { q: "Do you do live video calls during events?", a: "Yes — we can arrange a live video call so you can see items in person before we purchase. This has been very popular with our clients." },
      { q: "Is there a minimum order?", a: "No minimum. One promo card or a full event haul — we treat every request with the same level of care." },
    ],
  },
  fr: {
    eyebrow: "Événements Tokyo · Accès Exclusif",
    title: "Événements Tokyo &",
    titleEm: "Sorties Exclusives",
    lead: "Les articles les plus recherchés au Japon n'existent parfois que lors d'événements spéciaux, pop-ups et ouvertures de boutiques. Nous sommes sur place à Tokyo et y participons pour vous.",
    whatTitle: "Ce que nous couvrons",
    howTitle: "Comment ça marche",
    pricingTitle: "Les tarifs sont discutés en privé",
    pricingText: "Les frais de service varient selon l'événement, le temps de file d'attente, les limites d'achat et le coût de l'article. Contactez-nous directement pour un devis clair et honnête.",
    ctaText: "Intéressé par un événement à Tokyo ?",
    ctaBtn: "Nous contacter en privé →",
    faqTitle: "Questions fréquentes",
    cards: [
      { icon: "🎴", title: "Événements Pokémon Center", desc: "Cartes exclusives, promos, peluches limitées uniquement disponibles au Pokémon Center Tokyo. Certains sets s'épuisent en quelques heures." },
      { icon: "🎮", title: "Nintendo Store Tokyo", desc: "Jeux Switch exclusifs au Japon, bundles limités, merch d'événement uniquement vendu au flagship Nintendo de Shibuya Parco." },
      { icon: "👟", title: "Drops Supreme & Streetwear", desc: "Drops hebdomadaires Supreme Japan, exclusivités BAPE, collabs Neighborhood, et sorties sneakers limitées à Harajuku et Shibuya." },
      { icon: "🏮", title: "Pop-ups & Collabs", desc: "Collaborations anime, pop-ups de marques, Wonder Festival, merch d'artistes limité — des articles qui disparaissent en quelques heures." },
      { icon: "🃏", title: "Événements Jeux de Cartes", desc: "Pokémon, One Piece TCG, Dragon Ball Super — cartes promo exclusives et merch réservés aux participants en personne." },
      { icon: "🏪", title: "Exclusivités Grands Magasins", desc: "Isetan, Mitsukoshi, Takashimaya — les grands magasins japonais organisent régulièrement des événements exclusifs introuvables ailleurs." },
    ],
    steps: [
      { n: "01", title: "Contactez-nous en privé", body: "Envoyez-nous un message sur l'événement ou l'article — dates, nom du magasin, ou tout lien disponible." },
      { n: "02", title: "On vérifie la disponibilité", body: "Nous confirmons les conditions de file d'attente, horaires et limites d'achat avant tout engagement." },
      { n: "03", title: "Tarification & confirmation", body: "Les tarifs sont discutés au cas par cas. Tout est communiqué avant que vous payiez quoi que ce soit." },
      { n: "04", title: "On participe & on expédie", body: "On fait la queue et on achète en personne. On photographie tout et on expédie directement chez vous." },
    ],
    faqs: [
      { q: "Combien de temps à l'avance faut-il vous contacter ?", a: "Le plus tôt possible — idéalement au moins une semaine avant. Certains événements nécessitent une préinscription." },
      { q: "Et si l'article est épuisé ?", a: "Nous vous informons à l'avance si un article risque de s'épuiser rapidement. Si nous ne pouvons pas le sécuriser, vous ne nous devez rien." },
      { q: "Pouvez-vous assister à des événements hors Tokyo ?", a: "Notre couverture principale est Tokyo. D'autres villes sont possibles mais nécessitent une discussion préalable." },
      { q: "Faites-vous des appels vidéo en direct pendant les événements ?", a: "Oui — nous pouvons organiser un appel vidéo pour que vous voyiez les articles avant l'achat. Très apprécié de nos clients." },
      { q: "Y a-t-il un minimum de commande ?", a: "Aucun minimum. Une carte promo ou un haul complet — on traite chaque demande avec le même soin." },
    ],
  },
  ja: {
    eyebrow: "東京イベント · 限定アクセス",
    title: "東京イベント &",
    titleEm: "限定リリース",
    lead: "日本で最も人気のあるアイテムの多くは、特定のイベントやポップアップ、ストアオープン時にしか手に入りません。私たちは東京に拠点を置き、代わりに参加します。",
    whatTitle: "対応イベント",
    howTitle: "ご利用方法",
    pricingTitle: "料金はプライベートでご相談",
    pricingText: "イベントの種類、待機時間、購入制限、商品コストによって料金が異なります。状況に応じてご相談ください。",
    ctaText: "東京のイベントにご興味がありますか？",
    ctaBtn: "プライベートでお問い合わせ →",
    faqTitle: "よくある質問",
    cards: [
      { icon: "🎴", title: "ポケモンセンターイベント", desc: "限定カードリリース、プロモカード、東京のポケモンセンター限定グッズ。数時間で売り切れることも。" },
      { icon: "🎮", title: "ニンテンドーストア東京", desc: "日本限定スイッチゲーム、限定バンドル、渋谷パルコのニンテンドー旗艦店限定イベントグッズ。" },
      { icon: "👟", title: "シュプリーム＆ストリートウェア", desc: "毎週のシュプリームジャパンドロップ、BAPE限定品、原宿・渋谷の限定スニーカーリリース。" },
      { icon: "🏮", title: "ポップアップ＆コラボ", desc: "アニメコラボ、ブランドポップアップ、ワンダーフェスティバル、数時間で消えるアーティストグッズ。" },
      { icon: "🃏", title: "カードゲームイベント", desc: "ポケモン、ワンピースTCG、ドラゴンボールスーパー — 会場限定プロモカード＆グッズ。" },
      { icon: "🏪", title: "デパート限定品", desc: "伊勢丹、三越、高島屋 — 日本のデパートが定期的に開催する世界唯一の限定ブランドイベント。" },
    ],
    steps: [
      { n: "01", title: "プライベートでご連絡", body: "イベントや商品について — 日程、店舗名、リンクなど詳細をメッセージでお知らせください。" },
      { n: "02", title: "在庫確認", body: "参加条件、開店時間、購入制限を確認してからご案内します。" },
      { n: "03", title: "料金確認", body: "料金はケースバイケースでご相談。支払い前にすべてご説明します。" },
      { n: "04", title: "参加・発送", body: "当日並んで購入。すべての商品を写真に収め、世界中に直接発送します。" },
    ],
    faqs: [
      { q: "どれくらい前に連絡すればいいですか？", a: "できるだけ早く、理想的にはイベントの少なくとも1週間前。事前登録が必要なイベントもあります。" },
      { q: "商品が売り切れたらどうなりますか？", a: "売り切れる可能性が高い場合は事前にお知らせします。確保できなかった場合、費用は発生しません。" },
      { q: "東京以外のイベントにも参加できますか？", a: "主な対応エリアは東京です。他の都市は要相談・追加費用が発生する場合があります。" },
      { q: "イベント中にビデオ通話はできますか？", a: "可能です。購入前に実物をご確認いただけます。大変ご好評いただいています。" },
      { q: "最低注文数はありますか？", a: "最低注文数はありません。プロモカード1枚でも、大量購入でも同じように対応します。" },
    ],
  },
  es: {
    eyebrow: "Eventos Tokio · Acceso Exclusivo",
    title: "Eventos en Tokio &",
    titleEm: "Lanzamientos Exclusivos",
    lead: "Los artículos más buscados de Japón a veces solo existen en eventos especiales, pop-ups y aperturas de tiendas. Estamos en Tokio y asistimos por ti.",
    whatTitle: "Qué cubrimos",
    howTitle: "Cómo funciona",
    pricingTitle: "Los precios se discuten en privado",
    pricingText: "Las tarifas varían según el evento, el tiempo de espera y el coste del artículo. Contáctanos directamente para un presupuesto claro y honesto.",
    ctaText: "¿Interesado en un evento en Tokio?",
    ctaBtn: "Contáctanos en privado →",
    faqTitle: "Preguntas frecuentes",
    cards: [
      { icon: "🎴", title: "Eventos Pokémon Center", desc: "Cartas exclusivas, promos y peluches limitadas solo en Pokémon Center Tokyo. Algunos sets se agotan en horas." },
      { icon: "🎮", title: "Nintendo Store Tokyo", desc: "Juegos exclusivos de Switch, bundles limitados y merch de evento solo en la tienda insignia de Shibuya Parco." },
      { icon: "👟", title: "Drops Supreme & Streetwear", desc: "Drops semanales de Supreme Japan, exclusivos BAPE y lanzamientos limitados en Harajuku y Shibuya." },
      { icon: "🏮", title: "Pop-ups & Collabs", desc: "Colaboraciones anime, pop-ups de marcas, Wonder Festival — artículos que desaparecen en horas." },
      { icon: "🃏", title: "Eventos de Juegos de Cartas", desc: "Pokémon, One Piece TCG, Dragon Ball Super — promos exclusivas para asistentes en persona." },
      { icon: "🏪", title: "Exclusivos de Grandes Almacenes", desc: "Isetan, Mitsukoshi, Takashimaya — eventos exclusivos de marca no disponibles en ningún otro lugar." },
    ],
    steps: [
      { n: "01", title: "Contáctanos en privado", body: "Envíanos un mensaje sobre el evento o artículo — fechas, nombre de la tienda o cualquier enlace." },
      { n: "02", title: "Verificamos disponibilidad", body: "Confirmamos requisitos de cola, horarios y límites de compra antes de cualquier compromiso." },
      { n: "03", title: "Precio & confirmación", body: "Los precios se discuten caso a caso. Todo se comunica antes de que pagues nada." },
      { n: "04", title: "Asistimos & enviamos", body: "Hacemos cola y compramos en persona. Fotografiamos todo y enviamos directamente a ti." },
    ],
    faqs: [
      { q: "¿Con cuánta antelación debo contactaros?", a: "Lo antes posible — idealmente al menos una semana antes. Algunos eventos requieren registro previo." },
      { q: "¿Qué pasa si el artículo se agota?", a: "Te informamos de antemano si es probable que se agote. Si no podemos conseguirlo, no nos debes nada." },
      { q: "¿Podéis asistir a eventos fuera de Tokio?", a: "Nuestra cobertura principal es Tokio. Otras ciudades son posibles pero requieren discusión previa." },
      { q: "¿Hacéis videollamadas en directo?", a: "Sí — podemos organizar una videollamada para que veas los artículos antes de comprar." },
      { q: "¿Hay un mínimo de pedido?", a: "Sin mínimo. Una carta promo o un haul completo — tratamos cada pedido con el mismo cuidado." },
    ],
  },
  de: {
    eyebrow: "Tokio Events · Exklusiver Zugang",
    title: "Tokio Events &",
    titleEm: "Exklusive Releases",
    lead: "Die begehrtesten Artikel in Japan gibt es manchmal nur bei speziellen Events, Pop-ups und Store-Eröffnungen. Wir sind vor Ort in Tokio und nehmen für dich teil.",
    whatTitle: "Was wir abdecken",
    howTitle: "So funktioniert es",
    pricingTitle: "Preise werden privat besprochen",
    pricingText: "Die Servicegebühren variieren je nach Event, Wartezeit und Artikelkosten. Kontaktiere uns direkt für ein klares, ehrliches Angebot.",
    ctaText: "Interesse an einem Tokio Event?",
    ctaBtn: "Privat kontaktieren →",
    faqTitle: "Häufige Fragen",
    cards: [
      { icon: "🎴", title: "Pokémon Center Events", desc: "Exklusive Karten-Releases, Promo-Karten und limitierte Plüschtiere nur im Pokémon Center Tokyo." },
      { icon: "🎮", title: "Nintendo Store Tokyo", desc: "Japan-exklusive Switch-Spiele, limitierte Bundles und Event-Merchandise im Nintendo Flagship in Shibuya." },
      { icon: "👟", title: "Supreme & Streetwear Drops", desc: "Wöchentliche Supreme Japan Drops, BAPE Exclusives und limitierte Sneaker in Harajuku und Shibuya." },
      { icon: "🏮", title: "Pop-ups & Collabs", desc: "Anime-Kollaborationen, Marken-Pop-ups, Wonder Festival — Artikel, die in Stunden verschwinden." },
      { icon: "🃏", title: "Kartenspiel Events", desc: "Pokémon, One Piece TCG, Dragon Ball Super — exklusive Promo-Karten nur für Vor-Ort-Teilnehmer." },
      { icon: "🏪", title: "Kaufhaus-Exklusivitäten", desc: "Isetan, Mitsukoshi, Takashimaya — japanische Kaufhäuser mit exklusiven Events, die nirgendwo sonst verfügbar sind." },
    ],
    steps: [
      { n: "01", title: "Privat kontaktieren", body: "Schick uns eine Nachricht über das Event oder den Artikel — Datum, Store-Name oder Links." },
      { n: "02", title: "Verfügbarkeit prüfen", body: "Wir bestätigen Warteschlangen-Anforderungen, Öffnungszeiten und Kauflimits vor jeder Verpflichtung." },
      { n: "03", title: "Preis & Bestätigung", body: "Preise werden fallweise besprochen. Alles wird kommuniziert, bevor du bezahlst." },
      { n: "04", title: "Wir nehmen teil & versenden", body: "Wir stehen an und kaufen persönlich. Wir fotografieren alles und versenden direkt zu dir." },
    ],
    faqs: [
      { q: "Wie weit im Voraus sollte ich euch kontaktieren?", a: "So früh wie möglich — idealerweise mindestens eine Woche vorher. Manche Events erfordern Voranmeldung." },
      { q: "Was, wenn der Artikel ausverkauft ist?", a: "Wir informieren dich im Voraus, wenn ein Artikel schnell ausverkauft sein könnte. Wenn wir ihn nicht sichern können, schuldest du uns nichts." },
      { q: "Könnt ihr Events außerhalb Tokios besuchen?", a: "Unser Hauptgebiet ist Tokio. Andere Städte sind möglich, erfordern aber Zusatzdiskussion." },
      { q: "Macht ihr Live-Videoanrufe?", a: "Ja — wir können einen Live-Videoanruf arrangieren, damit du die Artikel siehst, bevor wir kaufen." },
      { q: "Gibt es eine Mindestbestellung?", a: "Keine Mindestbestellung. Eine Promo-Karte oder ein vollständiges Haul — jede Anfrage wird gleich behandelt." },
    ],
  },
  it: {
    eyebrow: "Eventi Tokyo · Accesso Esclusivo",
    title: "Eventi a Tokyo &",
    titleEm: "Uscite Esclusive",
    lead: "Gli articoli più ricercati in Giappone esistono a volte solo in eventi speciali, pop-up e aperture di negozi. Siamo sul posto a Tokyo e partecipiamo per te.",
    whatTitle: "Cosa copriamo",
    howTitle: "Come funziona",
    pricingTitle: "I prezzi si discutono in privato",
    pricingText: "Le tariffe variano in base all'evento, al tempo di coda e al costo degli articoli. Contattaci direttamente per un preventivo chiaro e onesto.",
    ctaText: "Interessato a un evento a Tokyo?",
    ctaBtn: "Contattaci in privato →",
    faqTitle: "Domande frequenti",
    cards: [
      { icon: "🎴", title: "Eventi Pokémon Center", desc: "Carte esclusive, promo e peluche limitate solo al Pokémon Center Tokyo. Alcuni set si esauriscono in ore." },
      { icon: "🎮", title: "Nintendo Store Tokyo", desc: "Giochi Switch esclusivi per il Giappone, bundle limitati e merch evento solo al flagship Nintendo di Shibuya." },
      { icon: "👟", title: "Drop Supreme & Streetwear", desc: "Drop settimanali Supreme Japan, esclusive BAPE e release limitate a Harajuku e Shibuya." },
      { icon: "🏮", title: "Pop-up & Collab", desc: "Collaborazioni anime, pop-up di brand, Wonder Festival — articoli che scompaiono in poche ore." },
      { icon: "🃏", title: "Eventi Giochi di Carte", desc: "Pokémon, One Piece TCG, Dragon Ball Super — promo esclusive per partecipanti in presenza." },
      { icon: "🏪", title: "Esclusive Grandi Magazzini", desc: "Isetan, Mitsukoshi, Takashimaya — eventi esclusivi non disponibili altrove nel mondo." },
    ],
    steps: [
      { n: "01", title: "Contattaci in privato", body: "Mandaci un messaggio sull'evento o articolo — date, nome del negozio o link disponibili." },
      { n: "02", title: "Verifichiamo disponibilità", body: "Confermiamo requisiti di coda, orari e limiti d'acquisto prima di qualsiasi impegno." },
      { n: "03", title: "Prezzo & conferma", body: "I prezzi si discutono caso per caso. Tutto viene comunicato prima che tu paghi." },
      { n: "04", title: "Partecipiamo & spediamo", body: "Facciamo la fila e acquistiamo di persona. Fotografiamo tutto e spediamo direttamente a te." },
    ],
    faqs: [
      { q: "Con quanto anticipo devo contattarvi?", a: "Il prima possibile — idealmente almeno una settimana prima. Alcuni eventi richiedono preregistrazione." },
      { q: "Cosa succede se l'articolo si esaurisce?", a: "Ti avvisiamo in anticipo se è probabile che si esaurisca. Se non riusciamo a procurartelo, non ci devi nulla." },
      { q: "Potete partecipare a eventi fuori Tokyo?", a: "La nostra copertura principale è Tokyo. Altre città sono possibili ma richiedono discussione aggiuntiva." },
      { q: "Fate videochiamate in diretta?", a: "Sì — possiamo organizzare una videochiamata per farti vedere gli articoli prima dell'acquisto." },
      { q: "C'è un ordine minimo?", a: "Nessun minimo. Una carta promo o un acquisto completo — trattiamo ogni richiesta con la stessa cura." },
    ],
  },
  ko: {
    eyebrow: "도쿄 이벤트 · 독점 접근",
    title: "도쿄 이벤트 &",
    titleEm: "한정 발매",
    lead: "일본에서 가장 인기 있는 아이템들은 특정 이벤트, 팝업, 매장 오픈에서만 구할 수 있습니다. 저희가 도쿄 현장에서 대신 참가해 드립니다.",
    whatTitle: "커버 범위",
    howTitle: "이용 방법",
    pricingTitle: "가격은 개인적으로 상담",
    pricingText: "서비스 요금은 이벤트 종류, 대기 시간, 구매 제한, 상품 비용에 따라 다릅니다. 명확한 견적을 위해 직접 연락해 주세요.",
    ctaText: "도쿄 이벤트에 관심이 있으신가요?",
    ctaBtn: "개인적으로 문의하기 →",
    faqTitle: "자주 묻는 질문",
    cards: [
      { icon: "🎴", title: "포켓몬 센터 이벤트", desc: "도쿄 포켓몬 센터에서만 구할 수 있는 한정 카드, 프로모 카드, 한정 봉제인형." },
      { icon: "🎮", title: "닌텐도 스토어 도쿄", desc: "일본 한정 스위치 게임, 한정 번들, 시부야 파르코 닌텐도 플래그십 이벤트 굿즈." },
      { icon: "👟", title: "슈프림 & 스트리트웨어 드롭", desc: "매주 슈프림 재팬 드롭, BAPE 한정판, 하라주쿠·시부야 한정 스니커즈 발매." },
      { icon: "🏮", title: "팝업 & 콜라보", desc: "애니메이션 콜라보, 브랜드 팝업, 원더 페스티벌 — 몇 시간 만에 사라지는 굿즈." },
      { icon: "🃏", title: "카드게임 이벤트", desc: "포켓몬, 원피스 TCG, 드래곤볼 슈퍼 — 현장 참가자만을 위한 한정 프로모 카드." },
      { icon: "🏪", title: "백화점 한정품", desc: "이세탄, 미츠코시, 타카시마야 — 전 세계 어디서도 구할 수 없는 한정 브랜드 이벤트." },
    ],
    steps: [
      { n: "01", title: "개인적으로 연락", body: "이벤트나 상품에 대해 메시지 주세요 — 날짜, 매장명, 링크 등 상세 정보 포함." },
      { n: "02", title: "가능 여부 확인", body: "대기 조건, 오픈 시간, 구매 제한을 확인 후 안내드립니다." },
      { n: "03", title: "가격 & 확인", body: "가격은 케이스별로 상담. 결제 전 모든 내용을 안내해 드립니다." },
      { n: "04", title: "참가 & 발송", body: "현장에서 줄 서서 구매합니다. 사진 촬영 후 전 세계로 직접 발송." },
    ],
    faqs: [
      { q: "얼마나 미리 연락해야 하나요?", a: "가능한 빨리 — 이상적으로는 이벤트 최소 1주일 전. 사전 등록이 필요한 이벤트도 있습니다." },
      { q: "상품이 품절되면 어떻게 되나요?", a: "품절 가능성이 높은 경우 미리 알려드립니다. 확보하지 못하면 비용이 발생하지 않습니다." },
      { q: "도쿄 외 이벤트도 가능한가요?", a: "주요 커버 지역은 도쿄입니다. 다른 도시는 추가 상담이 필요합니다." },
      { q: "이벤트 중 라이브 영상통화가 가능한가요?", a: "네 — 구매 전 실물을 확인할 수 있는 라이브 영상통화를 주선할 수 있습니다." },
      { q: "최소 주문량이 있나요?", a: "최소 주문량 없음. 프로모 카드 1장이든 대량 구매든 동일하게 처리합니다." },
    ],
  },
  zh: {
    eyebrow: "东京活动 · 独家渠道",
    title: "东京活动 &",
    titleEm: "限定发售",
    lead: "日本最受追捧的商品有时只在特定活动、快闪店和门店开业时才有。我们在东京现场，代您参与。",
    whatTitle: "我们的覆盖范围",
    howTitle: "服务流程",
    pricingTitle: "价格私下协商",
    pricingText: "服务费用因活动类型、排队时间、购买限制和商品费用而异。请直接联系我们获取清晰、诚实的报价。",
    ctaText: "对东京活动感兴趣？",
    ctaBtn: "私下联系我们 →",
    faqTitle: "常见问题",
    cards: [
      { icon: "🎴", title: "宝可梦中心活动", desc: "仅在东京宝可梦中心发售的限定卡牌、促销卡和限量毛绒玩具。部分产品数小时内售罄。" },
      { icon: "🎮", title: "任天堂东京商店", desc: "日本限定Switch游戏、限定套装，以及渋谷Parco任天堂旗舰店限定活动周边。" },
      { icon: "👟", title: "Supreme & 街头服饰发售", desc: "每周Supreme Japan发售、BAPE限定款，以及原宿、渋谷的限量球鞋发售。" },
      { icon: "🏮", title: "快闪活动 & 联名", desc: "动漫联名、品牌快闪、Wonder Festival——数小时内消失的限定商品。" },
      { icon: "🃏", title: "卡牌游戏活动", desc: "宝可梦、海贼王TCG、龙珠超级——仅限现场参与者的独家促销卡和周边。" },
      { icon: "🏪", title: "百货商店独家", desc: "伊势丹、三越、高岛屋——日本百货定期举办全球独一无二的品牌活动。" },
    ],
    steps: [
      { n: "01", title: "私下联系我们", body: "发送消息告知活动或商品详情——日期、店铺名称或相关链接。" },
      { n: "02", title: "确认可行性", body: "我们确认排队要求、开门时间和购买限制，再做任何承诺。" },
      { n: "03", title: "定价 & 确认", body: "价格逐案讨论。付款前所有内容均会告知。" },
      { n: "04", title: "参与 & 发货", body: "我们亲自排队购买。拍照记录后直接发货到您所在地。" },
    ],
    faqs: [
      { q: "需要提前多久联系？", a: "越早越好——理想情况下至少提前一周。部分活动需要提前登记。" },
      { q: "如果商品售罄怎么办？", a: "如果商品可能快速售罄，我们会提前告知。如果未能购得，您无需支付任何费用。" },
      { q: "可以参加东京以外的活动吗？", a: "我们主要覆盖东京。其他城市可能需要额外讨论和差旅费用。" },
      { q: "活动期间可以进行直播视频通话吗？", a: "可以——我们可以安排直播视频通话，让您在购买前亲眼看到商品。" },
      { q: "有最低起订量吗？", a: "没有最低起订量。一张促销卡或大批量购买，我们同等用心对待。" },
    ],
  },
};

// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kizuna-lang");
    if (saved && EVENTS_CONTENT[saved]) setLang(saved);
    else {
      const detected = detectLang();
      if (EVENTS_CONTENT[detected]) setLang(detected);
    }
  }, []);

  const c = EVENTS_CONTENT[lang] || EVENTS_CONTENT.en;

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a href="/" className="logo">
            <div className="logo-mark"><span>絆</span></div>
            <div>
              <div className="logo-name"><span className="g">Kizuna</span> Proxy</div>
              <div className="logo-sub">Tokyo Proxy Service</div>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <a href="/#request-wrap" className="nav-cta">Request an item</a>
            <div className="lang-selector">
              <button className="icon-btn lang-btn" onClick={() => setLangOpen(v => !v)}>
                <span style={{fontSize:".65rem",letterSpacing:".1em"}}>{LANG_LABELS[lang]}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {langOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setLangOpen(false)} />
                  <div className="lang-dropdown">
                    {Object.keys(LANG_LABELS).map(l => (
                      <button key={l} className={`lang-option ${l === lang ? "active" : ""}`}
                        onClick={() => { setLang(l); localStorage.setItem("kizuna-lang", l); setLangOpen(false); }}>
                        {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="blog-page">
        <div className="blog-wrap" style={{ maxWidth: "860px" }}>

          <div className="blog-eyebrow">{c.eyebrow}</div>
          <h1>{c.title}<br /><em>{c.titleEm}</em></h1>
          <p className="blog-lead">{c.lead}</p>

          <hr className="blog-hr" />

          <h2>{c.whatTitle}</h2>
          <div className="ev-grid">
            {c.cards.map((item, i) => (
              <div key={i} className="ev-card">
                <div className="ev-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <hr className="blog-hr" />

          <h2>{c.howTitle}</h2>
          <div className="ev-steps">
            {c.steps.map(s => (
              <div key={s.n} className="ev-step">
                <div className="ev-step-num">{s.n}</div>
                <div><strong>{s.title}</strong><p>{s.body}</p></div>
              </div>
            ))}
          </div>

          <hr className="blog-hr" />

          <div className="ev-pricing-note">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>{c.pricingTitle}</strong>
              <p>{c.pricingText}</p>
            </div>
          </div>

          <div className="blog-cta" style={{ marginTop: "2rem" }}>
            <p>{c.ctaText}</p>
            <a href="/#request-wrap" className="btn btn-gold">{c.ctaBtn}</a>
          </div>

          <hr className="blog-hr" />

          <h2>{c.faqTitle}</h2>
          <div className="ev-faq">
            {c.faqs.map((item, i) => (
              <div key={i} className="ev-faq-item">
                <strong>{item.q}</strong>
                <p>{item.a}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo-wrap">
              <div className="logo-mark" style={{width:"32px",height:"32px"}}><span style={{fontSize:".9rem"}}>絆</span></div>
              <div className="footer-logo"><span className="g">Kizuna</span> Proxy</div>
            </div>
            <p className="footer-tagline">Tokyo-based proxy service.<br />Your trusted link to Japan.</p>
          </div>
          <div>
            <p className="footer-col-title">Navigate</p>
            <a href="/" className="footer-link">Home</a>
            <a href="/#request-wrap" className="footer-link">Request an item</a>
            <a href="/#pricing" className="footer-link">Pricing</a>
          </div>
          <div>
            <p className="footer-col-title">Events</p>
            <a href="/events" className="footer-link">Tokyo Events</a>
            <a href="/#calendar" className="footer-link">Availability</a>
          </div>
          <div>
            <p className="footer-col-title">Contact</p>
            <a href="mailto:contact@kizunaproxy.com" className="footer-link">contact@kizunaproxy.com</a>
            <a href="https://wa.me/33788432501" target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
            <a href="https://discord.com/users/Faykas" target="_blank" rel="noopener noreferrer" className="footer-link">Discord</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Kizuna Proxy</p>
          <p><a href="/" className="footer-link" style={{display:"inline"}}>← Back to home</a></p>
        </div>
      </footer>
    </>
  );
}
