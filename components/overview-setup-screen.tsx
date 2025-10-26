"use client";

import { Button } from "@/components/ui/button";
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
import { useWorkTimeOverview } from "@/lib/stores/profileData";
import { ArrowLeft } from "lucide-react";

interface OverviewScreenProps {
  onComplete: () => void;
  onBack: () => void;
  email: string;
}

export function OverviewScreen({
  onComplete,
  onBack,
  email,
}: OverviewScreenProps) {
  const overviewData = useWorkTimeOverview();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Einrichtung
            </h1>
            <p className="text-sm text-muted-foreground">Willkommen, {email}</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Overview</CardTitle>
            <CardDescription className="text-pretty">
              Dies ist eine Übersicht über die errechneten Soll Zustände
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total Employment Level */}
            <div className="bg-yellow-400 text-black px-3 py-2 rounded font-medium text-sm">
              Tot. Beschäftigungsgrad: {calculations.totalBeschaeftigungsgrad}%
            </div>

            {/* Calculations Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                    <TableHead className="text-black font-medium text-xs h-8">
                      AZ Schulleitung
                    </TableHead>
                    <TableHead className="text-black font-medium text-xs h-8"></TableHead>
                    <TableHead className="text-black font-medium text-xs h-8 text-right">
                      Std
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      AZ LP Unterrichten, beraten, begleiten:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll (85%):
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {calculations.unterrichtenHours}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      AZ LP Zusammenarbeit:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll (12%):
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {calculations.zusammenarbeitHours}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      AZ LP Weiterbildung:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll (3%):
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {calculations.weiterbildungHours}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-orange-200 hover:bg-orange-200">
                    <TableCell className="text-xs py-2">
                      Unterrichtskontrolle LP:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Lektionen Soll:
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {calculations.unterrichtskontrolleLektionen}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 bg-transparent"
                onClick={onBack}
              >
                Back
              </Button>
              <Button className="flex-1 h-11" onClick={onComplete}>
                Finish
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Diese Berechnungen basieren auf den eingegebenen Daten und können in
          der Anwendung angepasst werden.
        </div>
      </div>
    </div>
  );
}
