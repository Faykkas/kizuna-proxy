// @ts-nocheck
// app/brandGuides.ts
//
// "Buy <brand> in Japan from official stores" guides, 12 languages. The process text is shared
// (same professional workflow as the Coach guide); each brand only adds its own short intro
// sentence. Consumed through guideTranslations (spread at the end of that object).

// Shared copy. {B} is replaced by the brand name; {INTRO} by the brand's own sentence.
const COMMON = {
  en: {
    eyebrow: "{B} · Official Stores in Japan",
    title: "Buying {B} in Japan, ", titleEm: "the Professional Way",
    lead: "Kizuna Proxy buys {B} products for customers in official stores all over Japan. We work in a clear, professional way: we buy directly from official stores — not from resale marketplaces.",
    h1: "Why official stores matter",
    p1: "When you order through us, we go to an official store, check the item in person, and pay for it ourselves. You know exactly where your {B} item comes from, and you are not relying on a third-party seller you cannot verify.",
    cover: "Because we cover the whole country, we are not limited to one city. If the item, color or size you want is not available in Tokyo, we can look for it in stores elsewhere in Japan.",
    h2: "How our professional process works",
    list: [
      { strong: "1. You send your request", text: "— tell us the item, color and size you want. A photo or a link helps a lot." },
      { strong: "2. We search and confirm", text: "— we look for the item in official stores across Japan and confirm availability and the total cost with you before anything is bought." },
      { strong: "3. We buy it at an official store", text: "— we purchase the item in person, in an official store." },
      { strong: "4. Photos, packing and tracked shipping", text: "— we send you photos of your item, pack it carefully, and ship it to you with a tracking number, usually by EMS." },
    ],
    h3: "Good to know before you order",
    p3: "Stock differs from store to store and some items sell out quickly, so we recommend contacting us as early as possible. Your payment page shows the item price and our service fee as separate lines, so you always see what you are paying for.",
    ctaText: "Looking for {B} in Japan?", ctaBtn: "Send us your request →",
  },
  fr: {
    eyebrow: "{B} · Boutiques officielles au Japon",
    title: "Acheter {B} au Japon, ", titleEm: "façon professionnelle",
    lead: "Kizuna Proxy achète des produits {B} pour ses clients dans les boutiques officielles de tout le Japon. Nous travaillons de façon claire et professionnelle : nous achetons directement en boutique officielle — pas sur des sites de revente.",
    h1: "Pourquoi les boutiques officielles comptent",
    p1: "Quand vous commandez chez nous, nous allons dans une boutique officielle, nous vérifions l'article sur place et nous le payons nous-mêmes. Vous savez exactement d'où vient votre article {B}, sans dépendre d'un vendeur tiers impossible à vérifier.",
    cover: "Comme nous couvrons tout le pays, nous ne sommes pas limités à une seule ville. Si l'article, la couleur ou la taille que vous voulez n'est pas disponible à Tokyo, nous pouvons le chercher dans d'autres boutiques du Japon.",
    h2: "Comment fonctionne notre méthode professionnelle",
    list: [
      { strong: "1. Vous envoyez votre demande", text: "— indiquez-nous l'article, la couleur et la taille souhaités. Une photo ou un lien aide beaucoup." },
      { strong: "2. Nous cherchons et confirmons", text: "— nous cherchons l'article dans les boutiques officielles de tout le Japon et nous confirmons avec vous la disponibilité et le coût total avant tout achat." },
      { strong: "3. Nous l'achetons en boutique officielle", text: "— nous achetons l'article en personne, dans une boutique officielle." },
      { strong: "4. Photos, emballage et envoi suivi", text: "— nous vous envoyons des photos de votre article, nous l'emballons avec soin et nous l'expédions avec un numéro de suivi, généralement par EMS." },
    ],
    h3: "À savoir avant de commander",
    p3: "Les stocks varient d'une boutique à l'autre et certains articles s'écoulent vite : contactez-nous le plus tôt possible. Votre page de paiement affiche le prix de l'article et nos frais de service sur des lignes séparées, pour que vous sachiez toujours ce que vous payez.",
    ctaText: "Vous cherchez {B} au Japon ?", ctaBtn: "Envoyez-nous votre demande →",
  },
  ja: {
    eyebrow: "{B}・日本の公式ストア",
    title: "日本で{B}を買う、", titleEm: "プロの方法",
    lead: "Kizuna Proxyは、日本全国の公式ストアでお客様のために{B}の商品を購入します。私たちは明確でプロフェッショナルな方法で対応しています。リセールサイトではなく、公式ストアから直接購入します。",
    h1: "公式ストアにこだわる理由",
    p1: "ご注文いただいた商品は、私たちが公式ストアに出向き、その場で商品を確認し、私たち自身が支払って購入します。{B}の商品の入手先がはっきりしており、確認できない第三者の販売者に頼る必要はありません。",
    cover: "日本全国を対象としているため、特定の都市に限りません。ご希望の商品・色・サイズが東京にない場合でも、日本国内の他の店舗で探すことができます。",
    h2: "プロの対応の流れ",
    list: [
      { strong: "1. ご依頼をお送りください", text: "— ご希望の商品・色・サイズをお知らせください。写真やリンクがあると大変助かります。" },
      { strong: "2. 探して、確認します", text: "— 日本全国の公式ストアで商品を探し、購入する前に在庫状況と合計金額をお客様に確認します。" },
      { strong: "3. 公式ストアで購入します", text: "— 公式ストアで、直接商品を購入します。" },
      { strong: "4. 写真、梱包、追跡付き発送", text: "— 商品の写真をお送りし、丁寧に梱包して、通常はEMSで追跡番号付きで発送します。" },
    ],
    h3: "ご注文前に知っておいていただきたいこと",
    p3: "在庫は店舗ごとに異なり、人気の商品はすぐに売り切れることがあります。できるだけお早めにご連絡ください。お支払いページでは、商品代金と当社のサービス手数料が別の行で表示されるため、何にお支払いいただくかをいつでも確認できます。",
    ctaText: "日本で{B}をお探しですか？", ctaBtn: "ご依頼を送る →",
  },
  es: {
    eyebrow: "{B} · Tiendas oficiales en Japón",
    title: "Comprar {B} en Japón, ", titleEm: "de forma profesional",
    lead: "Kizuna Proxy compra productos {B} para sus clientes en tiendas oficiales de todo Japón. Trabajamos de forma clara y profesional: compramos directamente en tiendas oficiales, no en sitios de reventa.",
    h1: "Por qué importan las tiendas oficiales",
    p1: "Cuando pides con nosotros, vamos a una tienda oficial, revisamos el artículo en persona y lo pagamos nosotros mismos. Sabes exactamente de dónde viene tu artículo {B} y no dependes de un vendedor externo que no puedes verificar.",
    cover: "Como cubrimos todo el país, no estamos limitados a una sola ciudad. Si el artículo, color o talla que quieres no está disponible en Tokio, podemos buscarlo en tiendas de otras zonas de Japón.",
    h2: "Cómo funciona nuestro proceso profesional",
    list: [
      { strong: "1. Nos envías tu solicitud", text: "— dinos el artículo, el color y la talla que quieres. Una foto o un enlace ayuda mucho." },
      { strong: "2. Buscamos y confirmamos", text: "— buscamos el artículo en tiendas oficiales de todo Japón y confirmamos contigo la disponibilidad y el coste total antes de comprar nada." },
      { strong: "3. Lo compramos en una tienda oficial", text: "— compramos el artículo en persona, en una tienda oficial." },
      { strong: "4. Fotos, embalaje y envío con seguimiento", text: "— te enviamos fotos de tu artículo, lo embalamos con cuidado y lo enviamos con número de seguimiento, normalmente por EMS." },
    ],
    h3: "Bueno saber antes de pedir",
    p3: "El stock varía de una tienda a otra y algunos artículos se agotan rápido, por eso te recomendamos contactarnos cuanto antes. Tu página de pago muestra el precio del artículo y nuestra tarifa de servicio en líneas separadas, para que siempre sepas qué estás pagando.",
    ctaText: "¿Buscas {B} en Japón?", ctaBtn: "Envíanos tu solicitud →",
  },
  it: {
    eyebrow: "{B} · Negozi ufficiali in Giappone",
    title: "Comprare {B} in Giappone, ", titleEm: "in modo professionale",
    lead: "Kizuna Proxy acquista prodotti {B} per i suoi clienti nei negozi ufficiali di tutto il Giappone. Lavoriamo in modo chiaro e professionale: acquistiamo direttamente nei negozi ufficiali, non su siti di rivendita.",
    h1: "Perché i negozi ufficiali contano",
    p1: "Quando ordini con noi, andiamo in un negozio ufficiale, controlliamo l'articolo di persona e lo paghiamo noi stessi. Sai esattamente da dove arriva il tuo articolo {B} e non dipendi da un venditore terzo che non puoi verificare.",
    cover: "Poiché copriamo tutto il paese, non siamo limitati a una sola città. Se l'articolo, il colore o la taglia che vuoi non è disponibile a Tokyo, possiamo cercarlo nei negozi di altre zone del Giappone.",
    h2: "Come funziona il nostro processo professionale",
    list: [
      { strong: "1. Ci invii la tua richiesta", text: "— indicaci articolo, colore e taglia che desideri. Una foto o un link aiuta molto." },
      { strong: "2. Cerchiamo e confermiamo", text: "— cerchiamo l'articolo nei negozi ufficiali di tutto il Giappone e confermiamo con te disponibilità e costo totale prima di acquistare qualsiasi cosa." },
      { strong: "3. Lo acquistiamo in un negozio ufficiale", text: "— acquistiamo l'articolo di persona, in un negozio ufficiale." },
      { strong: "4. Foto, imballaggio e spedizione tracciata", text: "— ti inviamo le foto del tuo articolo, lo imballiamo con cura e lo spediamo con un numero di tracciamento, di solito tramite EMS." },
    ],
    h3: "Cosa sapere prima di ordinare",
    p3: "La disponibilità cambia da un negozio all'altro e alcuni articoli si esauriscono in fretta, quindi ti consigliamo di contattarci il prima possibile. La tua pagina di pagamento mostra il prezzo dell'articolo e il nostro costo del servizio su righe separate, così sai sempre cosa stai pagando.",
    ctaText: "Cerchi {B} in Giappone?", ctaBtn: "Inviaci la tua richiesta →",
  },
  de: {
    eyebrow: "{B} · Offizielle Stores in Japan",
    title: "{B} in Japan kaufen, ", titleEm: "auf professionelle Art",
    lead: "Kizuna Proxy kauft {B}-Produkte für Kunden in offiziellen Stores in ganz Japan. Wir arbeiten klar und professionell: Wir kaufen direkt in offiziellen Stores — nicht auf Wiederverkaufsplattformen.",
    h1: "Warum offizielle Stores wichtig sind",
    p1: "Wenn du über uns bestellst, gehen wir in einen offiziellen Store, prüfen den Artikel vor Ort und bezahlen ihn selbst. Du weißt genau, woher dein {B}-Artikel stammt, und bist nicht auf einen Drittverkäufer angewiesen, den du nicht überprüfen kannst.",
    cover: "Da wir das ganze Land abdecken, sind wir nicht auf eine Stadt beschränkt. Ist der gewünschte Artikel, die Farbe oder die Größe in Tokio nicht verfügbar, können wir in Stores anderswo in Japan danach suchen.",
    h2: "So läuft unser professioneller Prozess ab",
    list: [
      { strong: "1. Du sendest uns deine Anfrage", text: "— nenne uns Artikel, Farbe und Größe. Ein Foto oder ein Link hilft sehr." },
      { strong: "2. Wir suchen und bestätigen", text: "— wir suchen den Artikel in offiziellen Stores in ganz Japan und bestätigen mit dir Verfügbarkeit und Gesamtkosten, bevor etwas gekauft wird." },
      { strong: "3. Wir kaufen ihn in einem offiziellen Store", text: "— wir kaufen den Artikel persönlich in einem offiziellen Store." },
      { strong: "4. Fotos, Verpackung und Versand mit Sendungsverfolgung", text: "— wir schicken dir Fotos deines Artikels, verpacken ihn sorgfältig und versenden ihn mit Sendungsnummer, in der Regel per EMS." },
    ],
    h3: "Gut zu wissen vor der Bestellung",
    p3: "Der Bestand unterscheidet sich von Store zu Store und manche Artikel sind schnell ausverkauft, deshalb empfehlen wir, uns so früh wie möglich zu kontaktieren. Auf deiner Zahlungsseite werden Artikelpreis und unsere Servicegebühr in getrennten Zeilen angezeigt, damit du immer siehst, wofür du bezahlst.",
    ctaText: "Du suchst {B} in Japan?", ctaBtn: "Sende uns deine Anfrage →",
  },
  ko: {
    eyebrow: "{B} · 일본 공식 매장",
    title: "일본에서 {B} 구매, ", titleEm: "전문가의 방식",
    lead: "Kizuna Proxy는 일본 전역의 공식 매장에서 고객님을 위해 {B} 제품을 구매합니다. 저희는 투명하고 전문적으로 일합니다. 중고 거래 사이트가 아니라 공식 매장에서 직접 구매합니다.",
    h1: "공식 매장이 중요한 이유",
    p1: "저희를 통해 주문하시면, 저희가 공식 매장에 직접 가서 상품을 확인하고 직접 결제합니다. {B} 상품이 어디에서 왔는지 정확히 알 수 있으며, 확인할 수 없는 제3의 판매자에게 의존하지 않아도 됩니다.",
    cover: "일본 전역을 대상으로 하기 때문에 한 도시에 국한되지 않습니다. 원하시는 상품, 색상 또는 사이즈가 도쿄에 없다면 일본 내 다른 지역의 매장에서 찾아볼 수 있습니다.",
    h2: "전문적인 진행 방식",
    list: [
      { strong: "1. 요청을 보내주세요", text: "— 원하시는 상품, 색상, 사이즈를 알려주세요. 사진이나 링크가 있으면 큰 도움이 됩니다." },
      { strong: "2. 찾아보고 확인합니다", text: "— 일본 전역의 공식 매장에서 상품을 찾고, 구매하기 전에 재고 여부와 총 비용을 고객님과 확인합니다." },
      { strong: "3. 공식 매장에서 구매합니다", text: "— 공식 매장에서 직접 상품을 구매합니다." },
      { strong: "4. 사진, 포장, 추적 가능한 배송", text: "— 상품 사진을 보내드리고, 꼼꼼히 포장한 뒤 보통 EMS로 추적번호와 함께 발송합니다." },
    ],
    h3: "주문 전에 알아두세요",
    p3: "재고는 매장마다 다르고 일부 상품은 빨리 품절되므로 가능한 한 빨리 연락해 주시길 권장합니다. 결제 페이지에는 상품 가격과 당사 서비스 수수료가 별도의 줄로 표시되어, 무엇에 대해 결제하는지 항상 확인하실 수 있습니다.",
    ctaText: "일본에서 {B}를 찾고 계신가요?", ctaBtn: "요청 보내기 →",
  },
  zh: {
    eyebrow: "{B} · 日本官方门店",
    title: "在日本购买 {B}，", titleEm: "专业的方式",
    lead: "Kizuna Proxy 在日本各地的官方门店为客户代购 {B} 商品。我们的做法清晰而专业：直接在官方门店购买，而不是从转售平台购买。",
    h1: "为什么官方门店很重要",
    p1: "当您通过我们下单时，我们会前往官方门店，当场检查商品并由我们自己付款购买。您清楚地知道 {B} 商品的来源，无需依赖无法核实的第三方卖家。",
    cover: "由于我们覆盖日本全国，不局限于某一座城市。如果您想要的商品、颜色或尺寸在东京没有货，我们可以到日本其他地区的门店寻找。",
    h2: "我们专业的流程",
    list: [
      { strong: "1. 您提交需求", text: "— 告诉我们您想要的商品、颜色和尺寸。附上照片或链接会很有帮助。" },
      { strong: "2. 我们查找并确认", text: "— 我们在日本各地的官方门店查找商品，并在购买之前与您确认库存和总费用。" },
      { strong: "3. 在官方门店购买", text: "— 我们亲自前往官方门店购买商品。" },
      { strong: "4. 照片、包装与可追踪的运输", text: "— 我们会把商品的照片发给您，仔细包装后，通常通过 EMS 寄出并提供追踪单号。" },
    ],
    h3: "下单前须知",
    p3: "不同门店的库存各不相同，部分商品很快售罄，因此建议您尽早联系我们。您的付款页面会将商品价格和我们的服务费分行显示，让您随时清楚自己支付的是什么。",
    ctaText: "想在日本找 {B}？", ctaBtn: "发送您的需求 →",
  },
  pt: {
    eyebrow: "{B} · Lojas oficiais no Japão",
    title: "Comprar {B} no Japão, ", titleEm: "de forma profissional",
    lead: "A Kizuna Proxy compra produtos {B} para os clientes em lojas oficiais de todo o Japão. Trabalhamos de forma clara e profissional: compramos diretamente em lojas oficiais, não em sites de revenda.",
    h1: "Por que as lojas oficiais importam",
    p1: "Quando você pede conosco, vamos a uma loja oficial, verificamos o item pessoalmente e pagamos por ele nós mesmos. Você sabe exatamente de onde vem o seu item {B} e não depende de um vendedor terceiro que não pode verificar.",
    cover: "Como cobrimos o país inteiro, não ficamos limitados a uma única cidade. Se o item, a cor ou o tamanho que você quer não estiver disponível em Tóquio, podemos procurá-lo em lojas de outras regiões do Japão.",
    h2: "Como funciona o nosso processo profissional",
    list: [
      { strong: "1. Você envia o seu pedido", text: "— diga-nos o item, a cor e o tamanho que deseja. Uma foto ou um link ajuda muito." },
      { strong: "2. Procuramos e confirmamos", text: "— procuramos o item em lojas oficiais de todo o Japão e confirmamos com você a disponibilidade e o custo total antes de comprar qualquer coisa." },
      { strong: "3. Compramos em uma loja oficial", text: "— compramos o item pessoalmente, em uma loja oficial." },
      { strong: "4. Fotos, embalagem e envio rastreado", text: "— enviamos fotos do seu item, embalamos com cuidado e despachamos com código de rastreamento, normalmente por EMS." },
    ],
    h3: "Bom saber antes de pedir",
    p3: "O estoque varia de loja para loja e alguns itens esgotam rápido, por isso recomendamos que nos contate o quanto antes. A sua página de pagamento mostra o preço do item e a nossa taxa de serviço em linhas separadas, para que você sempre saiba pelo que está pagando.",
    ctaText: "Procurando {B} no Japão?", ctaBtn: "Envie o seu pedido →",
  },
  id: {
    eyebrow: "{B} · Toko Resmi di Jepang",
    title: "Membeli {B} di Jepang, ", titleEm: "dengan Cara Profesional",
    lead: "Kizuna Proxy membelikan produk {B} untuk pelanggan di toko resmi di seluruh Jepang. Kami bekerja dengan cara yang jelas dan profesional: kami membeli langsung di toko resmi — bukan dari situs penjualan ulang.",
    h1: "Mengapa toko resmi itu penting",
    p1: "Saat Anda memesan melalui kami, kami datang ke toko resmi, memeriksa barang secara langsung, dan membayarnya sendiri. Anda tahu persis dari mana barang {B} Anda berasal, dan tidak bergantung pada penjual pihak ketiga yang tidak bisa Anda verifikasi.",
    cover: "Karena kami mencakup seluruh negeri, kami tidak terbatas pada satu kota. Jika barang, warna, atau ukuran yang Anda inginkan tidak tersedia di Tokyo, kami bisa mencarinya di toko-toko di wilayah lain di Jepang.",
    h2: "Bagaimana proses profesional kami bekerja",
    list: [
      { strong: "1. Anda mengirim permintaan", text: "— beri tahu kami barang, warna, dan ukuran yang Anda inginkan. Foto atau tautan sangat membantu." },
      { strong: "2. Kami mencari dan mengonfirmasi", text: "— kami mencari barang di toko resmi di seluruh Jepang dan mengonfirmasi ketersediaan serta total biaya kepada Anda sebelum membeli apa pun." },
      { strong: "3. Kami membelinya di toko resmi", text: "— kami membeli barang secara langsung di toko resmi." },
      { strong: "4. Foto, pengemasan, dan pengiriman dengan pelacakan", text: "— kami mengirimkan foto barang Anda, mengemasnya dengan hati-hati, dan mengirimkannya dengan nomor pelacakan, biasanya lewat EMS." },
    ],
    h3: "Hal yang perlu diketahui sebelum memesan",
    p3: "Stok berbeda di setiap toko dan beberapa barang cepat habis, jadi kami sarankan Anda menghubungi kami sedini mungkin. Halaman pembayaran Anda menampilkan harga barang dan biaya layanan kami pada baris terpisah, sehingga Anda selalu tahu apa yang Anda bayar.",
    ctaText: "Mencari {B} di Jepang?", ctaBtn: "Kirim permintaan Anda →",
  },
  vi: {
    eyebrow: "{B} · Cửa hàng chính hãng tại Nhật Bản",
    title: "Mua {B} tại Nhật Bản, ", titleEm: "theo cách chuyên nghiệp",
    lead: "Kizuna Proxy mua sản phẩm {B} cho khách hàng tại các cửa hàng chính hãng trên khắp Nhật Bản. Chúng tôi làm việc rõ ràng và chuyên nghiệp: chúng tôi mua trực tiếp tại cửa hàng chính hãng — không mua từ các trang bán lại.",
    h1: "Vì sao cửa hàng chính hãng quan trọng",
    p1: "Khi bạn đặt hàng qua chúng tôi, chúng tôi sẽ đến cửa hàng chính hãng, kiểm tra sản phẩm trực tiếp và tự thanh toán. Bạn biết chính xác sản phẩm {B} của mình đến từ đâu, và không phải phụ thuộc vào người bán bên thứ ba mà bạn không thể kiểm chứng.",
    cover: "Vì chúng tôi phục vụ trên toàn quốc nên không bị giới hạn ở một thành phố. Nếu sản phẩm, màu hoặc kích cỡ bạn muốn không có ở Tokyo, chúng tôi có thể tìm ở các cửa hàng tại khu vực khác của Nhật Bản.",
    h2: "Quy trình chuyên nghiệp của chúng tôi",
    list: [
      { strong: "1. Bạn gửi yêu cầu", text: "— cho chúng tôi biết sản phẩm, màu và kích cỡ bạn muốn. Một bức ảnh hoặc đường dẫn sẽ rất hữu ích." },
      { strong: "2. Chúng tôi tìm kiếm và xác nhận", text: "— chúng tôi tìm sản phẩm tại các cửa hàng chính hãng trên khắp Nhật Bản và xác nhận với bạn tình trạng còn hàng cùng tổng chi phí trước khi mua bất cứ thứ gì." },
      { strong: "3. Chúng tôi mua tại cửa hàng chính hãng", text: "— chúng tôi trực tiếp mua sản phẩm tại cửa hàng chính hãng." },
      { strong: "4. Ảnh, đóng gói và vận chuyển có theo dõi", text: "— chúng tôi gửi ảnh sản phẩm cho bạn, đóng gói cẩn thận và gửi đi kèm mã theo dõi, thường qua EMS." },
    ],
    h3: "Điều cần biết trước khi đặt hàng",
    p3: "Hàng tồn kho khác nhau ở mỗi cửa hàng và một số sản phẩm hết rất nhanh, vì vậy chúng tôi khuyên bạn nên liên hệ sớm nhất có thể. Trang thanh toán của bạn hiển thị giá sản phẩm và phí dịch vụ của chúng tôi trên các dòng riêng, để bạn luôn biết mình đang trả tiền cho điều gì.",
    ctaText: "Bạn đang tìm {B} tại Nhật Bản?", ctaBtn: "Gửi yêu cầu của bạn →",
  },
  nl: {
    eyebrow: "{B} · Officiële winkels in Japan",
    title: "{B} kopen in Japan, ", titleEm: "op de professionele manier",
    lead: "Kizuna Proxy koopt {B}-producten voor klanten in officiële winkels door heel Japan. We werken duidelijk en professioneel: we kopen rechtstreeks in officiële winkels — niet op doorverkoopplatforms.",
    h1: "Waarom officiële winkels ertoe doen",
    p1: "Wanneer je via ons bestelt, gaan we naar een officiële winkel, controleren we het artikel ter plekke en betalen we er zelf voor. Je weet precies waar je {B}-artikel vandaan komt en je bent niet afhankelijk van een externe verkoper die je niet kunt controleren.",
    cover: "Omdat we het hele land bestrijken, zijn we niet beperkt tot één stad. Als het artikel, de kleur of de maat die je wilt niet in Tokio beschikbaar is, kunnen we ernaar zoeken in winkels elders in Japan.",
    h2: "Zo werkt ons professionele proces",
    list: [
      { strong: "1. Je stuurt je verzoek", text: "— laat ons het artikel, de kleur en de maat weten. Een foto of link helpt enorm." },
      { strong: "2. Wij zoeken en bevestigen", text: "— we zoeken het artikel in officiële winkels door heel Japan en bevestigen met jou de beschikbaarheid en de totale kosten voordat er iets gekocht wordt." },
      { strong: "3. Wij kopen het in een officiële winkel", text: "— we kopen het artikel persoonlijk in een officiële winkel." },
      { strong: "4. Foto's, verpakking en verzending met tracking", text: "— we sturen je foto's van je artikel, verpakken het zorgvuldig en verzenden het met een trackingnummer, meestal via EMS." },
    ],
    h3: "Goed om te weten voor je bestelt",
    p3: "De voorraad verschilt per winkel en sommige artikelen zijn snel uitverkocht, dus we raden aan om zo snel mogelijk contact met ons op te nemen. Op je betaalpagina worden de artikelprijs en onze servicekosten op aparte regels getoond, zodat je altijd ziet waarvoor je betaalt.",
    ctaText: "Op zoek naar {B} in Japan?", ctaBtn: "Stuur ons je verzoek →",
  },
};

