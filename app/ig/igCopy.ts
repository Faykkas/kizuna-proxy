// Textes de la page /ig (lien de la bio Instagram), 12 langues.
export type IgCopy = { title: string; titleEm: string; desc: string; official: string; ask: string; empty: string; follow: string };

export const IG_COPY: Record<string, IgCopy> = {
  en: { title: "Latest from", titleEm: "Tokyo", desc: "Pop-ups, collabs and events we can shop for you. Check the official info, or ask us to buy it for you.", official: "Official info", ask: "Ask Kizuna to buy it", empty: "New posts are coming soon. Follow us on Instagram!", follow: "Follow @kizuna_proxy" },
  fr: { title: "Les nouveautés de", titleEm: "Tokyo", desc: "Pop-up, collabs et événements où l'on peut acheter pour vous. Consultez l'info officielle, ou demandez-nous de l'acheter.", official: "Info officielle", ask: "Demander à Kizuna de l'acheter", empty: "De nouveaux posts arrivent bientôt. Suivez-nous sur Instagram !", follow: "Suivre @kizuna_proxy" },
  ja: { title: "東京の", titleEm: "最新情報", desc: "ポップアップ、コラボ、イベントで代行購入できるものをご紹介。公式情報を確認するか、私たちに購入をご依頼ください。", official: "公式情報", ask: "Kizunaに購入を依頼", empty: "新しい投稿は近日公開。Instagramをフォローしてください！", follow: "@kizuna_proxy をフォロー" },
  es: { title: "Lo último de", titleEm: "Tokio", desc: "Pop-ups, colaboraciones y eventos donde podemos comprar por ti. Mira la información oficial o pídenos que lo compremos.", official: "Info oficial", ask: "Pedir a Kizuna que lo compre", empty: "Pronto habrá nuevas publicaciones. ¡Síguenos en Instagram!", follow: "Seguir a @kizuna_proxy" },
  it: { title: "Le novità da", titleEm: "Tokyo", desc: "Pop-up, collab ed eventi dove possiamo acquistare per te. Guarda le info ufficiali o chiedici di comprarlo.", official: "Info ufficiali", ask: "Chiedi a Kizuna di comprarlo", empty: "Nuovi post in arrivo. Seguici su Instagram!", follow: "Segui @kizuna_proxy" },
  de: { title: "Neues aus", titleEm: "Tokio", desc: "Pop-ups, Kollabos und Events, bei denen wir für dich einkaufen können. Sieh dir die offiziellen Infos an oder lass es uns für dich kaufen.", official: "Offizielle Infos", ask: "Kizuna kaufen lassen", empty: "Bald gibt es neue Beiträge. Folge uns auf Instagram!", follow: "@kizuna_proxy folgen" },
  ko: { title: "도쿄", titleEm: "최신 소식", desc: "대신 구매해 드릴 수 있는 팝업, 콜라보, 이벤트 소식. 공식 정보를 확인하거나 구매를 요청하세요.", official: "공식 정보", ask: "Kizuna에 구매 요청", empty: "새 게시물이 곧 올라옵니다. 인스타그램을 팔로우하세요!", follow: "@kizuna_proxy 팔로우" },
  zh: { title: "东京", titleEm: "最新动态", desc: "我们可以为你代购的快闪店、联名和活动。查看官方信息，或请我们帮你购买。", official: "官方信息", ask: "请 Kizuna 代购", empty: "新内容即将上线，欢迎关注我们的 Instagram！", follow: "关注 @kizuna_proxy" },
  pt: { title: "Novidades de", titleEm: "Tóquio", desc: "Pop-ups, collabs e eventos onde podemos comprar para você. Veja a informação oficial ou peça para comprarmos.", official: "Info oficial", ask: "Pedir para a Kizuna comprar", empty: "Novos posts em breve. Siga-nos no Instagram!", follow: "Seguir @kizuna_proxy" },
  id: { title: "Terbaru dari", titleEm: "Tokyo", desc: "Pop-up, kolaborasi, dan acara yang bisa kami belikan untuk Anda. Lihat info resminya, atau minta kami membelikannya.", official: "Info resmi", ask: "Minta Kizuna membelikan", empty: "Postingan baru segera hadir. Ikuti kami di Instagram!", follow: "Ikuti @kizuna_proxy" },
  vi: { title: "Tin mới từ", titleEm: "Tokyo", desc: "Pop-up, hợp tác và sự kiện mà chúng tôi có thể mua hộ bạn. Xem thông tin chính thức hoặc nhờ chúng tôi mua.", official: "Thông tin chính thức", ask: "Nhờ Kizuna mua", empty: "Bài đăng mới sắp có. Theo dõi chúng tôi trên Instagram!", follow: "Theo dõi @kizuna_proxy" },
  nl: { title: "Nieuw uit", titleEm: "Tokio", desc: "Pop-ups, collabs en events waar we voor je kunnen kopen. Bekijk de officiële info of vraag ons het voor je te kopen.", official: "Officiële info", ask: "Laat Kizuna het kopen", empty: "Binnenkort nieuwe posts. Volg ons op Instagram!", follow: "Volg @kizuna_proxy" },
};

export function igCopy(lang?: string): IgCopy {
  return IG_COPY[lang || "en"] || IG_COPY.en;
}
