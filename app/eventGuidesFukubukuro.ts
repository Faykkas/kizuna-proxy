// @ts-nocheck
// app/eventGuidesFukubukuro.ts
//
// Fukubukuro (sacs surprise du Nouvel An) 2027, 12 langues.
// Faits : page officielle du fukubukuro Starbucks Japon 2027 (conditions publiées le 29 octobre 2026) pour la partie Starbucks ;
// calendrier général (1er-3 janvier, précommandes de novembre-décembre) issu de guides de voyage, vérifié le 31 octobre 2026.
// Kizuna ne peut pas participer aux tirages au sort : le droit de gagner n'est pas transférable. Rendu par blog/EventGuideClient.tsx.

export const fukubukuroGuide = {
  en: {
    eyebrow: "New Year 2027 · Lucky bags",
    title: "Fukubukuro 2027, Japan's New Year lucky bags: ", titleEm: "dates, lotteries and how we can help",
    lead: "Fukubukuro are sealed lucky bags sold around New Year in Japan. Many sell out in November and December through online lotteries and pre-orders, so the time to plan is now. Here is how they work, and what we can and cannot do for you.",
    factsH: "Key facts",
    facts: [
      ["In-store sales", "January 1, or the first sale of the year on January 2 (most shops) or January 3 (some shops). In 2027: Friday 1, Saturday 2, Sunday 3"],
      ["Pre-orders", "Many bags are pre-ordered or won by lottery in November and December, before New Year"],
      ["Starbucks 2027 bag", "¥9,500 tax included. Online lottery only. Entries November 4 (10:00) to November 15 (23:59), results around November 25, payment by December 2, delivery January 1–7"],
      ["Returns", "Fukubukuro generally cannot be returned or exchanged"],
      ["Other brands", "Mister Donut 2027 was not announced as of October 29. We found no confirmed 2027 details for Pokémon Center, Sanrio or Uniqlo"],
    ],
    sections: [
      { h: "What a fukubukuro is", list: [
        "A sealed bag sold at a fixed price, usually containing items worth more than the price.",
        "Some bags show their contents (department-store bags sold online often do), others are a complete mystery, as with most Starbucks and electronics bags.",
        "As a rule, fukubukuro cannot be returned or exchanged.",
      ] },
      { h: "When and where", list: [
        "In stores, bags go on sale on January 1 or at the first sale of the year, on January 2 or 3.",
        "Popular bags can sell out within minutes of opening, and some shops hand out numbered tickets for the most wanted ones. Guides recommend lining up at least an hour before opening.",
        "A bag's reservation start date and its release date are not the same thing, so check which date you are looking at.",
      ] },
      { h: "Starbucks Japan lucky bag 2027: official rules", list: [
        "One entry per person. You need a full My Starbucks web membership (an app-only provisional account cannot enter). Gold members count for two entries, but only one bag can be won.",
        "Winners are notified by email around November 25 (about 11:00–17:00), must pay by December 2 at 23:59, and choose a delivery date between January 1 and 7. The address and date cannot be changed afterwards.",
        "Contents: a limited stainless bottle, 3 goods, two 100 g bags of coffee beans, a coffee bean ticket (up to ¥2,000), 7 drink tickets and 6 food trial tickets. Contents differ from bag to bag, and a gold mug and Bearista set may be inside (1,000 pieces).",
        "Winning rights cannot be transferred or resold, and an entry cannot be cancelled.",
      ] },
      { h: "Why online lotteries are hard from abroad", list: [
        "Most lotteries and pre-orders assume a Japanese account and a delivery address in Japan.",
        "Entry windows are short, and once you apply you usually cannot back out.",
      ] },
      { h: "How Kizuna helps", p: "Because winning rights cannot be transferred, we cannot enter the Starbucks lottery or take the bag for you. For bags sold in stores, we may be able to help.", list: [
        "In December, tell us the brand and your budget. We will tell you whether we can queue for it.",
        "There is no guarantee: popular bags sell out in minutes, the contents are unknown and there are no returns.",
        "Shipping in early January depends on carriers' holiday schedules. Christmas orders are accepted until December 5, which is a separate deadline.",
      ] },
      { h: "Before you plan", p: "The Starbucks details come from the official Starbucks Japan page as of October 31, 2026. The general calendar comes from travel guides and can change, so check each brand's official site." },
    ],
    ctaText: "Interested in a New Year lucky bag?", ctaBtn: "Send us your request →",
  },
  fr: {
    eyebrow: "Nouvel An 2027 · Sacs surprise",
    title: "Fukubukuro 2027, les sacs surprise du Nouvel An au Japon : ", titleEm: "dates, tirages au sort et notre aide",
    lead: "Les fukubukuro sont des sacs surprise scellés vendus autour du Nouvel An au Japon. Beaucoup s'épuisent en novembre et décembre via des tirages au sort et des précommandes en ligne : c'est donc maintenant qu'il faut s'organiser. Voici comment ça marche, et ce que nous pouvons ou non faire pour vous.",
    factsH: "L'essentiel",
    facts: [
      ["Vente en magasin", "Le 1er janvier, ou à la première vente de l'année le 2 janvier (la plupart des magasins) ou le 3 janvier (certains). En 2027 : vendredi 1er, samedi 2, dimanche 3"],
      ["Précommandes", "Beaucoup de sacs se précommandent ou se gagnent par tirage au sort en novembre et décembre, avant le Nouvel An"],
      ["Sac Starbucks 2027", "9 500 ¥ taxes incluses. Tirage au sort en ligne uniquement. Inscriptions du 4 novembre (10 h) au 15 novembre (23 h 59), résultats vers le 25 novembre, paiement avant le 2 décembre, livraison du 1er au 7 janvier"],
      ["Retours", "Les fukubukuro ne sont généralement ni repris ni échangés"],
      ["Autres marques", "Mister Donut 2027 n'était pas annoncé au 29 octobre. Nous n'avons trouvé aucun détail 2027 confirmé pour Pokémon Center, Sanrio ou Uniqlo"],
    ],
    sections: [
      { h: "Ce qu'est un fukubukuro", list: [
        "Un sac scellé vendu à prix fixe, contenant généralement des articles d'une valeur supérieure à son prix.",
        "Certains sacs montrent leur contenu (c'est souvent le cas des sacs de grands magasins vendus en ligne), d'autres sont un mystère complet, comme la plupart des sacs Starbucks et d'électronique.",
        "En règle générale, les fukubukuro ne sont ni repris ni échangés.",
      ] },
      { h: "Quand et où", list: [
        "En magasin, les sacs sont vendus le 1er janvier ou à la première vente de l'année, les 2 ou 3 janvier.",
        "Les sacs populaires peuvent s'épuiser en quelques minutes après l'ouverture, et certains magasins distribuent des tickets numérotés pour les plus demandés. Les guides recommandent de faire la queue au moins une heure avant l'ouverture.",
        "La date de début des réservations d'un sac et sa date de sortie ne sont pas la même chose : vérifiez de quelle date il s'agit.",
      ] },
      { h: "Fukubukuro Starbucks Japon 2027 : règles officielles", list: [
        "Une participation par personne. Il faut un compte web My Starbucks complet (un compte provisoire de l'appli seul ne peut pas participer). Les membres Gold comptent pour deux participations, mais on ne peut gagner qu'un seul sac.",
        "Les gagnants sont prévenus par email vers le 25 novembre (environ 11 h–17 h), doivent payer avant le 2 décembre à 23 h 59 et choisissent une date de livraison entre le 1er et le 7 janvier. L'adresse et la date ne peuvent plus être modifiées ensuite.",
        "Contenu : une bouteille inox limitée, 3 articles, deux sachets de 100 g de grains de café, un ticket café en grains (jusqu'à 2 000 ¥), 7 tickets boisson et 6 tickets d'essai nourriture. Le contenu varie d'un sac à l'autre, et un set mug doré et Bearista peut s'y trouver (1 000 exemplaires).",
        "Le droit de gagner ne peut ni être transféré ni revendu, et une participation ne peut pas être annulée.",
      ] },
      { h: "Pourquoi les tirages en ligne sont difficiles depuis l'étranger", list: [
        "La plupart des tirages au sort et précommandes supposent un compte japonais et une adresse de livraison au Japon.",
        "Les périodes d'inscription sont courtes, et une fois inscrit on ne peut généralement plus se désister.",
      ] },
      { h: "Comment Kizuna vous aide", p: "Comme le droit de gagner n'est pas transférable, nous ne pouvons ni participer au tirage Starbucks ni récupérer le sac pour vous. Pour les sacs vendus en magasin, nous pouvons peut-être vous aider.", list: [
        "En décembre, indiquez-nous la marque et votre budget. Nous vous dirons si nous pouvons faire la queue pour vous.",
        "Aucune garantie : les sacs populaires s'épuisent en quelques minutes, le contenu est inconnu et il n'y a pas de retour possible.",
        "L'expédition début janvier dépend des jours fériés des transporteurs. Les commandes de Noël sont acceptées jusqu'au 5 décembre, c'est une date limite distincte.",
      ] },
      { h: "Avant de vous organiser", p: "Les détails Starbucks proviennent de la page officielle de Starbucks Japon au 31 octobre 2026. Le calendrier général vient de guides de voyage et peut changer : consultez le site officiel de chaque marque." },
    ],
    ctaText: "Un sac surprise du Nouvel An vous intéresse ?", ctaBtn: "Envoyez-nous votre demande →",
  },
  ja: {
    eyebrow: "2027年のお正月 · 福袋",
    title: "福袋2027、日本のお正月の福袋：", titleEm: "日程・抽選とKizunaにできること",
    lead: "福袋は、日本でお正月前後に販売される中身の見えない袋です。11月・12月のオンライン抽選や予約でなくなるものも多く、今のうちから計画が必要です。福袋の仕組みと、私たちにできること・できないことをご紹介します。",
    factsH: "概要",
    facts: [
      ["店頭販売", "1月1日、または初売りの1月2日（多くの店舗）か1月3日（一部の店舗）。2027年は1日が金曜、2日が土曜、3日が日曜"],
      ["予約販売", "多くの福袋は、お正月前の11月・12月に予約または抽選で販売されます"],
      ["スターバックス福袋2027", "9,500円（税込）。オンライン抽選販売のみ。エントリーは11月4日10:00〜11月15日23:59、当選発表は11月25日ごろ、決済期限は12月2日、配送は1月1日〜7日"],
      ["返品", "福袋は基本的に返品・交換できません"],
      ["その他のブランド", "ミスタードーナツ2027は10月29日時点で未発表。ポケモンセンター、サンリオ、ユニクロの2027年の確定情報は見つかりませんでした"],
    ],
    sections: [
      { h: "福袋とは", list: [
        "決まった価格で販売される中身の見えない袋で、通常は価格以上の価値の商品が入っています。",
        "中身が分かる袋（オンライン販売の百貨店の福袋に多い）もあれば、スターバックスや家電の福袋のように完全におまかせのものもあります。",
        "福袋は原則として返品・交換できません。",
      ] },
      { h: "いつ、どこで", list: [
        "店頭では、1月1日または初売りの1月2日・3日に販売されます。",
        "人気の福袋は開店後数分で売り切れることがあり、一部の店舗では人気商品の整理券を配布します。ガイドでは、開店の少なくとも1時間前から並ぶことが推奨されています。",
        "福袋の「予約開始日」と「発売日」は別なので、どちらの日付かを確認してください。",
      ] },
      { h: "スターバックス福袋2027：公式のルール", list: [
        "エントリーはお一人様1回。My Starbucksの会員登録（アプリ仮会員は不可）が必要です。ゴールド会員は2口分として扱われますが、当選は1点までです。",
        "当選者には11月25日ごろ（11:00〜17:00ごろ）にメールで通知され、12月2日23:59までに決済し、1月1日〜7日の間で配送日を選びます。住所と日付は購入後に変更できません。",
        "内容：限定ステンレスボトル、グッズ3点、コーヒー豆100g×2、コーヒー豆チケット（2,000円分まで）、ドリンクチケット7枚、フードトライアルチケット6枚。内容は袋ごとに異なり、金色のマグ＆ベアリスタのセット（1,000個）が入っているかもしれません。",
        "当選の権利は第三者への譲渡・転売ができず、エントリー後のキャンセルもできません。",
      ] },
      { h: "オンライン抽選が海外から難しい理由", list: [
        "多くの抽選や予約は、日本のアカウントと日本国内の配送先が前提です。",
        "エントリー期間は短く、申し込んだ後はたいていキャンセルできません。",
      ] },
      { h: "Kizunaにできること", p: "当選の権利は譲渡できないため、スターバックスの抽選へのエントリーや、福袋の代理での受け取りはできません。店頭販売の福袋については、お手伝いできる場合があります。", list: [
        "12月にブランド名とご予算をお知らせください。並んで購入できるかどうかをお答えします。",
        "保証はありません。人気の福袋は数分で売り切れ、中身は分からず、返品もできません。",
        "1月初旬の発送は配送業者の休業日の影響を受けます。クリスマスのご注文は12月5日までで、これとは別の締切です。",
      ] },
      { h: "計画を立てる前に", p: "スターバックスの情報は2026年10月31日時点の公式ページに基づきます。全体の日程は旅行ガイドによるもので変わる場合があるため、各ブランドの公式サイトをご確認ください。" },
    ],
    ctaText: "お正月の福袋にご興味がありますか？", ctaBtn: "ご依頼をお送りください →",
  },
  es: {
    eyebrow: "Año Nuevo 2027 · Bolsas de la suerte",
    title: "Fukubukuro 2027, las bolsas de la suerte de Año Nuevo en Japón: ", titleEm: "fechas, sorteos y cómo te ayudamos",
    lead: "Los fukubukuro son bolsas de la suerte selladas que se venden en Japón en torno al Año Nuevo. Muchas se agotan en noviembre y diciembre mediante sorteos en línea y preventas, así que hay que planificar desde ahora. Aquí tienes cómo funcionan y qué podemos y qué no podemos hacer por ti.",
    factsH: "Datos clave",
    facts: [
      ["Venta en tienda", "El 1 de enero, o en la primera venta del año el 2 de enero (la mayoría de las tiendas) o el 3 de enero (algunas). En 2027: viernes 1, sábado 2, domingo 3"],
      ["Preventas", "Muchas bolsas se reservan o se ganan por sorteo en noviembre y diciembre, antes de Año Nuevo"],
      ["Bolsa Starbucks 2027", "9.500 ¥ con impuestos. Solo sorteo en línea. Inscripción del 4 de noviembre (10:00) al 15 de noviembre (23:59), resultados hacia el 25 de noviembre, pago antes del 2 de diciembre y entrega del 1 al 7 de enero"],
      ["Devoluciones", "Los fukubukuro generalmente no se pueden devolver ni cambiar"],
      ["Otras marcas", "Mister Donut 2027 no estaba anunciado a 29 de octubre. No encontramos datos 2027 confirmados de Pokémon Center, Sanrio ni Uniqlo"],
    ],
    sections: [
      { h: "Qué es un fukubukuro", list: [
        "Una bolsa sellada que se vende a precio fijo y suele contener artículos que valen más que su precio.",
        "Algunas bolsas muestran su contenido (es habitual en las de grandes almacenes vendidas en línea), otras son un misterio total, como la mayoría de las de Starbucks y electrónica.",
        "Por norma, los fukubukuro no se pueden devolver ni cambiar.",
      ] },
      { h: "Cuándo y dónde", list: [
        "En tienda, las bolsas salen el 1 de enero o en la primera venta del año, el 2 o 3 de enero.",
        "Las bolsas populares pueden agotarse a los pocos minutos de abrir, y algunas tiendas reparten números para las más codiciadas. Las guías recomiendan hacer cola al menos una hora antes de la apertura.",
        "La fecha de inicio de reservas de una bolsa y su fecha de lanzamiento no son lo mismo, así que comprueba de cuál se trata.",
      ] },
      { h: "Bolsa de la suerte Starbucks Japón 2027: normas oficiales", list: [
        "Una participación por persona. Hace falta una cuenta web My Starbucks completa (una cuenta provisional solo de la app no puede participar). Los miembros Gold cuentan como dos participaciones, pero solo se puede ganar una bolsa.",
        "Los ganadores reciben un correo hacia el 25 de noviembre (de 11:00 a 17:00 aprox.), deben pagar antes del 2 de diciembre a las 23:59 y eligen una fecha de entrega entre el 1 y el 7 de enero. Después no se pueden cambiar ni la dirección ni la fecha.",
        "Contenido: una botella de acero limitada, 3 artículos, dos bolsas de 100 g de café en grano, un ticket de café en grano (hasta 2.000 ¥), 7 tickets de bebida y 6 tickets de prueba de comida. El contenido varía de una bolsa a otra y puede incluir un set de taza dorada y Bearista (1.000 unidades).",
        "El derecho a ganar no se puede transferir ni revender, y una participación no se puede cancelar.",
      ] },
      { h: "Por qué los sorteos en línea son difíciles desde el extranjero", list: [
        "La mayoría de los sorteos y preventas suponen una cuenta japonesa y una dirección de entrega en Japón.",
        "Los plazos de inscripción son cortos y, una vez inscrito, normalmente no se puede dar marcha atrás.",
      ] },
      { h: "Cómo te ayuda Kizuna", p: "Como el derecho a ganar no se puede transferir, no podemos participar en el sorteo de Starbucks ni recoger la bolsa por ti. En las bolsas que se venden en tienda, quizá podamos ayudarte.", list: [
        "En diciembre, dinos la marca y tu presupuesto. Te diremos si podemos hacer cola por ti.",
        "No hay garantía: las bolsas populares se agotan en minutos, el contenido es desconocido y no hay devoluciones.",
        "El envío a principios de enero depende de los festivos de los transportistas. Los pedidos de Navidad se aceptan hasta el 5 de diciembre, que es otra fecha límite.",
      ] },
      { h: "Antes de planificar", p: "Los datos de Starbucks proceden de la página oficial de Starbucks Japón a 31 de octubre de 2026. El calendario general viene de guías de viaje y puede cambiar, así que consulta el sitio oficial de cada marca." },
    ],
    ctaText: "¿Te interesa una bolsa de la suerte de Año Nuevo?", ctaBtn: "Envíanos tu solicitud →",
  },
  it: {
    eyebrow: "Capodanno 2027 · Sacchetti fortunati",
    title: "Fukubukuro 2027, i sacchetti fortunati di Capodanno in Giappone: ", titleEm: "date, estrazioni e come ti aiutiamo",
    lead: "I fukubukuro sono sacchetti fortunati sigillati venduti in Giappone intorno a Capodanno. Molti si esauriscono a novembre e dicembre tramite estrazioni online e prevendite, quindi è il momento di pianificare. Ecco come funzionano e cosa possiamo e non possiamo fare per te.",
    factsH: "Informazioni essenziali",
    facts: [
      ["Vendita nei negozi", "Il 1º gennaio, o alla prima vendita dell'anno il 2 gennaio (la maggior parte dei negozi) o il 3 gennaio (alcuni). Nel 2027: venerdì 1, sabato 2, domenica 3"],
      ["Prevendite", "Molti sacchetti si prenotano o si vincono con estrazione a novembre e dicembre, prima di Capodanno"],
      ["Sacchetto Starbucks 2027", "9.500 ¥ tasse incluse. Solo estrazione online. Iscrizioni dal 4 novembre (10:00) al 15 novembre (23:59), risultati verso il 25 novembre, pagamento entro il 2 dicembre, consegna dal 1º al 7 gennaio"],
      ["Resi", "I fukubukuro in genere non si possono rendere né cambiare"],
      ["Altri marchi", "Mister Donut 2027 non era ancora annunciato al 29 ottobre. Non abbiamo trovato dettagli 2027 confermati per Pokémon Center, Sanrio o Uniqlo"],
    ],
    sections: [
      { h: "Cos'è un fukubukuro", list: [
        "Un sacchetto sigillato venduto a prezzo fisso, che di solito contiene articoli di valore superiore al prezzo.",
        "Alcuni sacchetti mostrano il contenuto (spesso quelli dei grandi magazzini venduti online), altri sono un mistero totale, come la maggior parte di quelli Starbucks e di elettronica.",
        "Di regola i fukubukuro non si possono rendere né cambiare.",
      ] },
      { h: "Quando e dove", list: [
        "Nei negozi i sacchetti sono in vendita il 1º gennaio o alla prima vendita dell'anno, il 2 o 3 gennaio.",
        "I sacchetti più popolari possono esaurirsi in pochi minuti dall'apertura e alcuni negozi distribuiscono numeri per i più richiesti. Le guide consigliano di mettersi in coda almeno un'ora prima dell'apertura.",
        "La data di inizio delle prenotazioni di un sacchetto e la sua data di uscita non sono la stessa cosa, quindi controlla di quale si tratta.",
      ] },
      { h: "Sacchetto fortunato Starbucks Giappone 2027: regole ufficiali", list: [
        "Una partecipazione a persona. Serve un account web My Starbucks completo (un account provvisorio solo dell'app non può partecipare). I membri Gold valgono due partecipazioni, ma si può vincere un solo sacchetto.",
        "I vincitori ricevono un'email verso il 25 novembre (circa 11:00–17:00), devono pagare entro il 2 dicembre alle 23:59 e scelgono una data di consegna tra il 1º e il 7 gennaio. Indirizzo e data non si possono più cambiare.",
        "Contenuto: una bottiglia in acciaio limitata, 3 articoli, due sacchetti da 100 g di caffè in grani, un ticket per caffè in grani (fino a 2.000 ¥), 7 ticket bevanda e 6 ticket di prova cibo. Il contenuto varia da sacchetto a sacchetto e potrebbe esserci un set tazza dorata e Bearista (1.000 pezzi).",
        "Il diritto di vincita non si può cedere né rivendere e una partecipazione non si può annullare.",
      ] },
      { h: "Perché le estrazioni online sono difficili dall'estero", list: [
        "La maggior parte delle estrazioni e prevendite presuppone un account giapponese e un indirizzo di consegna in Giappone.",
        "Le finestre di iscrizione sono brevi e, una volta iscritti, di solito non si può tornare indietro.",
      ] },
      { h: "Come ti aiuta Kizuna", p: "Poiché il diritto di vincita non è cedibile, non possiamo partecipare all'estrazione Starbucks né ritirare il sacchetto per te. Per i sacchetti venduti nei negozi, forse possiamo aiutarti.", list: [
        "A dicembre indicaci il marchio e il tuo budget. Ti diremo se possiamo metterci in coda per te.",
        "Nessuna garanzia: i sacchetti popolari si esauriscono in pochi minuti, il contenuto è sconosciuto e non ci sono resi.",
        "La spedizione a inizio gennaio dipende dai giorni festivi dei corrieri. Gli ordini di Natale sono accettati fino al 5 dicembre, scadenza distinta.",
      ] },
      { h: "Prima di pianificare", p: "I dettagli Starbucks provengono dalla pagina ufficiale di Starbucks Giappone al 31 ottobre 2026. Il calendario generale viene da guide di viaggio e può cambiare, quindi controlla il sito ufficiale di ogni marchio." },
    ],
    ctaText: "Ti interessa un sacchetto fortunato di Capodanno?", ctaBtn: "Inviaci la tua richiesta →",
  },
  de: {
    eyebrow: "Neujahr 2027 · Glückstüten",
    title: "Fukubukuro 2027, Japans Neujahrs-Glückstüten: ", titleEm: "Termine, Verlosungen und wie wir helfen",
    lead: "Fukubukuro sind versiegelte Glückstüten, die in Japan rund um Neujahr verkauft werden. Viele sind schon im November und Dezember über Online-Verlosungen und Vorbestellungen ausverkauft, deshalb muss man jetzt planen. Hier erfährst du, wie sie funktionieren und was wir für dich tun können und was nicht.",
    factsH: "Das Wichtigste",
    facts: [
      ["Verkauf im Laden", "Am 1. Januar oder beim ersten Verkauf des Jahres am 2. Januar (die meisten Läden) oder 3. Januar (einige). 2027: Freitag der 1., Samstag der 2., Sonntag der 3."],
      ["Vorbestellung", "Viele Tüten werden im November und Dezember vor Neujahr vorbestellt oder verlost"],
      ["Starbucks-Tüte 2027", "9.500 ¥ inklusive Steuern. Nur Online-Verlosung. Teilnahme vom 4. November (10 Uhr) bis 15. November (23:59 Uhr), Ergebnisse um den 25. November, Zahlung bis 2. Dezember, Lieferung 1.–7. Januar"],
      ["Rückgabe", "Fukubukuro können in der Regel weder zurückgegeben noch umgetauscht werden"],
      ["Andere Marken", "Mister Donut 2027 war am 29. Oktober noch nicht angekündigt. Für Pokémon Center, Sanrio und Uniqlo haben wir keine bestätigten 2027-Details gefunden"],
    ],
    sections: [
      { h: "Was ein Fukubukuro ist", list: [
        "Eine versiegelte Tüte zum Festpreis, die meist Artikel enthält, die mehr wert sind als der Preis.",
        "Manche Tüten zeigen ihren Inhalt (bei online verkauften Kaufhaus-Tüten oft der Fall), andere sind ein komplettes Überraschungspaket, wie die meisten Starbucks- und Elektronik-Tüten.",
        "In der Regel können Fukubukuro nicht zurückgegeben oder umgetauscht werden.",
      ] },
      { h: "Wann und wo", list: [
        "In den Läden gehen die Tüten am 1. Januar oder beim ersten Verkauf des Jahres am 2. oder 3. Januar in den Verkauf.",
        "Beliebte Tüten können Minuten nach der Öffnung ausverkauft sein, und manche Läden verteilen nummerierte Tickets für die begehrtesten. Ratgeber empfehlen, mindestens eine Stunde vor Öffnung anzustehen.",
        "Der Beginn der Reservierung einer Tüte und ihr Erscheinungstermin sind nicht dasselbe, prüfe also, um welches Datum es geht.",
      ] },
      { h: "Starbucks-Japan-Glückstüte 2027: offizielle Regeln", list: [
        "Eine Teilnahme pro Person. Du brauchst ein vollständiges My-Starbucks-Webkonto (ein vorläufiges Nur-App-Konto kann nicht teilnehmen). Gold-Mitglieder zählen doppelt, aber es kann nur eine Tüte gewonnen werden.",
        "Gewinner werden um den 25. November per E-Mail benachrichtigt (etwa 11–17 Uhr), müssen bis 2. Dezember, 23:59 Uhr, zahlen und wählen ein Lieferdatum zwischen 1. und 7. Januar. Adresse und Datum lassen sich danach nicht mehr ändern.",
        "Inhalt: eine limitierte Edelstahlflasche, 3 Artikel, zwei Beutel mit je 100 g Kaffeebohnen, ein Kaffeebohnen-Ticket (bis 2.000 ¥), 7 Getränketickets und 6 Speisen-Probiertickets. Der Inhalt ist von Tüte zu Tüte verschieden, und ein goldenes Tassen-Set mit Bearista kann dabei sein (1.000 Stück).",
        "Das Gewinnrecht kann weder übertragen noch weiterverkauft werden, und eine Teilnahme lässt sich nicht stornieren.",
      ] },
      { h: "Warum Online-Verlosungen aus dem Ausland schwierig sind", list: [
        "Die meisten Verlosungen und Vorbestellungen setzen ein japanisches Konto und eine Lieferadresse in Japan voraus.",
        "Die Teilnahmefenster sind kurz, und nach der Anmeldung kann man meist nicht mehr zurück.",
      ] },
      { h: "So hilft dir Kizuna", p: "Da das Gewinnrecht nicht übertragbar ist, können wir weder an der Starbucks-Verlosung teilnehmen noch die Tüte für dich annehmen. Bei Tüten, die im Laden verkauft werden, können wir vielleicht helfen.", list: [
        "Nenne uns im Dezember die Marke und dein Budget. Wir sagen dir, ob wir für dich anstehen können.",
        "Es gibt keine Garantie: Beliebte Tüten sind in Minuten ausverkauft, der Inhalt ist unbekannt und eine Rückgabe ist nicht möglich.",
        "Der Versand Anfang Januar hängt von den Feiertagen der Paketdienste ab. Weihnachtsbestellungen nehmen wir bis zum 5. Dezember an, das ist eine eigene Frist.",
      ] },
      { h: "Bevor du planst", p: "Die Starbucks-Angaben stammen von der offiziellen Seite von Starbucks Japan, Stand 31. Oktober 2026. Der allgemeine Kalender stammt aus Reiseführern und kann sich ändern, prüfe daher die offizielle Website jeder Marke." },
    ],
    ctaText: "Interesse an einer Neujahrs-Glückstüte?", ctaBtn: "Schick uns deine Anfrage →",
  },
  ko: {
    eyebrow: "2027년 새해 · 복주머니",
    title: "후쿠부쿠로 2027, 일본의 새해 복주머니: ", titleEm: "일정·추첨과 Kizuna가 도와드릴 수 있는 일",
    lead: "후쿠부쿠로는 일본에서 새해 전후에 판매하는, 내용물이 보이지 않는 복주머니입니다. 11~12월의 온라인 추첨과 예약으로 먼저 소진되는 경우가 많아 지금부터 계획해야 합니다. 작동 방식과 저희가 할 수 있는 일과 할 수 없는 일을 안내합니다.",
    factsH: "핵심 정보",
    facts: [
      ["매장 판매", "1월 1일, 또는 새해 첫 판매일인 1월 2일(대부분의 매장)이나 1월 3일(일부 매장). 2027년은 1일 금요일, 2일 토요일, 3일 일요일"],
      ["예약 판매", "많은 복주머니가 새해 전인 11~12월에 예약 또는 추첨으로 판매됩니다"],
      ["스타벅스 2027 복주머니", "9,500엔(세금 포함). 온라인 추첨 판매 전용. 응모 11월 4일 10:00~11월 15일 23:59, 당첨 발표 11월 25일경, 결제 12월 2일까지, 배송 1월 1일~7일"],
      ["반품", "후쿠부쿠로는 일반적으로 반품·교환이 불가합니다"],
      ["기타 브랜드", "미스터 도넛 2027은 10월 29일 기준 미발표. 포켓몬 센터, 산리오, 유니클로의 2027년 확정 정보는 찾지 못했습니다"],
    ],
    sections: [
      { h: "후쿠부쿠로란", list: [
        "정해진 가격에 판매되는, 내용물이 보이지 않는 봉인된 주머니로, 보통 가격보다 가치가 높은 상품이 들어 있습니다.",
        "내용물을 보여주는 주머니(온라인 백화점 복주머니에 많음)도 있고, 스타벅스나 전자제품 복주머니처럼 완전히 비공개인 것도 있습니다.",
        "후쿠부쿠로는 원칙적으로 반품·교환이 되지 않습니다.",
      ] },
      { h: "언제, 어디서", list: [
        "매장에서는 1월 1일 또는 새해 첫 판매일인 1월 2~3일에 판매됩니다.",
        "인기 복주머니는 개점 후 몇 분 만에 품절될 수 있고, 일부 매장은 인기 상품에 정리권을 나눠줍니다. 가이드들은 개점 최소 1시간 전부터 줄을 설 것을 권장합니다.",
        "복주머니의 '예약 시작일'과 '발매일'은 다르므로 어느 날짜인지 확인하세요.",
      ] },
      { h: "스타벅스 재팬 복주머니 2027: 공식 규칙", list: [
        "1인 1회 응모. My Starbucks 웹 회원 등록이 필요합니다(앱 임시 회원은 불가). 골드 회원은 2구좌로 계산되지만 당첨은 1개까지입니다.",
        "당첨자는 11월 25일경(약 11:00~17:00) 이메일로 통지받고, 12월 2일 23:59까지 결제하며, 1월 1일~7일 중 배송일을 선택합니다. 주소와 날짜는 이후 변경할 수 없습니다.",
        "구성: 한정 스테인리스 보틀, 굿즈 3점, 커피 원두 100g 2봉, 커피 원두 티켓(최대 2,000엔), 음료 티켓 7장, 푸드 체험 티켓 6장. 구성은 주머니마다 다르며 금색 머그와 베어리스타 세트(1,000개)가 들어 있을 수 있습니다.",
        "당첨 권리는 제3자에게 양도·재판매할 수 없고, 응모 후 취소도 불가합니다.",
      ] },
      { h: "온라인 추첨이 해외에서 어려운 이유", list: [
        "대부분의 추첨과 예약은 일본 계정과 일본 내 배송지를 전제로 합니다.",
        "응모 기간이 짧고, 신청 후에는 보통 취소할 수 없습니다.",
      ] },
      { h: "Kizuna가 도와드리는 방법", p: "당첨 권리는 양도할 수 없으므로, 스타벅스 추첨에 대신 응모하거나 복주머니를 대신 받을 수는 없습니다. 매장에서 판매하는 복주머니는 도와드릴 수 있을 수도 있습니다.", list: [
        "12월에 브랜드와 예산을 알려주세요. 줄을 서서 구매할 수 있는지 알려드립니다.",
        "보장은 없습니다. 인기 복주머니는 몇 분 만에 품절되고, 내용물을 알 수 없으며, 반품도 안 됩니다.",
        "1월 초 배송은 택배사의 휴무일에 영향을 받습니다. 크리스마스 주문은 12월 5일까지이며, 이는 별도의 마감입니다.",
      ] },
      { h: "계획하기 전에", p: "스타벅스 관련 내용은 2026년 10월 31일 기준 공식 페이지를 바탕으로 합니다. 전체 일정은 여행 가이드를 참고한 것이라 변경될 수 있으니 각 브랜드의 공식 사이트를 확인하세요." },
    ],
    ctaText: "새해 복주머니에 관심이 있으신가요?", ctaBtn: "요청서 보내기 →",
  },
  zh: {
    eyebrow: "2027年新年 · 福袋",
    title: "福袋2027，日本新年福袋：", titleEm: "日期、抽选与我们能提供的帮助",
    lead: "福袋是日本在新年前后销售的、内容物不可见的密封袋。许多福袋在11月和12月就通过线上抽选和预订售完，所以现在就该开始计划。这里介绍福袋的玩法，以及我们能做和不能做的事。",
    factsH: "要点一览",
    facts: [
      ["门店销售", "1月1日，或新年首卖日1月2日（多数店铺）或1月3日（部分店铺）。2027年：1日周五、2日周六、3日周日"],
      ["预订", "许多福袋在新年前的11月和12月通过预订或抽选销售"],
      ["星巴克2027福袋", "9,500日元（含税）。仅线上抽选销售。报名11月4日10:00至11月15日23:59，约11月25日公布结果，12月2日前付款，1月1日至7日配送"],
      ["退换", "福袋一般不可退换"],
      ["其他品牌", "截至10月29日，Mister Donut 2027尚未公布。宝可梦中心、三丽鸥、优衣库的2027年确切信息我们没有找到"],
    ],
    sections: [
      { h: "什么是福袋", list: [
        "以固定价格销售的密封袋，里面通常装有价值高于售价的商品。",
        "有些福袋会展示内容（线上销售的百货公司福袋常见），有些则完全是盲盒，比如大多数星巴克和电器福袋。",
        "福袋原则上不可退换。",
      ] },
      { h: "何时何地", list: [
        "在门店，福袋于1月1日或新年首卖的1月2日、3日发售。",
        "热门福袋开门几分钟就可能售罄，部分店铺会为最受欢迎的福袋发放排队号码牌。指南建议至少提前一小时排队。",
        "福袋的“预订开始日”和“发售日”不是一回事，请确认你看到的是哪一个。",
      ] },
      { h: "星巴克日本2027福袋：官方规则", list: [
        "每人限报名一次。需要完整的My Starbucks网页会员（仅App的临时会员无法报名）。金卡会员算两份，但最多只能中一个。",
        "中签者约在11月25日（约11:00–17:00）通过邮件收到通知，须在12月2日23:59前付款，并在1月1日至7日之间选择配送日期。之后无法更改地址和日期。",
        "内容：限定不锈钢瓶、周边3件、100克咖啡豆2袋、咖啡豆券（最高2,000日元）、饮品券7张、食品体验券6张。每个福袋内容不同，可能含有金色马克杯与Bearista套装（1,000个）。",
        "中签权利不可转让或转卖，报名后也无法取消。",
      ] },
      { h: "为什么线上抽选从海外很难参加", list: [
        "大多数抽选和预订都需要日本账号和日本境内的收货地址。",
        "报名时间很短，一旦申请通常无法撤回。",
      ] },
      { h: "Kizuna如何帮助你", p: "由于中签权利不可转让，我们无法替你参加星巴克抽选或代收福袋。对于在门店销售的福袋，我们也许能帮上忙。", list: [
        "12月请告诉我们品牌和预算，我们会告诉你是否能替你排队购买。",
        "无法保证：热门福袋几分钟就售罄，内容未知，也不可退换。",
        "1月初的发货取决于快递公司的假期安排。圣诞订单受理至12月5日，这是另一个截止日期。",
      ] },
      { h: "计划之前", p: "星巴克的信息来自官方页面（截至2026年10月31日）。整体日程来自旅行指南，可能会变化，请查看各品牌的官方网站。" },
    ],
    ctaText: "对新年福袋感兴趣吗？", ctaBtn: "发送你的需求 →",
  },
  pt: {
    eyebrow: "Ano Novo 2027 · Sacolas da sorte",
    title: "Fukubukuro 2027, as sacolas da sorte de Ano Novo do Japão: ", titleEm: "datas, sorteios e como ajudamos",
    lead: "Os fukubukuro são sacolas da sorte lacradas vendidas no Japão por volta do Ano Novo. Muitas esgotam em novembro e dezembro por sorteios online e pré-vendas, então a hora de planejar é agora. Veja como funcionam e o que podemos e não podemos fazer por você.",
    factsH: "Informações principais",
    facts: [
      ["Venda nas lojas", "Em 1º de janeiro, ou na primeira venda do ano em 2 de janeiro (a maioria das lojas) ou 3 de janeiro (algumas). Em 2027: sexta 1, sábado 2, domingo 3"],
      ["Pré-vendas", "Muitas sacolas são reservadas ou ganhas por sorteio em novembro e dezembro, antes do Ano Novo"],
      ["Sacola Starbucks 2027", "¥9.500 com impostos. Somente sorteio online. Inscrições de 4 de novembro (10h) a 15 de novembro (23h59), resultados por volta de 25 de novembro, pagamento até 2 de dezembro e entrega de 1 a 7 de janeiro"],
      ["Devoluções", "Em geral, os fukubukuro não podem ser devolvidos nem trocados"],
      ["Outras marcas", "A Mister Donut 2027 não havia sido anunciada em 29 de outubro. Não encontramos detalhes de 2027 confirmados para Pokémon Center, Sanrio ou Uniqlo"],
    ],
    sections: [
      { h: "O que é um fukubukuro", list: [
        "Uma sacola lacrada vendida por preço fixo, que costuma conter itens que valem mais que o preço.",
        "Algumas sacolas mostram o conteúdo (comum nas de lojas de departamento vendidas online), outras são um mistério total, como a maioria das da Starbucks e de eletrônicos.",
        "Como regra, os fukubukuro não podem ser devolvidos nem trocados.",
      ] },
      { h: "Quando e onde", list: [
        "Nas lojas, as sacolas são vendidas em 1º de janeiro ou na primeira venda do ano, em 2 ou 3 de janeiro.",
        "As sacolas populares podem esgotar em minutos após a abertura, e algumas lojas distribuem senhas numeradas para as mais disputadas. Os guias recomendam entrar na fila pelo menos uma hora antes da abertura.",
        "A data de início das reservas de uma sacola e a data de lançamento não são a mesma coisa, então confira de qual se trata.",
      ] },
      { h: "Sacola da sorte Starbucks Japão 2027: regras oficiais", list: [
        "Uma inscrição por pessoa. É preciso uma conta web My Starbucks completa (uma conta provisória só do app não pode participar). Membros Gold contam como duas inscrições, mas só é possível ganhar uma sacola.",
        "Os ganhadores são avisados por e-mail por volta de 25 de novembro (cerca de 11h–17h), devem pagar até 2 de dezembro às 23h59 e escolhem uma data de entrega entre 1 e 7 de janeiro. O endereço e a data não podem ser alterados depois.",
        "Conteúdo: uma garrafa de aço limitada, 3 itens, dois pacotes de 100 g de grãos de café, um ticket de grãos de café (até ¥2.000), 7 tickets de bebida e 6 tickets de experiência de comida. O conteúdo varia de sacola para sacola e pode haver um conjunto de caneca dourada e Bearista (1.000 unidades).",
        "O direito de ganhar não pode ser transferido nem revendido, e uma inscrição não pode ser cancelada.",
      ] },
      { h: "Por que os sorteios online são difíceis do exterior", list: [
        "A maioria dos sorteios e pré-vendas pressupõe uma conta japonesa e um endereço de entrega no Japão.",
        "Os períodos de inscrição são curtos e, depois de se inscrever, normalmente não dá para desistir.",
      ] },
      { h: "Como a Kizuna ajuda", p: "Como o direito de ganhar não pode ser transferido, não podemos participar do sorteio da Starbucks nem retirar a sacola para você. Para sacolas vendidas em lojas, talvez possamos ajudar.", list: [
        "Em dezembro, diga a marca e seu orçamento. Avisaremos se podemos entrar na fila para você.",
        "Não há garantia: as sacolas populares esgotam em minutos, o conteúdo é desconhecido e não há devolução.",
        "O envio no início de janeiro depende dos feriados das transportadoras. Pedidos de Natal são aceitos até 5 de dezembro, que é um prazo separado.",
      ] },
      { h: "Antes de planejar", p: "Os dados da Starbucks vêm da página oficial da Starbucks Japão em 31 de outubro de 2026. O calendário geral vem de guias de viagem e pode mudar, então confira o site oficial de cada marca." },
    ],
    ctaText: "Interessado em uma sacola da sorte de Ano Novo?", ctaBtn: "Envie seu pedido →",
  },
  id: {
    eyebrow: "Tahun Baru 2027 · Tas keberuntungan",
    title: "Fukubukuro 2027, tas keberuntungan Tahun Baru Jepang: ", titleEm: "tanggal, undian, dan bantuan kami",
    lead: "Fukubukuro adalah tas keberuntungan tersegel yang dijual di Jepang menjelang Tahun Baru. Banyak yang habis pada November dan Desember lewat undian online dan pre-order, jadi sekaranglah waktunya merencanakan. Berikut cara kerjanya, serta apa yang bisa dan tidak bisa kami lakukan untukmu.",
    factsH: "Info penting",
    facts: [
      ["Penjualan di toko", "1 Januari, atau penjualan pertama tahun ini pada 2 Januari (kebanyakan toko) atau 3 Januari (sebagian toko). Tahun 2027: Jumat 1, Sabtu 2, Minggu 3"],
      ["Pre-order", "Banyak tas dipesan lebih dulu atau dimenangkan lewat undian pada November dan Desember, sebelum Tahun Baru"],
      ["Tas Starbucks 2027", "¥9.500 sudah termasuk pajak. Hanya lewat undian online. Pendaftaran 4 November (10.00) sampai 15 November (23.59), hasil sekitar 25 November, pembayaran paling lambat 2 Desember, pengiriman 1–7 Januari"],
      ["Pengembalian", "Fukubukuro umumnya tidak bisa dikembalikan atau ditukar"],
      ["Merek lain", "Mister Donut 2027 belum diumumkan per 29 Oktober. Kami tidak menemukan detail 2027 yang terkonfirmasi untuk Pokémon Center, Sanrio, atau Uniqlo"],
    ],
    sections: [
      { h: "Apa itu fukubukuro", list: [
        "Tas tersegel yang dijual dengan harga tetap, biasanya berisi barang yang nilainya lebih tinggi dari harganya.",
        "Sebagian tas menunjukkan isinya (sering pada tas department store yang dijual online), sebagian lagi benar-benar misteri, seperti kebanyakan tas Starbucks dan elektronik.",
        "Sebagai aturan, fukubukuro tidak bisa dikembalikan atau ditukar.",
      ] },
      { h: "Kapan dan di mana", list: [
        "Di toko, tas dijual pada 1 Januari atau pada penjualan pertama tahun ini, tanggal 2 atau 3 Januari.",
        "Tas populer bisa habis dalam hitungan menit setelah toko buka, dan beberapa toko membagikan tiket bernomor untuk yang paling diminati. Panduan menyarankan mengantre minimal satu jam sebelum buka.",
        "Tanggal mulai reservasi sebuah tas dan tanggal rilisnya tidak sama, jadi periksa tanggal yang mana yang kamu lihat.",
      ] },
      { h: "Tas keberuntungan Starbucks Jepang 2027: aturan resmi", list: [
        "Satu pendaftaran per orang. Kamu perlu akun web My Starbucks lengkap (akun sementara khusus aplikasi tidak bisa ikut). Anggota Gold dihitung dua kali, tetapi hanya satu tas yang bisa dimenangkan.",
        "Pemenang diberi tahu lewat email sekitar 25 November (kira-kira pukul 11.00–17.00), harus membayar paling lambat 2 Desember pukul 23.59, dan memilih tanggal pengiriman antara 1 dan 7 Januari. Alamat dan tanggal tidak bisa diubah setelahnya.",
        "Isi: botol stainless edisi terbatas, 3 barang, dua kantong biji kopi 100 g, tiket biji kopi (sampai ¥2.000), 7 tiket minuman, dan 6 tiket coba makanan. Isinya berbeda tiap tas, dan mungkin ada set mug emas dan Bearista (1.000 buah).",
        "Hak untuk menang tidak bisa dipindahtangankan atau dijual kembali, dan pendaftaran tidak bisa dibatalkan.",
      ] },
      { h: "Mengapa undian online sulit dari luar negeri", list: [
        "Kebanyakan undian dan pre-order mengharuskan akun Jepang dan alamat pengiriman di Jepang.",
        "Masa pendaftaran singkat, dan setelah mendaftar biasanya tidak bisa mundur.",
      ] },
      { h: "Bantuan dari Kizuna", p: "Karena hak untuk menang tidak bisa dipindahtangankan, kami tidak bisa ikut undian Starbucks atau mengambil tasnya untukmu. Untuk tas yang dijual di toko, mungkin kami bisa membantu.", list: [
        "Pada Desember, beri tahu kami mereknya dan anggaranmu. Kami akan memberi tahu apakah kami bisa mengantre untukmu.",
        "Tidak ada jaminan: tas populer habis dalam hitungan menit, isinya tidak diketahui, dan tidak ada pengembalian.",
        "Pengiriman awal Januari bergantung pada jadwal libur kurir. Pesanan Natal diterima sampai 5 Desember, yang merupakan batas waktu terpisah.",
      ] },
      { h: "Sebelum merencanakan", p: "Detail Starbucks berasal dari halaman resmi Starbucks Jepang per 31 Oktober 2026. Kalender umum berasal dari panduan wisata dan bisa berubah, jadi cek situs resmi tiap merek." },
    ],
    ctaText: "Tertarik dengan tas keberuntungan Tahun Baru?", ctaBtn: "Kirim permintaanmu →",
  },
  vi: {
    eyebrow: "Năm mới 2027 · Túi may mắn",
    title: "Fukubukuro 2027, túi may mắn Năm mới của Nhật Bản: ", titleEm: "ngày, bốc thăm và cách chúng tôi hỗ trợ",
    lead: "Fukubukuro là những túi may mắn niêm phong được bán ở Nhật quanh dịp Năm mới. Nhiều túi hết sạch trong tháng 11 và 12 qua bốc thăm trực tuyến và đặt trước, nên bây giờ là lúc lên kế hoạch. Dưới đây là cách hoạt động và những gì chúng tôi có thể và không thể làm giúp bạn.",
    factsH: "Thông tin chính",
    facts: [
      ["Bán tại cửa hàng", "Ngày 1/1, hoặc đợt bán đầu năm ngày 2/1 (hầu hết cửa hàng) hay ngày 3/1 (một số cửa hàng). Năm 2027: thứ Sáu 1, thứ Bảy 2, Chủ Nhật 3"],
      ["Đặt trước", "Nhiều túi được đặt trước hoặc trúng thăm trong tháng 11 và 12, trước Năm mới"],
      ["Túi Starbucks 2027", "9.500 yên đã gồm thuế. Chỉ bán qua bốc thăm trực tuyến. Đăng ký từ 4/11 (10:00) đến 15/11 (23:59), kết quả khoảng 25/11, thanh toán trước 2/12, giao hàng từ 1 đến 7/1"],
      ["Đổi trả", "Fukubukuro nhìn chung không thể đổi trả"],
      ["Thương hiệu khác", "Mister Donut 2027 chưa được công bố tính đến 29/10. Chúng tôi không tìm thấy thông tin 2027 đã xác nhận cho Pokémon Center, Sanrio hay Uniqlo"],
    ],
    sections: [
      { h: "Fukubukuro là gì", list: [
        "Một túi niêm phong bán với giá cố định, thường chứa những món có giá trị cao hơn giá túi.",
        "Một số túi cho xem trước nội dung (thường là túi của trung tâm thương mại bán trực tuyến), số khác hoàn toàn bí ẩn, như hầu hết túi Starbucks và đồ điện tử.",
        "Theo quy tắc chung, fukubukuro không thể đổi trả.",
      ] },
      { h: "Khi nào và ở đâu", list: [
        "Tại cửa hàng, túi được bán vào ngày 1/1 hoặc đợt bán đầu năm, ngày 2 hoặc 3/1.",
        "Túi được ưa chuộng có thể hết chỉ vài phút sau khi mở cửa, và một số cửa hàng phát vé có số cho những túi được săn đón nhất. Các hướng dẫn khuyên xếp hàng trước giờ mở cửa ít nhất một tiếng.",
        "Ngày bắt đầu đặt trước của một túi và ngày phát hành không phải là một, vì vậy hãy kiểm tra bạn đang xem ngày nào.",
      ] },
      { h: "Túi may mắn Starbucks Nhật Bản 2027: quy định chính thức", list: [
        "Mỗi người đăng ký một lần. Cần có tài khoản web My Starbucks đầy đủ (tài khoản tạm chỉ trên ứng dụng không được tham gia). Thành viên Gold được tính hai lượt, nhưng chỉ trúng tối đa một túi.",
        "Người trúng được báo qua email khoảng 25/11 (khoảng 11:00–17:00), phải thanh toán trước 23:59 ngày 2/12 và chọn ngày giao từ 1 đến 7/1. Địa chỉ và ngày không thể đổi sau đó.",
        "Nội dung: một bình inox phiên bản giới hạn, 3 món hàng, hai gói cà phê hạt 100 g, một vé cà phê hạt (tối đa 2.000 yên), 7 vé đồ uống và 6 vé dùng thử đồ ăn. Nội dung khác nhau tùy túi, và có thể có bộ cốc vàng và Bearista (1.000 túi).",
        "Quyền trúng thưởng không thể chuyển nhượng hay bán lại, và đã đăng ký thì không thể hủy.",
      ] },
      { h: "Vì sao bốc thăm trực tuyến khó tham gia từ nước ngoài", list: [
        "Hầu hết các đợt bốc thăm và đặt trước đòi hỏi tài khoản Nhật và địa chỉ giao hàng tại Nhật.",
        "Thời gian đăng ký ngắn, và khi đã đăng ký thường không thể rút lại.",
      ] },
      { h: "Kizuna hỗ trợ bạn thế nào", p: "Vì quyền trúng thưởng không thể chuyển nhượng, chúng tôi không thể tham gia bốc thăm Starbucks hoặc nhận túi thay bạn. Với những túi bán tại cửa hàng, có thể chúng tôi giúp được.", list: [
        "Vào tháng 12, hãy cho chúng tôi biết thương hiệu và ngân sách. Chúng tôi sẽ báo lại liệu có thể xếp hàng giúp bạn không.",
        "Không có đảm bảo: túi được ưa chuộng hết trong vài phút, nội dung không biết trước và không đổi trả được.",
        "Việc gửi hàng đầu tháng 1 phụ thuộc vào lịch nghỉ lễ của đơn vị vận chuyển. Đơn Giáng sinh nhận đến 5/12, đó là một hạn chót riêng.",
      ] },
      { h: "Trước khi lên kế hoạch", p: "Thông tin Starbucks lấy từ trang chính thức tính đến 31/10/2026. Lịch tổng quát lấy từ các hướng dẫn du lịch và có thể thay đổi, vì vậy hãy xem trang web chính thức của từng thương hiệu." },
    ],
    ctaText: "Bạn quan tâm đến túi may mắn Năm mới?", ctaBtn: "Gửi yêu cầu cho chúng tôi →",
  },
  nl: {
    eyebrow: "Nieuwjaar 2027 · Gelukszakken",
    title: "Fukubukuro 2027, Japanse nieuwjaars-gelukszakken: ", titleEm: "data, loting en hoe we helpen",
    lead: "Fukubukuro zijn verzegelde gelukszakken die in Japan rond Nieuwjaar worden verkocht. Veel zijn in november en december al uitverkocht via online loting en voorbestellingen, dus nu is het moment om te plannen. Hier lees je hoe ze werken, en wat we wel en niet voor je kunnen doen.",
    factsH: "Belangrijkste feiten",
    facts: [
      ["Verkoop in de winkel", "Op 1 januari, of bij de eerste verkoop van het jaar op 2 januari (de meeste winkels) of 3 januari (sommige). In 2027: vrijdag 1, zaterdag 2, zondag 3"],
      ["Voorbestellen", "Veel zakken worden in november en december, vóór Nieuwjaar, voorbesteld of gewonnen via loting"],
      ["Starbucks-zak 2027", "¥9.500 inclusief btw. Alleen online loting. Inschrijven van 4 november (10:00) tot 15 november (23:59), uitslag rond 25 november, betalen vóór 2 december, levering 1–7 januari"],
      ["Retour", "Fukubukuro kunnen over het algemeen niet worden teruggestuurd of omgeruild"],
      ["Andere merken", "Mister Donut 2027 was op 29 oktober nog niet aangekondigd. Voor Pokémon Center, Sanrio of Uniqlo vonden we geen bevestigde 2027-details"],
    ],
    sections: [
      { h: "Wat een fukubukuro is", list: [
        "Een verzegelde zak tegen een vaste prijs, meestal met artikelen die meer waard zijn dan de prijs.",
        "Sommige zakken tonen hun inhoud (vaak het geval bij online verkochte warenhuiszakken), andere zijn een complete verrassing, zoals de meeste Starbucks- en elektronicazakken.",
        "In de regel kunnen fukubukuro niet worden teruggestuurd of omgeruild.",
      ] },
      { h: "Wanneer en waar", list: [
        "In de winkels gaan de zakken in de verkoop op 1 januari of bij de eerste verkoop van het jaar, op 2 of 3 januari.",
        "Populaire zakken kunnen binnen enkele minuten na opening uitverkocht zijn, en sommige winkels delen genummerde tickets uit voor de meest gewilde. Gidsen raden aan minstens een uur voor opening in de rij te staan.",
        "De startdatum van de reservering van een zak en de releasedatum zijn niet hetzelfde, dus check om welke datum het gaat.",
      ] },
      { h: "Starbucks Japan gelukszak 2027: officiële regels", list: [
        "Eén inschrijving per persoon. Je hebt een volledig My Starbucks-webaccount nodig (een voorlopig account dat alleen in de app bestaat kan niet meedoen). Gold-leden tellen voor twee inschrijvingen, maar er kan maar één zak worden gewonnen.",
        "Winnaars worden rond 25 november per e-mail op de hoogte gebracht (ongeveer 11:00–17:00), moeten vóór 2 december 23:59 betalen en kiezen een leverdatum tussen 1 en 7 januari. Adres en datum zijn daarna niet meer te wijzigen.",
        "Inhoud: een gelimiteerde roestvrijstalen fles, 3 artikelen, twee zakken van 100 g koffiebonen, een koffiebonenticket (tot ¥2.000), 7 drankjestickets en 6 eten-proeftickets. De inhoud verschilt per zak, en er kan een gouden mok- en Bearista-set in zitten (1.000 stuks).",
        "Het winrecht kan niet worden overgedragen of doorverkocht, en een inschrijving kan niet worden geannuleerd.",
      ] },
      { h: "Waarom online loting lastig is vanuit het buitenland", list: [
        "De meeste lotingen en voorbestellingen gaan uit van een Japans account en een bezorgadres in Japan.",
        "De inschrijfperiodes zijn kort, en na aanmelding kun je meestal niet meer terug.",
      ] },
      { h: "Zo helpt Kizuna", p: "Omdat het winrecht niet overdraagbaar is, kunnen we niet meedoen aan de Starbucks-loting of de zak voor je in ontvangst nemen. Bij zakken die in winkels worden verkocht kunnen we misschien helpen.", list: [
        "Laat ons in december het merk en je budget weten. We vertellen je of we voor je kunnen aanschuiven.",
        "Er is geen garantie: populaire zakken zijn in minuten uitverkocht, de inhoud is onbekend en retour is niet mogelijk.",
        "Verzending begin januari hangt af van de feestdagen van de vervoerders. Kerstbestellingen nemen we aan tot 5 december, dat is een aparte deadline.",
      ] },
      { h: "Voor je gaat plannen", p: "De Starbucks-gegevens komen van de officiële pagina van Starbucks Japan, stand 31 oktober 2026. De algemene kalender komt uit reisgidsen en kan veranderen, check dus de officiële site van elk merk." },
    ],
    ctaText: "Interesse in een nieuwjaars-gelukszak?", ctaBtn: "Stuur ons je verzoek →",
  },
};
