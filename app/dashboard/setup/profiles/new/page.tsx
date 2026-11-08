import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateProfileForm } from "./components/CreateProfileForm";
import { getSubscription } from "@/lib/api/subscription";
import { getProfiles } from "@/lib/api/profiles";

export default async function NewProfilePage() {
  const [subscription, profiles] = await Promise.all([
    getSubscription().catch(() => null),
    getProfiles().catch(() => null),
  ]);

  const currentProfileCount = profiles?.count || 0;
  const plan = subscription?.plan || "FREE";
  const isFirstProfile = currentProfileCount === 0;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard/setup"
            className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <h1 className="text-3xl font-bold">
            {isFirstProfile ? "Da de alta tu primer RFC" : "Crear perfil RFC"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Sube tu Constancia de Situación Fiscal para prellenar los datos, o
            completa el formulario manualmente.
          </p>
        </div>
        <CreateProfileForm
          currentProfileCount={currentProfileCount}
          plan={plan}
          subscription={subscription}
        />
      </div>
    </main>
  );
}
