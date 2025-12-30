"use client";

import { useEffect, useState, useRef } from "react";
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
import { Building, GraduationCap, User } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  ClassData,
  SpecialFunctionData,
  GRADE_LEVEL_LABELS,
} from "scholatempus-backend/shared";
import { ClassDataForm } from "./ClassDataForm";
import { SpecialFunctionDataForm } from "./SpecialFunctionDataForm";
import { useCreateProfile } from "@/features/onboarding/hooks/createProfile";

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
  }, [open, isLoaded, user]);

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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie Ihre Profil- und Arbeitszeit-Einstellungen
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="setup" className="text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              Lehrperson
            </TabsTrigger>
            <TabsTrigger value="schulleitung" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              Schulleitung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Profil Informationen</CardTitle>
                <CardDescription className="text-xs">
                  Bearbeiten Sie Ihre persönlichen Daten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Lehrperson Einstellungen
                </CardTitle>
                <CardDescription className="text-xs">
                  Arbeitszeit-Berechnungsparameter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

          <TabsContent value="schulleitung" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Schulleitung Einstellungen
                </CardTitle>
                <CardDescription className="text-xs">
                  Spezialfunktion und Führungsaufgaben
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
        </Tabs>

        <div className="flex gap-3 pt-4">
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
