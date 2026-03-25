"use client";

import { OverviewScreen } from "@/features/onboarding/components/overview-setup-screen";
import { SchulleitungSetupComponent } from "@/features/onboarding/components/specialfunction-setup-screen";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import { useCreateProfile } from "@/features/onboarding/hooks/createProfile";
import { useClassData, useSpecialFunctionData } from "@/lib/stores/profileData";
import { ClassDataSetupSkeleton } from "@/features/onboarding/components/classdata-skeleton";
import { ClassDataSetupComponent } from "@/features/onboarding/components/classdata-setup-screen";
import { ImportWidget } from "@/features/import/components/ImportWidget";

const DEFAULT_STEP = "setup" as const;
const ONBOARDING_STEPS = ["setup", "schulleitung", "overview", "import"] as const;
type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

type StepDirection = "next" | "previous";

function createStepUrl(
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  nextStep: OnboardingStep,
) {
  const params = new URLSearchParams(searchParams);
  params.set("step", nextStep);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function Onboarding() {
  const { isPending, mutate } = useCreateProfile();
  const classData = useClassData();
  const specialFunctionData = useSpecialFunctionData();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const email = user?.emailAddresses[0]?.emailAddress ?? "nutzer@email.ch";

  const stepParam = searchParams.get("step");

  const currentStep: OnboardingStep = stepParam
    ? (stepParam as OnboardingStep)
    : DEFAULT_STEP;

  const navigateToStep = useCallback(
    (step: OnboardingStep, options?: { replace?: boolean }) => {
      const url = createStepUrl(pathname, searchParams, step);
      if (options?.replace) {
        router.replace(url, { scroll: false });
        return;
      }
      router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const navigateRelative = useCallback(
    (direction: StepDirection) => {
      const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
      const targetIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;

      if (
        targetIndex === undefined ||
        targetIndex < 0 ||
        targetIndex >= ONBOARDING_STEPS.length
      ) {
        return;
      }

      navigateToStep(ONBOARDING_STEPS[targetIndex] as OnboardingStep);
    },
    [currentStep, navigateToStep],
  );

  // Middleware handles redirect if profile exists, so we only show skeleton while Clerk loads
  if (!isLoaded) {
    return <ClassDataSetupSkeleton />;
  }

  if (currentStep === "setup") {
    return (
      <ClassDataSetupComponent
        onCompleteAction={() => navigateRelative("next")}
        email={email}
      />
    );
  }

  if (currentStep === "schulleitung") {
    return (
      <SchulleitungSetupComponent
        onCompleteAction={() => navigateRelative("next")}
        onBackAction={() => navigateRelative("previous")}
        email={email}
      />
    );
  }

  if (currentStep === "import") {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <ImportWidget
          onSuccess={() => router.push("/home")}
          onSkip={() => router.push("/home")}
        />
      </div>
    );
  }

  return (
    <OverviewScreen
      onCompleteAction={() => {
        mutate(
          { classData, specialFunctionData },
          {
            onSuccess: async () => {
              localStorage.removeItem("scholatempus:onboarding");
              await getToken({ skipCache: true });
              navigateRelative("next");
            },
          },
        );
      }}
      onBackAction={() => navigateRelative("previous")}
      email={email}
      mutationIsPending={isPending}
    />
  );
}
