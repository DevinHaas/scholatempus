"use client";
import { OverviewScreen } from "@/components/overview-setup-screen";
import { SchulleitungSetupScreen } from "@/components/specialfunction-setup-screen";
import { SetupScreen } from "@/components/classdata-setup-screen";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState<
    "setup" | "schulleitung" | "overview"
  >("setup");

  const user = useUser();

  const email =
    user.user?.emailAddresses[0].emailAddress.toString() ?? "nutzer@email.ch";

  const handleSetupNext = () => {
    setCurrentScreen("schulleitung");
  };

  function handleSetupComplete(): void {
    toast("Einrichtung abgeschlossen 😍", {
      description: "Du kannst jetzt deine Zeiterfassung einsehen",
    });
  }

  const handleSchulleitungBack = () => {
    setCurrentScreen("setup");
  };

  const handleSchulleitungNext = () => {
    setCurrentScreen("overview");
  };

  const handleOverviewBack = () => {
    setCurrentScreen("schulleitung");
  };

  if (currentScreen === "setup") {
    return <SetupScreen onComplete={handleSetupNext} email={email} />;
  }

  if (currentScreen === "schulleitung") {
    return (
      <SchulleitungSetupScreen
        onComplete={handleSchulleitungNext}
        onBack={handleSchulleitungBack}
        email={email}
      />
    );
  }

  if (currentScreen === "overview") {
    return (
      <OverviewScreen
        onComplete={handleSetupComplete}
        onBack={handleOverviewBack}
        email={email}
      />
    );
  }

  return null;
}
