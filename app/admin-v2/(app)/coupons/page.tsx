import { requireAccess } from "../../lib/access";
import { createServerSupabase } from "../../lib/supabase-server";
import { getL } from "../../lib/lang-server";
import { loadCouponsSafe } from "../../lib/queriesCoupons";
import { formatJPY } from "../../lib/money";
import { Banner, DataError, PageHead, StaffNotice, StatCard } from "../../components/ui";
import CouponManager from "./CouponManager";

export async function generateMetadata() {
  const { t } = await getL();
  return { title: `${t("Coupons")} — ${t("Administration Kizuna")}` };
}

export default async function CouponsPage() {
  const dataP = createServerSupabase().then((sb) => loadCouponsSafe(sb));
  dataP.catch(() => {});
  const access = await requireAccess();
  const { t } = await getL();

  if (access.role === "staff") {
    return (
      <>
        <PageHead title={t("Coupons")} />
        <StaffNotice />
      </>
    );
  }

  let data;
  try {
    data = await dataP;
  } catch (e) {
    return (
      <>
        <PageHead title={t("Coupons")} />
        <DataError message={(e as Error).message} />
      </>
    );
  }

  const reds = data.coupons.flatMap((c) => c.redemptions);
  const used = reds.filter((r) => r.status === "used");
  const given = used.reduce((s, r) => s + r.discount_jpy, 0);
  const pendingCount = reds.filter((r) => r.status === "reserved").length;
  const activeCount = data.coupons.filter((c) => c.active && !(c.expires_at && Date.parse(c.expires_at) < Date.now())).length;

  return (
    <>
      <PageHead title={t("Coupons")} subtitle={t("Remises sur vos frais de service : le client saisit son code sur la page de paiement.")} />

      {!data.available ? (
        <Banner kind="warn">
          {t("Les coupons ne sont pas encore activés dans Supabase : exécutez d'abord le SQL 20261102120000_coupons.sql.")}
        </Banner>
      ) : null}

      <div className="av2-grid cols-3">
        <StatCard label={t("Coupons actifs")} value={String(activeCount)} />
        <StatCard label={t("Remises déjà accordées")} value={formatJPY(given)} sub={t("{n} coupons utilisés (c'est autant de marge en moins).", { n: used.length })} />
        <StatCard label={t("En cours")} value={String(pendingCount)} sub={t("Appliqués sur un lien pas encore payé.")} />
      </div>

      <Banner kind="info">
        <strong>{t("La règle :")}</strong>{" "}
        {t("la remise est retirée de vos frais de service (jamais des articles, de la livraison ni des taxes), et ne peut pas dépasser ces frais. Un coupon ne s'utilise qu'une fois par client (son email). Les frais PayPal de 6 % sont recalculés sur le nouveau total. Les coupons Trustpilot et Reddit sont nominatifs : créez-les après avoir vérifié l'avis.")}
      </Banner>

      {data.available ? <CouponManager coupons={data.coupons} /> : null}
    </>
  );
}
