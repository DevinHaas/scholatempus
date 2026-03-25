"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Building,
  ChevronRight,
  GraduationCap,
  LogOut,
  Upload,
  User,
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { GRADE_LEVEL_LABELS } from "@scholatempus/shared/enums";
import type {
  ClassData,
  SpecialFunctionData,
} from "@scholatempus/shared/schemas";
import { ClassDataForm } from "./ClassDataForm";
import { SpecialFunctionDataForm } from "./SpecialFunctionDataForm";
import { useCreateProfile } from "@/features/onboarding/hooks/createProfile";
import { ImportWidget } from "@/features/import/components/ImportWidget";

type ActiveView = "list" | "profile" | "setup" | "schulleitung" | "import";

interface SettingsDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  setupData: ClassData | undefined;
  schulleitungData: SpecialFunctionData | undefined;
  onSaveAction: (
    setupData: ClassData,
    schulleitungData: SpecialFunctionData,
    profileData: any,
  ) => void;
}

export function SettingsDialog({
  open,
  onOpenChangeAction,
  setupData,
  schulleitungData,
  onSaveAction,
}: SettingsDialogProps) {
  const { isLoaded, user } = useUser();
  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useCreateProfile();
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
  });

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [specialFunctionData, setSpecialFunctionData] =
    useState<SpecialFunctionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveView("list");
      if (isLoaded && user) {
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || "";
        setProfileData({
          name: fullName || firstName || "",
          username: user.username || "",
        });
      }
    }
    if (setupData) setClassData(setupData);
    if (schulleitungData) setSpecialFunctionData(schulleitungData);
  }, [open, isLoaded, user, setupData, schulleitungData]);

  const handleClassDataChange = (data: ClassData) => {
    setClassData(data);
  };

  const handleSpecialFunctionDataChange = (data: SpecialFunctionData) => {
    setSpecialFunctionData(data);
  };

  const handleSave = async () => {
    if (!isLoaded || !user) return;
    if (!classData || !specialFunctionData) {
      console.error("Form data is incomplete");
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = profileData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await user.update({
        firstName: firstName,
        lastName: lastName,
      });

      updateProfile(
        {
          classData: classData,
          specialFunctionData: specialFunctionData,
        },
        {
          onSuccess: () => {
            onSaveAction(classData, specialFunctionData, profileData);
            onOpenChangeAction(false);
          },
          onError: (error) => {
            console.error("Error updating profile:", error);
          },
        },
      );
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      title: "Konto",
      subtitle: "Verwalten Sie Ihre persönlichen Daten",
      items: [
        {
          id: "profile" as ActiveView,
          label: "Profil Informationen",
          icon: <User className="w-5 h-5 text-muted-foreground" />,
        },
      ],
    },
    {
      title: "Nutzerdaten",
      subtitle: "Konfigurieren Sie Ihre Nutzerdaten",
      items: [
        {
          id: "setup" as ActiveView,
          label: "Lehrperson",
          icon: <GraduationCap className="w-5 h-5 text-muted-foreground" />,
        },
        {
          id: "schulleitung" as ActiveView,
          label: "Schulleitung",
          icon: <Building className="w-5 h-5 text-muted-foreground" />,
        },
        {
          id: "import" as ActiveView,
          label: "Import",
          icon: <Upload className="w-5 h-5 text-muted-foreground" />,
        },
      ],
    },
  ];

  const viewTitles: Record<ActiveView, string> = {
    list: "Einstellungen",
    profile: "Profil Informationen",
    setup: "Lehrperson",
    schulleitung: "Schulleitung",
    import: "Import",
  };

  const showFooter = activeView !== "list" && activeView !== "import";

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-0">
          <div className="flex items-center gap-2">
            {activeView !== "list" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 -ml-2"
                onClick={() => setActiveView("list")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
            )}
            <DialogTitle>{viewTitles[activeView]}</DialogTitle>
          </div>
        </DialogHeader>

        {activeView === "list" && (
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="text-base font-bold mb-0.5">{section.title}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {section.subtitle}
                </p>
                <div className="rounded-xl border bg-muted/30 overflow-hidden divide-y">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                      onClick={() => setActiveView(item.id)}
                    >
                      {item.icon}
                      <span className="flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Sign out */}
            <SignOutButton>
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Ausloggen
              </Button>
            </SignOutButton>
          </div>
        )}

        {activeView === "profile" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Name
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-9"
                placeholder="Vor- und Nachname"
                disabled={!isLoaded || isLoading}
              />
            </div>
          </div>
        )}

        {activeView === "setup" && (
          <ClassDataForm
            defaultValues={
              setupData
                ? {
                    grade: GRADE_LEVEL_LABELS[setupData.grade],
                    givenLectures: setupData.givenLectures,
                    mandatoryLectures: setupData.mandatoryLectures,
                    carryOverLectures: setupData.carryOverLectures,
                  }
                : undefined
            }
            onSubmit={handleClassDataChange}
            onValuesChange={handleClassDataChange}
            isLoading={isLoading || isUpdatingProfile}
          />
        )}

        {activeView === "schulleitung" && (
          <SpecialFunctionDataForm
            defaultValues={
              schulleitungData
                ? {
                    headshipEmploymentFactor:
                      schulleitungData.headshipEmploymentFactor,
                    carryOverLessons: schulleitungData.carryOverLessons,
                    classTeacher: schulleitungData.classTeacher,
                    weeklyLessonsForTransportation:
                      schulleitungData.weeklyLessonsForTransportation,
                  }
                : undefined
            }
            onSubmit={handleSpecialFunctionDataChange}
            onValuesChange={handleSpecialFunctionDataChange}
            isLoading={isLoading || isUpdatingProfile}
          />
        )}

        {activeView === "import" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Importieren Sie Ihre bisherigen Arbeitseinträge aus der kantonalen Arbeitszeiterfassung (Excel oder CSV).
            </p>
            <ImportWidget compact />
          </div>
        )}

        {showFooter && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setActiveView("list")}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isLoading || isUpdatingProfile}
            >
              {isLoading || isUpdatingProfile
                ? "Wird gespeichert..."
                : "Speichern"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
