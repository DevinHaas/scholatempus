"use client";

import { ClassDataSetupComponent } from "@/components/classdata-setup-screen";
import { OverviewScreen } from "@/components/overview-setup-screen";
import { SchulleitungSetupComponent } from "@/components/specialfunction-setup-screen";
import { useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";

const DEFAULT_STEP = "setup" as const;
const ONBOARDING_STEPS = ["setup", "schulleitung", "overview"] as const;
type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

type StepDirection = "next" | "previous";

function isOnboardingStep(step: string | null): step is OnboardingStep {
  return ONBOARDING_STEPS.includes(step as OnboardingStep);
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();

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

      if (targetIndex < 0 || targetIndex >= ONBOARDING_STEPS.length) {
        return;
      }

      navigateToStep(ONBOARDING_STEPS[targetIndex]);
    },
    [currentStep, navigateToStep],
  );

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

  return (
    <OverviewScreen
      onCompleteAction={() => {
        toast("Einrichtung abgeschlossen 😍", {
          description: "Du kannst jetzt deine Zeiterfassung einsehen",
        });
        localStorage.removeItem("scholatempus:onboarding");
        router.push("/home");
      }}
      onBackAction={() => navigateRelative("previous")}
      email={email}
    />
  );
}
