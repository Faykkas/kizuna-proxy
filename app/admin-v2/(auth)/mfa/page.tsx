import { requireSession } from "../../lib/access";
import MfaForm from "./MfaForm";

export const metadata = { title: "Vérification en deux étapes — Administration Kizuna" };

export default async function MfaPage() {
  const session = await requireSession();
  return <MfaForm email={session.email} />;
}