// One short, factual sentence per brand and language (what the brand is, why people look for it in Japan).
const INTROS = {
  porter: {
    en: "PORTER is a Japanese bag brand from Yoshida & Co., known for durable nylon bags such as the Tanker series, and some colors, collaborations and limited releases are hard to find outside Japan.",
    fr: "PORTER est une marque japonaise de sacs de la maison Yoshida & Co., connue pour ses sacs en nylon robustes comme la série Tanker ; certains coloris, collaborations et éditions limitées sont difficiles à trouver hors du Japon.",
    ja: "PORTER（ポーター）は吉田カバンが手がける日本のバッグブランドで、タンカーシリーズなどの丈夫なナイロンバッグで知られています。一部のカラー、コラボ、限定品は日本国外では見つけにくいものがあります。",
    es: "PORTER es una marca japonesa de bolsos de Yoshida & Co., conocida por sus resistentes bolsos de nailon como la serie Tanker; algunos colores, colaboraciones y ediciones limitadas son difíciles de encontrar fuera de Japón.",
    it: "PORTER è un marchio giapponese di borse di Yoshida & Co., noto per le sue resistenti borse in nylon come la serie Tanker; alcuni colori, collaborazioni ed edizioni limitate sono difficili da trovare fuori dal Giappone.",
    de: "PORTER ist eine japanische Taschenmarke von Yoshida & Co., bekannt für robuste Nylontaschen wie die Tanker-Serie; manche Farben, Kooperationen und limitierte Editionen sind außerhalb Japans schwer zu finden.",
    ko: "PORTER(포터)는 요시다 가방이 만드는 일본의 가방 브랜드로, 탱커 시리즈 같은 튼튼한 나일론 가방으로 유명합니다. 일부 색상, 콜라보, 한정판은 일본 밖에서 구하기 어렵습니다.",
    zh: "PORTER 是 Yoshida & Co.（吉田包）旗下的日本包包品牌，以 Tanker 系列等耐用的尼龙包闻名；部分配色、联名款和限量款在日本以外很难买到。",
    pt: "A PORTER é uma marca japonesa de bolsas da Yoshida & Co., conhecida por bolsas de nylon resistentes, como a série Tanker; algumas cores, colaborações e edições limitadas são difíceis de encontrar fora do Japão.",
    id: "PORTER adalah merek tas Jepang dari Yoshida & Co., dikenal lewat tas nilon yang tahan lama seperti seri Tanker; beberapa warna, kolaborasi, dan rilis terbatas sulit ditemukan di luar Jepang.",
    vi: "PORTER là thương hiệu túi của Nhật Bản thuộc Yoshida & Co., nổi tiếng với các mẫu túi nylon bền như dòng Tanker; một số màu, bản hợp tác và phiên bản giới hạn rất khó tìm bên ngoài Nhật Bản.",
    nl: "PORTER is een Japans tassenmerk van Yoshida & Co., bekend om duurzame nylon tassen zoals de Tanker-serie; sommige kleuren, samenwerkingen en gelimiteerde edities zijn buiten Japan moeilijk te vinden.",
  },
  onitsuka: {
    en: "Onitsuka Tiger is a Japanese footwear and apparel brand founded in Kobe in 1949, known for sneakers like the Mexico 66, and some colors and collaborations are hard to find outside Japan.",
    fr: "Onitsuka Tiger est une marque japonaise de chaussures et de vêtements fondée à Kobe en 1949, connue pour des sneakers comme la Mexico 66 ; certains coloris et collaborations sont difficiles à trouver hors du Japon.",
    ja: "オニツカタイガーは1949年に神戸で創業した日本のシューズ＆アパレルブランドで、メキシコ66などのスニーカーで知られています。一部のカラーやコラボは日本国外では見つけにくいものがあります。",
    es: "Onitsuka Tiger es una marca japonesa de calzado y ropa fundada en Kobe en 1949, conocida por zapatillas como la Mexico 66; algunos colores y colaboraciones son difíciles de encontrar fuera de Japón.",
    it: "Onitsuka Tiger è un marchio giapponese di calzature e abbigliamento fondato a Kobe nel 1949, noto per sneaker come la Mexico 66; alcuni colori e collaborazioni sono difficili da trovare fuori dal Giappone.",
    de: "Onitsuka Tiger ist eine japanische Schuh- und Bekleidungsmarke, 1949 in Kobe gegründet und bekannt für Sneaker wie den Mexico 66; manche Farben und Kooperationen sind außerhalb Japans schwer zu finden.",
    ko: "오니츠카 타이거는 1949년 고베에서 설립된 일본의 신발·의류 브랜드로, 멕시코 66 같은 스니커즈로 유명합니다. 일부 색상과 콜라보는 일본 밖에서 구하기 어렵습니다.",
    zh: "Onitsuka Tiger（鬼塚虎）是 1949 年创立于神户的日本鞋履与服饰品牌，以 Mexico 66 等运动鞋闻名；部分配色和联名款在日本以外很难买到。",
    pt: "A Onitsuka Tiger é uma marca japonesa de calçados e roupas fundada em Kobe em 1949, conhecida por tênis como o Mexico 66; algumas cores e colaborações são difíceis de encontrar fora do Japão.",
    id: "Onitsuka Tiger adalah merek sepatu dan pakaian Jepang yang didirikan di Kobe pada 1949, dikenal lewat sneakers seperti Mexico 66; beberapa warna dan kolaborasi sulit ditemukan di luar Jepang.",
    vi: "Onitsuka Tiger là thương hiệu giày và quần áo của Nhật Bản, thành lập tại Kobe năm 1949, nổi tiếng với các mẫu sneaker như Mexico 66; một số màu và bản hợp tác rất khó tìm bên ngoài Nhật Bản.",
    nl: "Onitsuka Tiger is een Japans schoenen- en kledingmerk, opgericht in Kobe in 1949 en bekend om sneakers zoals de Mexico 66; sommige kleuren en samenwerkingen zijn buiten Japan moeilijk te vinden.",
  },
  sanrio: {
    en: "Sanrio is the Japanese company behind Hello Kitty, My Melody, Cinnamoroll and Kuromi, and some seasonal, regional and store-exclusive items are hard to find outside Japan.",
    fr: "Sanrio est l'entreprise japonaise derrière Hello Kitty, My Melody, Cinnamoroll et Kuromi ; certains articles saisonniers, régionaux ou exclusifs à certaines boutiques sont difficiles à trouver hors du Japon.",
    ja: "サンリオは、ハローキティ、マイメロディ、シナモロール、クロミなどを手がける日本の企業です。季節限定、地域限定、店舗限定のアイテムの一部は日本国外では見つけにくいものがあります。",
    es: "Sanrio es la empresa japonesa detrás de Hello Kitty, My Melody, Cinnamoroll y Kuromi; algunos artículos de temporada, regionales o exclusivos de tienda son difíciles de encontrar fuera de Japón.",
    it: "Sanrio è l'azienda giapponese dietro Hello Kitty, My Melody, Cinnamoroll e Kuromi; alcuni articoli stagionali, regionali o esclusivi dei negozi sono difficili da trovare fuori dal Giappone.",
    de: "Sanrio ist das japanische Unternehmen hinter Hello Kitty, My Melody, Cinnamoroll und Kuromi; manche saisonalen, regionalen und shop-exklusiven Artikel sind außerhalb Japans schwer zu finden.",
    ko: "산리오는 헬로키티, 마이멜로디, 시나모롤, 쿠로미를 만든 일본 기업입니다. 일부 시즌 한정, 지역 한정, 매장 한정 상품은 일본 밖에서 구하기 어렵습니다.",
    zh: "Sanrio（三丽鸥）是 Hello Kitty、My Melody、Cinnamoroll（玉桂狗）和 Kuromi（酷洛米）背后的日本公司；部分季节限定、地区限定和门店限定商品在日本以外很难买到。",
    pt: "A Sanrio é a empresa japonesa por trás de Hello Kitty, My Melody, Cinnamoroll e Kuromi; alguns itens sazonais, regionais e exclusivos de loja são difíceis de encontrar fora do Japão.",
    id: "Sanrio adalah perusahaan Jepang di balik Hello Kitty, My Melody, Cinnamoroll, dan Kuromi; beberapa barang musiman, regional, dan eksklusif toko sulit ditemukan di luar Jepang.",
    vi: "Sanrio là công ty Nhật Bản đứng sau Hello Kitty, My Melody, Cinnamoroll và Kuromi; một số mặt hàng theo mùa, theo vùng và độc quyền tại cửa hàng rất khó tìm bên ngoài Nhật Bản.",
    nl: "Sanrio is het Japanse bedrijf achter Hello Kitty, My Melody, Cinnamoroll en Kuromi; sommige seizoens-, regionale en winkelexclusieve artikelen zijn buiten Japan moeilijk te vinden.",
  },
};

const fill = (v, B) => (typeof v === "string" ? v.split("{B}").join(B) : v);

function brandGuide(B, intros) {
  const out = {};
  for (const lang of Object.keys(COMMON)) {
    const c = COMMON[lang];
    const g = {};
    for (const k of Object.keys(c)) {
      if (k === "list") g.list = c.list.map((it) => ({ strong: fill(it.strong, B), text: fill(it.text, B) }));
      else if (k !== "cover") g[k] = fill(c[k], B);
    }
    g.p2 = `${intros[lang]} ${c.cover}`;
    out[lang] = g;
  }
  return out;
}

export const brandGuides = {
  porterYoshida: brandGuide("PORTER", INTROS.porter),
  onitsukaTiger: brandGuide("Onitsuka Tiger", INTROS.onitsuka),
  sanrio: brandGuide("Sanrio", INTROS.sanrio),
};
