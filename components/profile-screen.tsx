"use client";

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
import { SettingsDialog } from "./settings-dialog";
import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { hash as md5Hash } from "spark-md5";

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
  const { user: clerkUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [currentSetupData, setCurrentSetupData] = useState(setupData);
  const [currentSchulleitungData, setCurrentSchulleitungData] =
    useState(schulleitungData);
  const [profileData, setProfileData] = useState({
    name: "Devin Hasler",
    username: "devinhasler1023",
  });

  const emailAddress = useMemo(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      return clerkUser.primaryEmailAddress.emailAddress;
    }
    return user?.email ?? "";
  }, [clerkUser?.primaryEmailAddress?.emailAddress, user?.email]);

  const displayName = useMemo(() => {
    if (emailAddress) {
      return getNameFromEmailadress(emailAddress);
    }
    return profileData.name;
  }, [emailAddress, profileData.name]);

  const displayEmail = emailAddress || profileData.username;

  const avatarImageUrl = useMemo(() => {
    if (clerkUser?.imageUrl) {
      return clerkUser.imageUrl;
    }
    if (emailAddress) {
      return getGravatarUrl(emailAddress);
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

  const calculateShouldState = () => {
    const beschaeftigungsgrad = Number.parseFloat(
      currentSchulleitungData?.beschaeftigungsgrad || "100",
    );
    const anzahlLektionen = Number.parseInt(
      currentSetupData?.anzahlLektionen || "24",
    );

    const baseHours = 1940;
    const adjustedHours = (baseHours * beschaeftigungsgrad) / 100;

    const unterrichtenHours = Math.round(adjustedHours * 0.85);
    const zusammenarbeitHours = Math.round(adjustedHours * 0.12);
    const weiterbildungHours = Math.round(adjustedHours * 0.03);
    const schulleitungHours = Math.round(adjustedHours * 0.15);
    const unterrichtskontrolleLektionen = Math.round(anzahlLektionen * 22.8);

    return {
      unterrichtenHours,
      zusammenarbeitHours,
      weiterbildungHours,
      schulleitungHours,
      unterrichtskontrolleLektionen,
    };
  };

  const getCurrentState = () => {
    return {
      unterrichtenHours: 1200, // Example: currently worked hours
      zusammenarbeitHours: 150,
      weiterbildungHours: 25,
      schulleitungHours: 405,
      unterrichtskontrolleLektionen: 420,
    };
  };

  const shouldState = calculateShouldState();
  const currentState = getCurrentState();

  const differences = {
    schulleitungHours:
      shouldState.schulleitungHours - currentState.schulleitungHours,
    unterrichtenHours:
      shouldState.unterrichtenHours - currentState.unterrichtenHours,
    zusammenarbeitHours:
      shouldState.zusammenarbeitHours - currentState.zusammenarbeitHours,
    weiterbildungHours:
      shouldState.weiterbildungHours - currentState.weiterbildungHours,
    unterrichtskontrolleLektionen:
      shouldState.unterrichtskontrolleLektionen -
      currentState.unterrichtskontrolleLektionen,
  };

  const totalTeacherSoll =
    shouldState.unterrichtenHours +
    shouldState.zusammenarbeitHours +
    shouldState.weiterbildungHours;
  const totalTeacherIst =
    currentState.unterrichtenHours +
    currentState.zusammenarbeitHours +
    currentState.weiterbildungHours;
  const teacherBilanz = totalTeacherSoll - totalTeacherIst;

  // Example school management balance (this would come from actual data)
  const schulleitungBilanz = -15; // Example: 15 hours over target

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
                      {shouldState.schulleitungHours}h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {currentState.schulleitungHours}h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        schulleitungBilanz > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {differences.schulleitungHours > 0 ? "+" : ""}
                      {differences.schulleitungHours}h
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      Unterrichten, beraten, begleiten
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {shouldState.unterrichtenHours}h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {currentState.unterrichtenHours}h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        differences.unterrichtenHours > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {differences.unterrichtenHours > 0 ? "+" : ""}
                      {differences.unterrichtenHours}h
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      Zusammenarbeit
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {shouldState.zusammenarbeitHours}h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {currentState.zusammenarbeitHours}h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        differences.zusammenarbeitHours > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {differences.zusammenarbeitHours > 0 ? "+" : ""}
                      {differences.zusammenarbeitHours}h
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      Weiterbildung
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {shouldState.weiterbildungHours}h
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {currentState.weiterbildungHours}h
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        differences.weiterbildungHours > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {differences.weiterbildungHours > 0 ? "+" : ""}
                      {differences.weiterbildungHours}h
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-orange-200 hover:bg-orange-200">
                    <TableCell className="text-xs py-2">
                      Unterrichtskontrolle
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {shouldState.unterrichtskontrolleLektionen}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {currentState.unterrichtskontrolleLektionen}
                    </TableCell>
                    <TableCell
                      className={`text-xs py-2 text-right font-medium ${
                        differences.unterrichtskontrolleLektionen > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {differences.unterrichtskontrolleLektionen > 0 ? "+" : ""}
                      {differences.unterrichtskontrolleLektionen}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Zusammenfassung</h3>

              {/* Arbeitszeit Lehrperson Total */}
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
                      {totalTeacherSoll}h
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ist:</span>
                    <span className="font-medium ml-1">{totalTeacherIst}h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bilanz:</span>
                    <span
                      className={`font-bold ml-1 ${teacherBilanz > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {teacherBilanz > 0 ? "+" : ""}
                      {teacherBilanz}h
                    </span>
                  </div>
                </div>
              </div>
              {/* Az Schulleitung Bilanz */}
              <div className="bg-yellow-100 p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">
                    Az Schulleitung Bilanz
                  </span>
                  <span
                    className={`text-xs font-bold ${schulleitungBilanz > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {schulleitungBilanz > 0 ? "+" : ""}
                    {schulleitungBilanz}h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          setupData={currentSetupData}
          schulleitungData={currentSchulleitungData}
          onSave={handleSaveSettings}
        />
      </div>
    </div>
  );
}
