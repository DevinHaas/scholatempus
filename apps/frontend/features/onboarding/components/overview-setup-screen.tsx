"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useWorkTimeOverview, useHydration } from "@/lib/stores/profileData";
import { WorkTimeCategory } from "@scholatempus/shared/enums";
import { Spinner } from "../../../components/ui/spinner";

interface OverviewScreenProps {
  onCompleteAction: () => void;
  onBackAction: () => void;
  email?: string;
  mutationIsPending: boolean;
}

// Skeleton component for loading state
function OverviewScreenSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="space-y-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted px-3 py-2 rounded">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs py-2">
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      <Skeleton className="h-3 w-20" />
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right">
                      <Skeleton className="h-3 w-12 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="flex-1 h-11" />
            <Skeleton className="flex-1 h-11" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OverviewScreen({
  onCompleteAction,
  onBackAction,
  mutationIsPending,
}: OverviewScreenProps) {
  const overviewData = useWorkTimeOverview();
  const hydrated = useHydration();

  // Show skeleton while data is loading from localStorage
  if (!hydrated || !overviewData.details) {
    return <OverviewScreenSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription className="text-pretty">
            Dies ist eine Übersicht über die errechneten Soll Zustände
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Employment Level */}
          <div className="bg-primary/10 text-primary px-3 py-2 rounded font-medium text-sm">
            Tot. Beschäftigungsgrad:{" "}
            {overviewData.summary.totalEmploymentFactor.toFixed(2)}%
          </div>
          {overviewData.summary.totalEmploymentFactor > 105 && (
            <div className="bg-destructive/10 text-destructive px-3 py-2 rounded font-medium text-sm">
              Warnung: Beschäftigungsgrad zu hoch!
            </div>
          )}

          {/* Calculations Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableBody>
                <TableRow className="bg-primary/10 hover:bg-primary/10">
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[45%] truncate">
                    AZ Schulleitung
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[40%] truncate">
                    Stunden Soll:
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 text-right font-medium whitespace-nowrap w-[15%]">
                    {overviewData.details?.[
                      WorkTimeCategory.SchoolManagement
                    ].targetHours?.toFixed(0)}
                  </TableCell>
                </TableRow>

                <TableRow className="bg-muted hover:bg-muted">
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[45%] truncate">
                    AZ LP Unterrichten, beraten, begleiten:
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[40%] truncate">
                    Stunden Soll (85%):
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 text-right font-medium whitespace-nowrap w-[15%]">
                    {overviewData.details?.[
                      WorkTimeCategory.TeachingAdvisingSupporting
                    ].targetHours?.toFixed(0)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[45%] truncate">
                    AZ LP Zusammenarbeit:
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[40%] truncate">
                    Stunden Soll (12%):
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 text-right font-medium whitespace-nowrap w-[15%]">
                    {overviewData.details?.[
                      WorkTimeCategory.Collaboration
                    ].targetHours?.toFixed(0)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[45%] truncate">
                    AZ LP Weiterbildung:
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[40%] truncate">
                    Stunden Soll (3%):
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 text-right font-medium whitespace-nowrap w-[15%]">
                    {overviewData.details?.[
                      WorkTimeCategory.FurtherEducation
                    ].targetHours?.toFixed(0)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[45%] truncate">
                    Unterrichtskontrolle LP:
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 max-w-0 w-[40%] truncate">
                    Lektionen Soll:
                  </TableCell>
                  <TableCell className="text-[11px] py-1.5 text-right font-medium whitespace-nowrap w-[15%]">
                    {
                      overviewData.details?.[
                        WorkTimeCategory.TeachingSupervision
                      ].targetHours
                    }
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
              onClick={onBackAction}
            >
              Zurück
            </Button>
            <Button className="flex-1 h-11" onClick={onCompleteAction}>
              {mutationIsPending && <Spinner className="mr-2" />}
              Abschliessen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
