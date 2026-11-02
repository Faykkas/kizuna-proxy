// @ts-nocheck
// Compléments de la page Tarifs, dans les 12 langues : sélecteur de devise, conditions importantes
// (billet à prévoir, PayPal Biens et services uniquement, adresse = celle du client) et 2 questions FAQ en plus.
// Fusionné avec pricingCopyA/B/C dans pricingCopy.ts.

export const EXTRA = {
  en: {
    cur: { label: "Show prices in", note: "Approximate conversion from the yen, with rates updated daily. Payments are always charged in Japanese yen (JPY)." },
    policy: {
      label: "Before you order",
      title: "Important conditions",
      items: [
        ["Event tickets are extra", "For events that require a ticket, the ticket price must be planned for separately. It is not included in our service fees."],
        ["PayPal Goods & Services only", "For now, purchases are made exclusively through PayPal Goods & Services, for the safety of the customer and of Kizuna Proxy."],
        ["Matching delivery address", "The delivery address must match the customer's own address."],
      ],
    },
    faq: [
      ["How do I pay?", "For now, purchases are made exclusively through PayPal Goods & Services, for the safety of the customer and of Kizuna Proxy. The delivery address must match the customer's own address."],
      ["Is the ticket price included for events?", "No. For events that require a ticket, the ticket price must be planned for separately, on top of our service fees."],
    ],
  },
  fr: {
    cur: { label: "Afficher les prix en", note: "Conversion approximative depuis le yen, avec des taux mis à jour chaque jour. Les paiements sont toujours facturés en yens japonais (JPY)." },
    policy: {
      label: "Avant de commander",
      title: "Conditions importantes",
      items: [
        ["Billets d'événement en plus", "Pour les événements qui exigent un billet, le prix du billet est à prévoir séparément. Il n'est pas inclus dans nos frais de service."],
        ["PayPal Biens et services uniquement", "Pour le moment, les achats se font uniquement via PayPal Biens et services, pour la sécurité du client et la nôtre."],
        ["Adresse de livraison identique", "L'adresse de livraison doit correspondre à celle du client."],
      ],
    },
    faq: [
      ["Comment payer ?", "Pour le moment, les achats se font uniquement via PayPal Biens et services, pour la sécurité du client et la nôtre. L'adresse de livraison doit correspondre à celle du client."],
      ["Le prix du billet est-il inclus pour les événements ?", "Non. Pour les événements qui exigent un billet, le prix du billet est à prévoir séparément, en plus de nos frais de service."],
    ],
  },
  ja: {
    cur: { label: "価格の表示通貨", note: "円からの概算換算で、為替レートは毎日更新されます。お支払いは常に日本円（JPY）で請求されます。" },
    policy: {
      label: "ご注文の前に",
      title: "重要なご案内",
      items: [
        ["イベントのチケット代は別途", "チケットが必要なイベントでは、チケット代を別途ご用意ください。代行手数料には含まれていません。"],
        ["PayPal「商品・サービス」決済のみ", "現在、お支払いはお客様と当社の安全のため、PayPalの「商品・サービス」決済のみとなっています。"],
        ["配送先住所はお客様ご本人のもの", "配送先住所は、お客様ご本人の住所と一致している必要があります。"],
      ],
    },
    faq: [
      ["支払い方法は？", "現在、お支払いはお客様と当社の安全のため、PayPalの「商品・サービス」決済のみとなっています。配送先住所は、お客様ご本人の住所と一致している必要があります。"],
      ["イベントのチケット代は含まれていますか？", "いいえ。チケットが必要なイベントでは、チケット代を代行手数料とは別にご用意ください。"],
    ],
  },
  es: {
    cur: { label: "Mostrar precios en", note: "Conversión aproximada desde el yen, con tipos de cambio actualizados a diario. Los pagos siempre se cobran en yenes japoneses (JPY)." },
    policy: {
      label: "Antes de pedir",
      title: "Condiciones importantes",
      items: [
        ["Las entradas de eventos van aparte", "En los eventos que requieren entrada, el precio de la entrada debe preverse por separado. No está incluido en nuestras tarifas de servicio."],
        ["Solo PayPal Bienes y servicios", "Por ahora, las compras se hacen exclusivamente a través de PayPal Bienes y servicios, por la seguridad del cliente y la nuestra."],
        ["Dirección de entrega coincidente", "La dirección de entrega debe coincidir con la del cliente."],
      ],
    },
    faq: [
      ["¿Cómo se paga?", "Por ahora, las compras se hacen exclusivamente a través de PayPal Bienes y servicios, por la seguridad del cliente y la nuestra. La dirección de entrega debe coincidir con la del cliente."],
      ["¿Está incluido el precio de la entrada en los eventos?", "No. En los eventos que requieren entrada, el precio de la entrada debe preverse por separado, además de nuestras tarifas de servicio."],
    ],
  },
  it: {
    cur: { label: "Mostra i prezzi in", note: "Conversione approssimativa dallo yen, con tassi aggiornati ogni giorno. I pagamenti vengono sempre addebitati in yen giapponesi (JPY)." },
    policy: {
      label: "Prima di ordinare",
      title: "Condizioni importanti",
      items: [
        ["I biglietti degli eventi sono a parte", "Per gli eventi che richiedono un biglietto, il prezzo del biglietto va previsto separatamente. Non è incluso nelle nostre tariffe di servizio."],
        ["Solo PayPal Beni e servizi", "Per ora gli acquisti si effettuano esclusivamente tramite PayPal Beni e servizi, per la sicurezza del cliente e la nostra."],
        ["Indirizzo di consegna corrispondente", "L'indirizzo di consegna deve corrispondere a quello del cliente."],
      ],
    },
    faq: [
      ["Come si paga?", "Per ora gli acquisti si effettuano esclusivamente tramite PayPal Beni e servizi, per la sicurezza del cliente e la nostra. L'indirizzo di consegna deve corrispondere a quello del cliente."],
      ["Il prezzo del biglietto è incluso per gli eventi?", "No. Per gli eventi che richiedono un biglietto, il prezzo del biglietto va previsto separatamente, in aggiunta alle nostre tariffe di servizio."],
    ],
  },
  de: {
    cur: { label: "Preise anzeigen in", note: "Ungefähre Umrechnung aus Yen, Kurse werden täglich aktualisiert. Zahlungen werden immer in japanischen Yen (JPY) abgerechnet." },
    policy: {
      label: "Vor der Bestellung",
      title: "Wichtige Bedingungen",
      items: [
        ["Eventtickets kommen extra", "Bei Events, die ein Ticket erfordern, muss der Ticketpreis separat eingeplant werden. Er ist nicht in unseren Servicegebühren enthalten."],
        ["Nur PayPal Waren und Dienstleistungen", "Derzeit erfolgen Käufe ausschließlich über PayPal Waren und Dienstleistungen, zur Sicherheit des Kunden und von uns."],
        ["Übereinstimmende Lieferadresse", "Die Lieferadresse muss mit der Adresse des Kunden übereinstimmen."],
      ],
    },
    faq: [
      ["Wie bezahle ich?", "Derzeit erfolgen Käufe ausschließlich über PayPal Waren und Dienstleistungen, zur Sicherheit des Kunden und von uns. Die Lieferadresse muss mit der Adresse des Kunden übereinstimmen."],
      ["Ist der Ticketpreis bei Events inbegriffen?", "Nein. Bei Events, die ein Ticket erfordern, muss der Ticketpreis zusätzlich zu unseren Servicegebühren separat eingeplant werden."],
    ],
  },
  ko: {
    cur: { label: "가격 표시 통화", note: "엔화 기준의 대략적인 환산이며 환율은 매일 업데이트됩니다. 결제는 항상 일본 엔(JPY)으로 청구됩니다." },
    policy: {
      label: "주문 전에",
      title: "중요한 안내",
      items: [
        ["이벤트 티켓은 별도", "티켓이 필요한 이벤트는 티켓 가격을 별도로 준비해야 합니다. 대행 수수료에는 포함되어 있지 않습니다."],
        ["PayPal 상품 및 서비스 결제만 가능", "현재 구매는 고객과 저희의 안전을 위해 PayPal 상품 및 서비스 결제로만 진행됩니다."],
        ["배송 주소는 고객 본인 주소와 일치", "배송 주소는 고객 본인의 주소와 일치해야 합니다."],
      ],
    },
    faq: [
      ["결제는 어떻게 하나요?", "현재 구매는 고객과 저희의 안전을 위해 PayPal 상품 및 서비스 결제로만 진행됩니다. 배송 주소는 고객 본인의 주소와 일치해야 합니다."],
      ["이벤트 티켓 가격이 포함되어 있나요?", "아니요. 티켓이 필요한 이벤트는 대행 수수료와 별도로 티켓 가격을 준비해야 합니다."],
    ],
  },
  zh: {
    cur: { label: "价格显示币种", note: "按日元大致换算，汇率每日更新。付款始终以日元（JPY）收取。" },
    policy: {
      label: "下单之前",
      title: "重要条件",
      items: [
        ["活动门票另计", "需要门票的活动，门票费用须另行预留，不包含在我们的服务费中。"],
        ["仅限 PayPal“商品和服务”付款", "目前购买仅通过 PayPal“商品和服务”进行，以保障客户和我们双方的安全。"],
        ["收货地址须与客户本人地址一致", "收货地址必须与客户本人的地址一致。"],
      ],
    },
    faq: [
      ["如何付款？", "目前购买仅通过 PayPal“商品和服务”进行，以保障客户和我们双方的安全。收货地址必须与客户本人的地址一致。"],
      ["活动门票费用包含在内吗？", "不包含。需要门票的活动，门票费用须在我们的服务费之外另行预留。"],
    ],
  },
  pt: {
    cur: { label: "Mostrar preços em", note: "Conversão aproximada a partir do iene, com taxas atualizadas diariamente. Os pagamentos são sempre cobrados em ienes japoneses (JPY)." },
    policy: {
      label: "Antes de pedir",
      title: "Condições importantes",
      items: [
        ["Ingressos de eventos à parte", "Em eventos que exigem ingresso, o preço do ingresso deve ser previsto separadamente. Ele não está incluído nas nossas tarifas de serviço."],
        ["Apenas PayPal Bens e Serviços", "Por enquanto, as compras são feitas exclusivamente pelo PayPal Bens e Serviços, para a segurança do cliente e a nossa."],
        ["Endereço de entrega correspondente", "O endereço de entrega deve corresponder ao endereço do cliente."],
      ],
    },
    faq: [
      ["Como pago?", "Por enquanto, as compras são feitas exclusivamente pelo PayPal Bens e Serviços, para a segurança do cliente e a nossa. O endereço de entrega deve corresponder ao endereço do cliente."],
      ["O preço do ingresso está incluído nos eventos?", "Não. Em eventos que exigem ingresso, o preço do ingresso deve ser previsto separadamente, além das nossas tarifas de serviço."],
    ],
  },
  id: {
    cur: { label: "Tampilkan harga dalam", note: "Konversi perkiraan dari yen, dengan kurs yang diperbarui setiap hari. Pembayaran selalu ditagih dalam yen Jepang (JPY)." },
    policy: {
      label: "Sebelum memesan",
      title: "Ketentuan penting",
      items: [
        ["Tiket acara dihitung terpisah", "Untuk acara yang memerlukan tiket, harga tiket harus disiapkan terpisah. Harga tiket tidak termasuk dalam biaya layanan kami."],
        ["Hanya PayPal Barang & Jasa", "Untuk saat ini, pembelian dilakukan hanya melalui PayPal Barang & Jasa, demi keamanan pelanggan dan kami."],
        ["Alamat pengiriman harus sesuai", "Alamat pengiriman harus sesuai dengan alamat pelanggan."],
      ],
    },
    faq: [
      ["Bagaimana cara membayar?", "Untuk saat ini, pembelian dilakukan hanya melalui PayPal Barang & Jasa, demi keamanan pelanggan dan kami. Alamat pengiriman harus sesuai dengan alamat pelanggan."],
      ["Apakah harga tiket sudah termasuk untuk acara?", "Tidak. Untuk acara yang memerlukan tiket, harga tiket harus disiapkan terpisah, di luar biaya layanan kami."],
    ],
  },
  vi: {
    cur: { label: "Hiển thị giá bằng", note: "Quy đổi gần đúng từ yên, tỷ giá được cập nhật hằng ngày. Thanh toán luôn được thu bằng yên Nhật (JPY)." },
    policy: {
      label: "Trước khi đặt hàng",
      title: "Điều kiện quan trọng",
      items: [
        ["Vé sự kiện tính riêng", "Với các sự kiện cần vé, giá vé cần được chuẩn bị riêng. Giá vé không nằm trong phí dịch vụ của chúng tôi."],
        ["Chỉ PayPal Hàng hóa & Dịch vụ", "Hiện tại, việc mua hàng chỉ được thực hiện qua PayPal Hàng hóa & Dịch vụ, vì sự an toàn của khách hàng và của chúng tôi."],
        ["Địa chỉ giao hàng phải trùng khớp", "Địa chỉ giao hàng phải trùng với địa chỉ của khách hàng."],
      ],
    },
    faq: [
      ["Thanh toán như thế nào?", "Hiện tại, việc mua hàng chỉ được thực hiện qua PayPal Hàng hóa & Dịch vụ, vì sự an toàn của khách hàng và của chúng tôi. Địa chỉ giao hàng phải trùng với địa chỉ của khách hàng."],
      ["Giá vé có được tính trong các sự kiện không?", "Không. Với các sự kiện cần vé, giá vé cần được chuẩn bị riêng, ngoài phí dịch vụ của chúng tôi."],
    ],
  },
  nl: {
    cur: { label: "Prijzen tonen in", note: "Geschatte omrekening vanuit yen, met dagelijks bijgewerkte koersen. Betalingen worden altijd in Japanse yen (JPY) in rekening gebracht." },
    policy: {
      label: "Voor je bestelt",
      title: "Belangrijke voorwaarden",
      items: [
        ["Evenementtickets zijn extra", "Voor evenementen waarvoor een ticket nodig is, moet de ticketprijs apart worden ingepland. Die is niet inbegrepen in onze servicekosten."],
        ["Alleen PayPal Goederen en diensten", "Voorlopig gebeuren aankopen uitsluitend via PayPal Goederen en diensten, voor de veiligheid van de klant en van ons."],
        ["Overeenkomend bezorgadres", "Het bezorgadres moet overeenkomen met het adres van de klant."],
      ],
    },
    faq: [
      ["Hoe betaal ik?", "Voorlopig gebeuren aankopen uitsluitend via PayPal Goederen en diensten, voor de veiligheid van de klant en van ons. Het bezorgadres moet overeenkomen met het adres van de klant."],
      ["Is de ticketprijs bij evenementen inbegrepen?", "Nee. Voor evenementen waarvoor een ticket nodig is, moet de ticketprijs apart worden ingepland, bovenop onze servicekosten."],
    ],
  },
};
