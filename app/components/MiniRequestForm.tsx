// @ts-nocheck
"use client";
// app/components/MiniRequestForm.tsx
//
// A short version of the request form for the homepage and the bottom of every guide: what do you want,
// your email, where to ship. Same destination as /request (the `requests` table + the notify-request email,
// Formspree as a fallback), plus the page it came from so we can see which guides bring requests.
// Everything else (budget, deadline, quantity…) stays on /request, reached from the success message.

import { useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useLanguage } from "../lib/language";

const FORMSPREE_ID = "https://formspree.io/f/mnjoypyk";

const COPY = {
  en: { title: "Tell us what you want from Japan", sub: "Free quote, no commitment. We reply within 24 hours.", what: "What are you looking for?", whatPh: "A link, a description, or just tell us what you want.", email: "Your email", country: "Ship to", countryPh: "France, USA, Australia…", send: "Send my request", sending: "Sending…", okTitle: "Got it!", okText: "We'll reply within 24 hours with a quote. Check your inbox (and your spam folder).", more: "Add more details →", eMsg: "Tell us what you're looking for.", eEmail: "That email looks wrong.", eCountry: "Where should we ship it?", eFail: "Something went wrong. Please try again, or email kizunaproxy@gmail.com." },
  fr: { title: "Dites-nous ce que vous voulez du Japon", sub: "Devis gratuit, sans engagement. Réponse sous 24 h.", what: "Que cherchez-vous ?", whatPh: "Un lien, une description, ou dites-nous simplement ce que vous voulez.", email: "Votre email", country: "Livraison vers", countryPh: "France, USA, Australie…", send: "Envoyer ma demande", sending: "Envoi…", okTitle: "Bien reçu !", okText: "Nous répondons sous 24 h avec un devis. Vérifiez votre boîte mail (et vos spams).", more: "Ajouter des détails →", eMsg: "Dites-nous ce que vous cherchez.", eEmail: "Cet email semble incorrect.", eCountry: "Où devons-nous livrer ?", eFail: "Un problème est survenu. Réessayez, ou écrivez à kizunaproxy@gmail.com." },
  ja: { title: "日本から欲しいものを教えてください", sub: "お見積りは無料、お申し込みの義務はありません。24時間以内にご返信します。", what: "お探しのものは？", whatPh: "リンクや商品の説明、またはご希望をそのままお書きください。", email: "メールアドレス", country: "お届け先", countryPh: "フランス、アメリカ、オーストラリア…", send: "依頼を送信", sending: "送信中…", okTitle: "受け付けました！", okText: "24時間以内にお見積りをご返信します。受信箱（迷惑メールフォルダも）をご確認ください。", more: "詳細を追加する →", eMsg: "お探しのものを教えてください。", eEmail: "メールアドレスが正しくないようです。", eCountry: "お届け先の国を入力してください。", eFail: "エラーが発生しました。もう一度お試しいただくか、kizunaproxy@gmail.com までご連絡ください。" },
  es: { title: "Cuéntanos qué quieres de Japón", sub: "Presupuesto gratis y sin compromiso. Respondemos en 24 horas.", what: "¿Qué estás buscando?", whatPh: "Un enlace, una descripción, o simplemente dinos lo que quieres.", email: "Tu email", country: "Enviar a", countryPh: "Francia, EE. UU., Australia…", send: "Enviar mi solicitud", sending: "Enviando…", okTitle: "¡Recibido!", okText: "Te respondemos en 24 horas con un presupuesto. Revisa tu bandeja de entrada (y el spam).", more: "Añadir más detalles →", eMsg: "Cuéntanos qué buscas.", eEmail: "Ese email parece incorrecto.", eCountry: "¿A dónde lo enviamos?", eFail: "Algo salió mal. Inténtalo de nuevo o escribe a kizunaproxy@gmail.com." },
  it: { title: "Dicci cosa vuoi dal Giappone", sub: "Preventivo gratuito e senza impegno. Rispondiamo entro 24 ore.", what: "Cosa stai cercando?", whatPh: "Un link, una descrizione, o scrivici semplicemente cosa vuoi.", email: "La tua email", country: "Spedisci a", countryPh: "Francia, USA, Australia…", send: "Invia la mia richiesta", sending: "Invio…", okTitle: "Ricevuto!", okText: "Rispondiamo entro 24 ore con un preventivo. Controlla la posta in arrivo (e lo spam).", more: "Aggiungi dettagli →", eMsg: "Dicci cosa stai cercando.", eEmail: "Questa email sembra errata.", eCountry: "Dove dobbiamo spedirlo?", eFail: "Qualcosa è andato storto. Riprova o scrivi a kizunaproxy@gmail.com." },
  de: { title: "Sag uns, was du aus Japan möchtest", sub: "Kostenloses Angebot, unverbindlich. Antwort innerhalb von 24 Stunden.", what: "Wonach suchst du?", whatPh: "Ein Link, eine Beschreibung oder schreib einfach, was du möchtest.", email: "Deine E-Mail", country: "Lieferland", countryPh: "Frankreich, USA, Australien…", send: "Anfrage senden", sending: "Wird gesendet…", okTitle: "Erhalten!", okText: "Wir antworten innerhalb von 24 Stunden mit einem Angebot. Prüfe dein Postfach (und den Spam-Ordner).", more: "Weitere Angaben hinzufügen →", eMsg: "Sag uns, wonach du suchst.", eEmail: "Diese E-Mail sieht falsch aus.", eCountry: "Wohin sollen wir liefern?", eFail: "Etwas ist schiefgelaufen. Versuche es erneut oder schreibe an kizunaproxy@gmail.com." },
  ko: { title: "일본에서 원하는 것을 알려주세요", sub: "무료 견적, 구매 의무 없음. 24시간 이내에 답변드립니다.", what: "무엇을 찾으시나요?", whatPh: "링크, 설명, 또는 원하는 것을 자유롭게 적어주세요.", email: "이메일", country: "배송 국가", countryPh: "프랑스, 미국, 호주…", send: "요청 보내기", sending: "보내는 중…", okTitle: "접수되었습니다!", okText: "24시간 이내에 견적과 함께 답변드립니다. 받은편지함(스팸함 포함)을 확인해 주세요.", more: "자세한 내용 추가 →", eMsg: "찾으시는 것을 알려주세요.", eEmail: "이메일 형식이 올바르지 않습니다.", eCountry: "어디로 배송할까요?", eFail: "문제가 발생했습니다. 다시 시도하시거나 kizunaproxy@gmail.com 으로 문의해 주세요." },
  zh: { title: "告诉我们你想从日本买什么", sub: "免费报价，无需承诺。24 小时内回复。", what: "你在找什么？", whatPh: "一个链接、一段描述，或直接告诉我们你想要的东西。", email: "你的邮箱", country: "收货国家", countryPh: "法国、美国、澳大利亚…", send: "提交需求", sending: "发送中…", okTitle: "已收到！", okText: "我们会在 24 小时内回复报价。请查看你的收件箱（以及垃圾邮件）。", more: "补充更多细节 →", eMsg: "请告诉我们你在找什么。", eEmail: "这个邮箱看起来不对。", eCountry: "要寄到哪里？", eFail: "出了点问题。请重试，或发邮件至 kizunaproxy@gmail.com。" },
  pt: { title: "Diga-nos o que você quer do Japão", sub: "Orçamento grátis, sem compromisso. Respondemos em 24 horas.", what: "O que você procura?", whatPh: "Um link, uma descrição, ou simplesmente diga o que você quer.", email: "Seu email", country: "Enviar para", countryPh: "França, EUA, Austrália…", send: "Enviar meu pedido", sending: "Enviando…", okTitle: "Recebido!", okText: "Respondemos em 24 horas com um orçamento. Confira sua caixa de entrada (e o spam).", more: "Adicionar mais detalhes →", eMsg: "Diga-nos o que você procura.", eEmail: "Esse email parece incorreto.", eCountry: "Para onde devemos enviar?", eFail: "Algo deu errado. Tente novamente ou escreva para kizunaproxy@gmail.com." },
  id: { title: "Beri tahu kami apa yang Anda inginkan dari Jepang", sub: "Penawaran gratis, tanpa komitmen. Kami membalas dalam 24 jam.", what: "Apa yang Anda cari?", whatPh: "Tautan, deskripsi, atau cukup beri tahu kami apa yang Anda inginkan.", email: "Email Anda", country: "Kirim ke", countryPh: "Prancis, AS, Australia…", send: "Kirim permintaan", sending: "Mengirim…", okTitle: "Diterima!", okText: "Kami membalas dalam 24 jam dengan penawaran. Periksa kotak masuk (dan folder spam) Anda.", more: "Tambahkan detail →", eMsg: "Beri tahu kami apa yang Anda cari.", eEmail: "Email ini tampaknya salah.", eCountry: "Dikirim ke mana?", eFail: "Terjadi kesalahan. Coba lagi, atau kirim email ke kizunaproxy@gmail.com." },
  vi: { title: "Hãy cho chúng tôi biết bạn muốn gì từ Nhật Bản", sub: "Báo giá miễn phí, không ràng buộc. Chúng tôi trả lời trong 24 giờ.", what: "Bạn đang tìm gì?", whatPh: "Một đường dẫn, một mô tả, hoặc cứ cho chúng tôi biết bạn muốn gì.", email: "Email của bạn", country: "Giao đến", countryPh: "Pháp, Mỹ, Úc…", send: "Gửi yêu cầu", sending: "Đang gửi…", okTitle: "Đã nhận!", okText: "Chúng tôi sẽ trả lời kèm báo giá trong 24 giờ. Hãy kiểm tra hộp thư (và cả thư rác).", more: "Thêm chi tiết →", eMsg: "Hãy cho chúng tôi biết bạn đang tìm gì.", eEmail: "Email này có vẻ không đúng.", eCountry: "Chúng tôi giao đến đâu?", eFail: "Đã có lỗi. Vui lòng thử lại hoặc gửi email đến kizunaproxy@gmail.com." },
  nl: { title: "Vertel ons wat je uit Japan wilt", sub: "Gratis offerte, vrijblijvend. We antwoorden binnen 24 uur.", what: "Waar ben je naar op zoek?", whatPh: "Een link, een beschrijving, of vertel ons gewoon wat je wilt.", email: "Je e-mail", country: "Verzenden naar", countryPh: "Frankrijk, VS, Australië…", send: "Verstuur mijn aanvraag", sending: "Versturen…", okTitle: "Ontvangen!", okText: "We antwoorden binnen 24 uur met een offerte. Controleer je inbox (en je spam).", more: "Meer details toevoegen →", eMsg: "Vertel ons waar je naar zoekt.", eEmail: "Dit e-mailadres lijkt onjuist.", eCountry: "Waarheen moeten we verzenden?", eFail: "Er ging iets mis. Probeer het opnieuw of mail naar kizunaproxy@gmail.com." },
};

