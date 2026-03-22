import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Buy from Mercari Japan Without Living in Japan | Kizuna Proxy",
  description: "A complete guide to buying from Mercari Japan in 2026 — what you can find, how bidding works, and how a proxy service like Kizuna Proxy makes it simple for international buyers.",
  openGraph: {
    title: "How to Buy from Mercari Japan Without Living in Japan",
    description: "Complete guide to Mercari Japan for international buyers in 2026.",
    url: "https://kizunaproxy.com/blog/how-to-buy-from-mercari-japan",
  },
};

export default function BlogMercari() {
  return (
    <main className="blog-page">
      <div className="blog-wrap">
        <div className="blog-eyebrow">Proxy Guide · March 2026</div>
        <h1>How to Buy from Mercari Japan<br /><em>Without Living in Japan</em></h1>
        <p className="blog-lead">Mercari Japan is one of the best places in the world to find rare items — vintage clothing, collectibles, electronics, limited sneakers, and more. The problem? It's almost impossible to use as a foreigner. Here's everything you need to know in 2026.</p>

        <hr className="blog-hr" />

        <h2>What is Mercari Japan?</h2>
        <p>Mercari Japan (<span lang="ja">メルカリ</span>) is Japan's largest consumer-to-consumer marketplace, launched in 2013. Think of it as a combination of eBay and Depop, but specifically designed for the Japanese market. As of 2026, it hosts over 100 million listings at any given time, covering everything from rare sneakers to vintage manga, second-hand electronics, and Japan-exclusive collectibles.</p>
        <p>What makes it unique is the culture around it — Japanese sellers tend to be extremely precise about item conditions, packaging, and photos. You'll often find items in near-perfect condition that were listed once and never bought.</p>

        <h2>Why International Buyers Can't Use It Directly</h2>
        <p>Mercari Japan has several barriers for international shoppers. First, the platform requires a Japanese phone number to register. Second, payment is restricted to Japanese credit cards, convenience store payment, or carrier billing. Third — and most importantly — sellers are not required to ship internationally, and the vast majority choose not to.</p>
        <p>This is where a proxy service like Kizuna Proxy comes in. We have a Japanese account, a Japanese address, and speak the language fluently. We buy the item as a local buyer, receive it in Tokyo, and forward it to you.</p>

        <h2>What Can You Find on Mercari Japan?</h2>
        <ul className="blog-list">
          <li><strong>Pokémon cards</strong> — including Japanese-exclusive sets, vintage Base Set cards, and tournament promos never released outside Japan</li>
          <li><strong>Vintage streetwear</strong> — Japanese archive pieces from brands like NEIGHBORHOOD, Wtaps, and early Supreme Japan collabs</li>
          <li><strong>Retro games and consoles</strong> — Famicom cartridges, PC-Engine games, rare PlayStation Japan releases</li>
          <li><strong>Anime merchandise</strong> — official goods from events, Comiket exclusives, doujinshi, and limited-run figures</li>
          <li><strong>Japanese stationery</strong> — brands like Pilot, Sailor, and Platinum that are significantly cheaper in Japan</li>
          <li><strong>Sneakers</strong> — Nike Japan exclusives, New Balance JP colorways, and Jordan retros released only in Japan</li>
        </ul>

        <h2>How the Process Works with Kizuna Proxy</h2>
        <p>The process is simple. You send us the Mercari link (or describe what you're looking for), we check availability and confirm the price with you, you pay us the item price plus our ¥1,500 service fee, and we purchase it immediately. Once the item arrives at our Tokyo address, we photograph it, calculate shipping costs, and send it to you wherever you are in the world.</p>
        <p>The entire process — from request to purchase confirmation — typically happens within the same day for in-stock items.</p>

        <h2>Tips for Finding Good Deals</h2>
        <p>Search in Japanese whenever possible — using hiragana or katakana for brand names often surfaces listings that English-language searches miss entirely. For example, searching <span lang="ja">ナイキ</span> (Nike in Japanese) will show listings that don't appear when searching "Nike".</p>
        <p>Also look for listings with the condition tag <span lang="ja">未使用</span> (unused/brand new) or <span lang="ja">美品</span> (beautiful condition). These are often heavily discounted compared to retail because the seller simply needs to declutter.</p>

        <div className="blog-cta">
          <p>Ready to buy something from Mercari Japan?</p>
          <a href="/#request-wrap" className="btn btn-red">Request an item →</a>
        </div>
      </div>
    </main>
  );
}
