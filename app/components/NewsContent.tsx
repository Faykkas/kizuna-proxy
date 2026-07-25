// @ts-nocheck
// app/components/NewsContent.tsx
//
// News content is written in the admin as plain text with blank lines
// between paragraphs. Rendered as a single <p>, all of that structure
// collapses into one wall of text — this turns it back into real
// paragraphs (and keeps single line breaks, e.g. for a short list).

export default function NewsContent({ text, className, style }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return paragraphs.map((p, i) => (
    <p key={i} className={className} style={style}>
      {p.split("\n").map((line, j, arr) => (
        <span key={j}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
}