export default function MiniRequestForm({ lang: forced }) {
  const { lang: current } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const c = COPY[forced || current] || COPY.en;
  const [form, setForm] = useState({ message: "", email: "", country: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  function validate() {
    const e = {};
    if (!form.message.trim()) e.message = c.eMsg;
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = c.eEmail;
    if (!form.country.trim()) e.country = c.eCountry;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (status === "sending") return;
    if (form.website) { setStatus("success"); return; } // champ piège : un robot l'a rempli, on fait comme si c'était envoyé
    if (!validate()) return;
    setStatus("sending");

    const email = form.email.trim();
    const items = form.message.trim();
    const p = new URLSearchParams(window.location.search);
    const row = {
      customer_id: user?.id || null,
      name: email.split("@")[0],
      email,
      country: form.country.trim(),
      items,
      status: "new",
      // D'où vient la demande : paramètres UTM si présents, sinon la page elle-même (ex. /blog/buy-coach-bags-japan).
      utm_source: p.get("utm_source") || null,
      utm_medium: p.get("utm_medium") || null,
      utm_campaign: p.get("utm_campaign") || null,
      utm_content: p.get("utm_content") || `page:${pathname}`,
    };

    const { error } = await supabase.from("requests").insert(row);
    if (!error) {
      track("request_submitted", { country: row.country, source: "mini" });
      fetch("/api/notify-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email, country: row.country, items, budget: "", contact: "", quantity: "", purchaseType: "", deadline: "", partialOk: false, utmSource: row.utm_source, utmMedium: row.utm_medium, utmCampaign: row.utm_campaign, utmContent: row.utm_content }),
      }).catch((err) => console.error("notify-request failed:", err));
      setStatus("success");
      return;
    }

    // Base injoignable : on envoie par email (Formspree) pour ne rien perdre.
    try {
      const res = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: items, email, country: row.country, page: pathname }),
      });
      if (res.ok) { track("request_submitted", { country: row.country, source: "mini", fallback: true }); setStatus("success"); }
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mini-req req-form" data-mini-request role="status">
        <p className="mini-req-title">{c.okTitle}</p>
        <p className="mini-req-sub">{c.okText}</p>
        <a href="/request" className="btn btn-outline">{c.more}</a>
      </div>
    );
  }

  return (
    <form className="mini-req req-form" data-mini-request onSubmit={submit} noValidate>
      <p className="mini-req-title">{c.title}</p>
      <p className="mini-req-sub">{c.sub}</p>

      <div className="f-field">
        <label htmlFor="mini-what">{c.what}</label>
        <textarea id="mini-what" rows={3} placeholder={c.whatPh} value={form.message} onChange={(e) => update("message", e.target.value)} />
        {errors.message && <span className="f-err">{errors.message}</span>}
      </div>

      <div className="f-row">
        <div className="f-field">
          <label htmlFor="mini-email">{c.email}</label>
          <input id="mini-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
          {errors.email && <span className="f-err">{errors.email}</span>}
        </div>
        <div className="f-field">
          <label htmlFor="mini-country">{c.country}</label>
          <input id="mini-country" type="text" autoComplete="country-name" placeholder={c.countryPh} value={form.country} onChange={(e) => update("country", e.target.value)} />
          {errors.country && <span className="f-err">{errors.country}</span>}
        </div>
      </div>

      {/* Champ piège anti-robots : invisible, un humain ne le remplit jamais. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="mini-website">Website</label>
        <input id="mini-website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
      </div>

      {status === "error" && <p className="f-err" role="alert">{c.eFail}</p>}

      <button type="submit" className="btn btn-gold req-submit" disabled={status === "sending"}>
        {status === "sending" ? c.sending : c.send}
      </button>
    </form>
  );
}
