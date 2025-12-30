"use client";

import { Suspense } from "react";
import { ProfileScreen } from "@/features/profile";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ProfileScreenSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="text-center mb-8">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted px-3 py-2 rounded">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user } = useUser();

  // Middleware has already verified profile exists, so we can render directly
  const testUser = {
    email: user?.emailAddresses[0]?.emailAddress ?? "test@example.com",
  };

  const testSetupData = {
    stufe: "Sekundarstufe I",
    anzahlLektionen: "28",
    pflichtlektionen: "26",
    uebertragSemester: "2",
  };

  const testSchulleitungData = {
    beschaeftigungsgrad: "85",
    uebertragSemester: "1",
    klassenlehrperson: true,
    wochenlektionenWegzeit: "2",
  };

  return (
    <ProfileScreen
      user={testUser}
      setupData={testSetupData}
      schulleitungData={testSchulleitungData}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileScreenSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

