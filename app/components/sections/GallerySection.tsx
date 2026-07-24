// @ts-nocheck
"use client";

import Carousel from "../Carousel";
import { SLIDES } from "../data";

export default function GallerySection({ t, gallery = [] }: { t: any; gallery?: any[] }) {
  return (
      <section id="photos" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.gallery?.label}</p>
            <h2>{t.gallery?.title} <em>{t.gallery?.titleEm}</em></h2>
            <p className="desc">{t.gallery?.desc}</p>
          </div>
          {/* Use Supabase gallery if available, else fallback to static SLIDES */}
          <Carousel slides={gallery.length > 0 ? gallery.map(g => ({ src: g.image_url, alt: g.title, title: g.title, sub: g.subtitle || "" })) : SLIDES} />
        </div>
      </section>
  );
}
