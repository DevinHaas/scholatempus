"use client";

import { OverviewScreen } from "@/features/onboarding/components/overview-setup-screen";
import { SchulleitungSetupComponent } from "@/features/onboarding/components/specialfunction-setup-screen";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useRef } from "react";
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
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";

const DEFAULT_STEP = "setup" as const;
const ONBOARDING_STEPS = ["setup", "schulleitung", "import", "overview"] as const;
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

  const directionRef = useRef<StepDirection>("next");

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

      directionRef.current = direction;
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
      <OnboardingShell currentStep={0} direction={directionRef.current}>
        <ClassDataSetupComponent
          onCompleteAction={() => navigateRelative("next")}
          email={email}
        />
      </OnboardingShell>
    );
  }

  if (currentStep === "schulleitung") {
    return (
      <OnboardingShell currentStep={1} direction={directionRef.current}>
        <SchulleitungSetupComponent
          onCompleteAction={() => navigateRelative("next")}
          onBackAction={() => navigateRelative("previous")}
          email={email}
        />
      </OnboardingShell>
    );
  }

  if (currentStep === "import") {
    return (
      <OnboardingShell currentStep={2} direction={directionRef.current}>
        <div className="flex items-center justify-center py-6">
          <ImportWidget
            onSuccess={() => navigateRelative("next")}
            onSkip={() => navigateRelative("next")}
          />
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell currentStep={3} direction={directionRef.current}>
      <OverviewScreen
        onCompleteAction={() => {
          mutate(
            { classData, specialFunctionData },
            {
              onSuccess: async () => {
                localStorage.removeItem("scholatempus:onboarding");
                await getToken({ skipCache: true });
                router.push("/home");
              },
            },
          );
        }}
        onBackAction={() => navigateRelative("previous")}
        email={email}
        mutationIsPending={isPending}
      />
    </OnboardingShell>
  );
}
