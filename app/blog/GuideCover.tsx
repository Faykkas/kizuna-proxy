"use client";

// Couverture photo en haut de chaque guide (choisie selon l'article dans guidePhotos.ts). Le titre de l'article remonte
// légèrement sur le bas de la photo, qui s'efface en fondu. Rien n'est affiché sur /blog ni pour un guide sans photo.

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { guidePhotoForPath } from "./guidePhotos";

export default function GuideCover() {
  const src = guidePhotoForPath(usePathname() || "");
  if (!src) return null;
  return <div className="guide-cover" aria-hidden="true" style={{ ["--gc" as string]: `url(${src})` } as CSSProperties} />;
}
