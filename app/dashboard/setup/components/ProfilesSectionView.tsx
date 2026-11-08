import Link from "next/link";
import { Plus, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  canCreateProfile,
  getRemainingProfiles,
  getProfileLimitMessage,
  getProfileLimit,
  getRecommendedUpgradePlan,
} from "@/lib/utils/subscription";
import type { GetProfilesResponse } from "@/lib/types/profiles";
import type { GetSubscriptionResponse } from "@/lib/types/subscription";
import { ProfilesTable } from "./ProfilesTable";
import { ProfilesUsageMeter } from "./ProfilesUsageMeter";

export interface ProfilesSectionViewProps {
  profiles: GetProfilesResponse;
  subscription: GetSubscriptionResponse;
}

type UsageTone = "default" | "info" | "warning" | "error";

export function ProfilesSectionView({
  profiles,
  subscription,
}: ProfilesSectionViewProps) {
  const currentCount = profiles?.count || 0;
  const plan = subscription?.plan || "FREE";
  const profilesData = profiles?.data || [];
  const canCreate = canCreateProfile(currentCount, plan, subscription);
  const remaining = getRemainingProfiles(currentCount, plan, subscription);
  const limit = getProfileLimit(plan, subscription);
  const recommendedPlan = getRecommendedUpgradePlan(plan);
  const limitMessage = getProfileLimitMessage(plan, subscription);

  const usagePercentage =
    limit === Infinity ? 0 : Math.min(100, (currentCount / limit) * 100);

  const warningLevel: UsageTone | null =
    limit === Infinity
      ? null
      : usagePercentage >= 100
        ? "error"
        : usagePercentage >= 90
          ? "warning"
          : usagePercentage >= 75
            ? "info"
            : null;

  const meterTone: UsageTone = warningLevel ?? "default";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold">Perfiles RFC</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona tus perfiles fiscales (RFCs)
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <ProfilesUsageMeter
            currentCount={currentCount}
            limit={limit}
            usagePercentage={usagePercentage}
            limitMessage={limitMessage}
            tone={meterTone}
          />
          <Link href="/dashboard/setup/profiles/new" className="sm:shrink-0">
            <Button disabled={!canCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Crear Perfil
            </Button>
          </Link>
        </div>
      </div>

      {warningLevel && (
        <Alert
          className={
            warningLevel === "error"
              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
              : warningLevel === "warning"
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
          }
        >
          <AlertCircle
            className={
              warningLevel === "error"
                ? "h-4 w-4 text-red-600"
                : warningLevel === "warning"
                  ? "h-4 w-4 text-orange-600"
                  : "h-4 w-4 text-blue-600"
            }
          />
          <AlertTitle>Uso de Perfiles</AlertTitle>
          <AlertDescription className="space-y-1">
            {warningLevel === "error" && (
              <p className="text-sm font-medium">
                Has alcanzado el límite de tu plan.{" "}
                {recommendedPlan && (
                  <Link
                    href="/dashboard/setup?tab=subscription"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    Actualiza a {recommendedPlan}{" "}
                    <Sparkles className="h-4 w-4" />
                  </Link>
                )}
              </p>
            )}
            {warningLevel === "warning" && remaining !== null && remaining > 0 && (
              <p className="text-sm">
                Te quedan {remaining} perfil{remaining !== 1 ? "es" : ""}{" "}
                disponibles.
                {recommendedPlan && (
                  <Link
                    href="/dashboard/setup?tab=subscription"
                    className="text-primary ml-1 inline-flex items-center gap-1 hover:underline"
                  >
                    Considera actualizar tu plan{" "}
                    <Sparkles className="h-4 w-4" />
                  </Link>
                )}
              </p>
            )}
            {warningLevel === "info" && remaining !== null && (
              <p className="text-muted-foreground text-sm">
                Te quedan {remaining} perfiles disponibles en tu plan actual.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <ProfilesTable
        profiles={profilesData}
        canCreate={canCreate}
        remaining={remaining}
        plan={plan}
        currentCount={currentCount}
        subscriptionStatus={subscription?.status || "ACTIVE"}
        subscription={subscription}
      />
    </div>
  );
}
