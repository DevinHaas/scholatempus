"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, GraduationCap, Upload, User } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { GRADE_LEVEL_LABELS } from "@scholatempus/shared/enums";
import type { ClassData, SpecialFunctionData } from "@scholatempus/shared/schemas";
import { ClassDataForm } from "./ClassDataForm";
import { SpecialFunctionDataForm } from "./SpecialFunctionDataForm";
import { useCreateProfile } from "@/features/onboarding/hooks/createProfile";
import { ImportWidget } from "@/features/import/components/ImportWidget";

interface SettingsDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  setupData: ClassData | undefined;
  schulleitungData: SpecialFunctionData | undefined;
  onSaveAction: (setupData: ClassData, schulleitungData: SpecialFunctionData, profileData: any) => void;
}

export function SettingsDialog({
  open,
  onOpenChangeAction,
  setupData,
  schulleitungData,
  onSaveAction,
}: SettingsDialogProps) {
  const { isLoaded, user } = useUser();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useCreateProfile();
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
  });

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [specialFunctionData, setSpecialFunctionData] = useState<SpecialFunctionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (open && isLoaded && user) {
      // Initialize profile data from Clerk user
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || "";
      setProfileData({
        name: fullName || firstName || "",
        username: user.username || "",
      });
    }
    // Seed form data from props so Save works without any interaction
    if (setupData) setClassData(setupData);
    if (schulleitungData) setSpecialFunctionData(schulleitungData);
  }, [open, isLoaded, user, setupData, schulleitungData]);

  const handleClassDataSubmit = async (data: ClassData) => {
    setClassData(data);
  };

  const handleClassDataChange = (data: ClassData) => {
    setClassData(data);
  };

  const handleSpecialFunctionDataSubmit = async (data: SpecialFunctionData) => {
    setSpecialFunctionData(data);
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
      // Update Clerk user data
      const nameParts = profileData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await user.update({
        firstName: firstName,
        lastName: lastName,
      });

      // Update profile via API
      updateProfile(
        {
          classData: classData,
          specialFunctionData: specialFunctionData,
        },
        {
          onSuccess: () => {
            // Call the parent save action with transformed data
            onSaveAction(
              classData,
              specialFunctionData,
              profileData
            );
            onOpenChangeAction(false);
          },
          onError: (error) => {
            console.error("Error updating profile:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-0">
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription className="text-xs">
            Bearbeiten Sie Ihre Profil- und Arbeitszeit-Einstellungen
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="text-[10px] sm:text-xs px-1">
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="setup" className="text-[10px] sm:text-xs px-1">
              <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />
              Lehrperson
            </TabsTrigger>
            <TabsTrigger value="schulleitung" className="text-[10px] sm:text-xs px-1">
              <Building className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />
              Schulleitung
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-2 sm:space-y-4 mt-2">
            <Card>
              <CardHeader className="pb-1 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-sm">Profil Informationen</CardTitle>
                <CardDescription className="text-xs">
                  Bearbeiten Sie Ihre persönlichen Daten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pb-3 sm:pb-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(event) =>
                      setProfileData((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="h-9"
                    placeholder="Vor- und Nachname"
                    disabled={!isLoaded || isLoading}
                  />
                </div>
                <SignOutButton
                  children={
                    <Button className="w-full" variant="outline">
                      Ausloggen
                    </Button>
                  }
                ></SignOutButton>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-2 sm:space-y-4 mt-2">
            <Card>
              <CardHeader className="pb-1 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-sm">
                  Lehrperson Einstellungen
                </CardTitle>
                <CardDescription className="text-xs">
                  Arbeitszeit-Berechnungsparameter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pb-3 sm:pb-6">
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
                  onSubmit={handleClassDataSubmit}
                  onValuesChange={handleClassDataChange}
                  isLoading={isLoading || isUpdatingProfile}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schulleitung" className="space-y-2 sm:space-y-4 mt-2">
            <Card>
              <CardHeader className="pb-1 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-sm">
                  Schulleitung Einstellungen
                </CardTitle>
                <CardDescription className="text-xs">
                  Spezialfunktion und Führungsaufgaben
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pb-3 sm:pb-6">
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
                  onSubmit={handleSpecialFunctionDataSubmit}
                  onValuesChange={handleSpecialFunctionDataChange}
                  isLoading={isLoading || isUpdatingProfile}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="import" className="space-y-4">
            <ImportWidget compact />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-2 sm:pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChangeAction(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isLoading || isUpdatingProfile}
          >
            {isLoading || isUpdatingProfile ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
