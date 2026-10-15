// Affiché immédiatement pendant le chargement d'une page de l'admin : la navigation répond tout de suite
// (au lieu de rester figée jusqu'à la fin des requêtes), et la barre latérale reste en place.

export default function Loading() {
  return (
    <div className="av2-skel-page" role="status" aria-busy="true" aria-live="polite">
      <div className="av2-skel" style={{ height: 34, width: "34%" }} />
      <div className="av2-skel" style={{ height: 16, width: "56%" }} />
      <div className="av2-skel-row">
        <div className="av2-skel" style={{ height: 92 }} />
        <div className="av2-skel" style={{ height: 92 }} />
        <div className="av2-skel" style={{ height: 92 }} />
      </div>
      <div className="av2-skel" style={{ height: 300 }} />
    </div>
  );
}
