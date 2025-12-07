"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getNameFromEmailadress from "@/lib/helpers/getNameFromEmailadress";
import { SettingsDialog } from "./SettingsDialog";
import { useUser } from "@clerk/nextjs";
import { hash as md5Hash } from "spark-md5";
import { useWorkTimeOverview } from "@/lib/stores/profileData";
import { WorkTimeCategory } from "scholatempus-backend/shared";

interface ProfileScreenProps {
  user: { email: string } | null;
  setupData: any;
  schulleitungData: any;
}

function getGravatarUrl(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return "https://www.gravatar.com/avatar/?d=mp";
  const digest = md5Hash(normalizedEmail);
  return `https://www.gravatar.com/avatar/${digest}?d=identicon`;
}

export function ProfileScreen({
  user,
  setupData,
  schulleitungData,
}: ProfileScreenProps) {
  const overviewData = useWorkTimeOverview();
  const { user: clerkUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [currentSetupData, setCurrentSetupData] = useState(setupData);
  const [currentSchulleitungData, setCurrentSchulleitungData] =
    useState(schulleitungData);
  const [profileData, setProfileData] = useState({
    name: "Devin Hasler",
    username: "devinhasler1023",
  });

  const emailAddress = () => {
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      return clerkUser.primaryEmailAddress.emailAddress;
    }
    return user?.email ?? "";
  };

  const displayName = useMemo(() => {
    if (emailAddress) {
      return getNameFromEmailadress(emailAddress());
    }
    return profileData.name;
  }, [emailAddress, profileData.name]);

  const displayEmail = emailAddress() || profileData.username;

  const avatarImageUrl = useMemo(() => {
    if (clerkUser?.imageUrl) {
      return clerkUser.imageUrl;
    }
    if (emailAddress) {
      return getGravatarUrl(emailAddress());
    }
    return "/teacher.webp";
  }, [clerkUser?.imageUrl, emailAddress]);

  const avatarFallback = useMemo(() => {
    const source = displayName || displayEmail;
    return source ? source.charAt(0).toUpperCase() : "?";
  }, [displayName, displayEmail]);

  const handleSaveSettings = (
    newSetupData: any,
    newSchulleitungData: any,
    newProfileData: any,
  ) => {
    setCurrentSetupData(newSetupData);
    setCurrentSchulleitungData(newSchulleitungData);
    setProfileData(newProfileData);
    console.log("Settings saved:", {
      newSetupData,
      newSchulleitungData,
      newProfileData,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center mb-8">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={avatarImageUrl} alt={displayName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-foreground">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground">{displayEmail}</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Arbeitszeit Übersicht</CardTitle>
            <CardDescription className="text-pretty">
              Vergleich zwischen Soll-Zustand und Ist-Zustand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-300 hover:bg-gray-400">
                    <TableHead className="text-black font-medium text-xs h-8">
                      Kategorie
                    </TableHead>
                    <TableHead className="text-black font-medium text-xs h-8 text-right">
                      Soll
                    </TableHead>
                    <TableHead className="text-black font-medium text-xs h-8 text-right">
                      Ist
                    </TableHead>
                    <TableHead className="text-black font-medium text-xs h-8 text-right">
                      Differenz
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-yellow-300 hover:bg-yellow-400">
                    <TableCell className="text-xs py-2">Schulleitung</TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {overviewData.details?.Schulleitung.targetHours}h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {overviewData.details?.Schulleitung.actualHours}h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        overviewData.details?.Schulleitung.differenceHours! > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.details?.Schulleitung.differenceHours! > 0
                        ? "+"
                        : ""}
                      {overviewData.details?.Schulleitung.differenceHours!}h
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      Unterrichten, beraten, begleiten
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          "Unterrichten, beraten, begleiten"
                        ]?.targetHours
                      }
                      h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          "Unterrichten, beraten, begleiten"
                        ]?.actualHours
                      }
                      h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        overviewData.details?.[
                          WorkTimeCategory.TeachingAdvisingSupporting
                        ].differenceHours! > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.details?.[
                        WorkTimeCategory.TeachingAdvisingSupporting
                      ].differenceHours! > 0
                        ? "+"
                        : ""}
                      {
                        overviewData.details?.[
                          WorkTimeCategory.TeachingAdvisingSupporting
                        ].differenceHours!
                      }
                      h
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      Zusammenarbeit
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[WorkTimeCategory.Collaboration]
                          .targetHours
                      }
                      h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[WorkTimeCategory.Collaboration]
                          .actualHours
                      }
                      h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        overviewData.details?.[WorkTimeCategory.Collaboration]
                          .differenceHours! > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.details?.[WorkTimeCategory.Collaboration]
                        .differenceHours! > 0
                        ? "+"
                        : ""}
                      {
                        overviewData.details?.[WorkTimeCategory.Collaboration]
                          .differenceHours!
                      }
                      h
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      Weiterbildung
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ].targetHours
                      }
                      h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ].actualHours
                      }
                      h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ].differenceHours! > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.details?.[WorkTimeCategory.FurtherEducation]
                        .differenceHours! > 0
                        ? "+"
                        : ""}
                      {
                        overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ].differenceHours!
                      }
                      h
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-orange-200 hover:bg-orange-200">
                    <TableCell className="text-xs py-2">
                      Unterrichtskontrolle
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.targetHours
                      }
                      h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.actualHours
                      }
                      h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.differenceHours! > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.details?.[
                        WorkTimeCategory.TeachingSupervision
                      ]?.differenceHours! > 0
                        ? "+"
                        : ""}
                      {
                        overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.differenceHours!
                      }
                      h
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Zusammenfassung</h3>

              <div className="bg-purple-100 p-3 rounded border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold">
                    Arbeitszeit Lehrperson Total
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Soll:</span>
                    <span className="font-medium ml-1">
                      {overviewData.summary.totalTeacherWorkTime.targetHours}h
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ist:</span>
                    <span className="font-medium ml-1">
                      {overviewData.summary.totalTeacherWorkTime.actualHours}h
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bilanz:</span>
                    <span
                      className={`font-bold ml-1 ${
                        overviewData.summary.totalTeacherWorkTime.balanceHours >
                        0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.summary.totalTeacherWorkTime.balanceHours >
                      0
                        ? "+"
                        : ""}
                      {overviewData.summary.totalTeacherWorkTime.balanceHours}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-100 p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">
                    Az Schulleitung Bilanz
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      overviewData.summary.schoolManagementBalanceHours > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {overviewData.summary.schoolManagementBalanceHours > 0
                      ? "+"
                      : ""}
                    {overviewData.summary.schoolManagementBalanceHours}h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <SettingsDialog
          open={showSettings}
          onOpenChangeAction={setShowSettings}
          setupData={currentSetupData}
          schulleitungData={currentSchulleitungData}
          onSaveAction={handleSaveSettings}
        />
      </div>
    </div>
  );
}
