import Link from "next/link";
import { requireAccess } from "../lib/access";
import { NavLinks, SignOutButton, ThemeToggle } from "../components/Shell";
import { Banner } from "../components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Les pages revérifient l'accès elles-mêmes (un layout ne se rejoue pas à
  // chaque navigation côté client) ; ici on s'en sert pour l'affichage.
  const access = await requireAccess();

  return (
    <div className="av2-shell">
      <aside className="av2-side">
        <div className="av2-brand">
          <div className="av2-brand-mark" aria-hidden="true">絆</div>
          <div>
            <div className="av2-brand-name">Kizuna Proxy</div>
            <div className="av2-brand-sub">Administration v2</div>
          </div>
        </div>
        <NavLinks />
        <div className="av2-side-foot">
          <div className="av2-user">
            <strong>{access.displayName}</strong>
            <span>{access.role === "admin" ? "Administrateur" : "Staff"}{access.mfaVerified ? " · MFA ✓" : " · MFA désactivé (dev)"}</span>
          </div>
          <div className="av2-side-actions">
            <Link href="/admin" prefetch={false}>Ancienne admin</Link>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="av2-main">
        <div className="av2-content">
          {access.rosterMissing ? (
            <Banner kind="warn">
              <strong>Mode développement :</strong> la liste des comptes (<code>admin_users</code>) n'est pas consultée — la
              migration de la phase 0 n'est pas appliquée sur cette base ou le MFA est désactivé en local. En production, cet état
              refuse l'accès.
            </Banner>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
