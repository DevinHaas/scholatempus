"use client"

import { MainApp } from "@/features/app-shell"
import { useUser } from "@clerk/nextjs"

export default function HomePage() {
  const { user } = useUser()

  // Middleware has already verified profile exists, so we can render directly
  const testUser = { email: user?.emailAddresses[0]?.emailAddress ?? "test@example.com" }

  const testSetupData = {
    stufe: "Sekundarstufe I",
    anzahlLektionen: "28",
    pflichtlektionen: "26",
    uebertragSemester: "2",
  }

  const testSchulleitungData = {
    beschaeftigungsgrad: "85",
    uebertragSemester: "1",
    klassenlehrperson: true,
    wochenlektionenWegzeit: "2",
  }

  return <MainApp user={testUser} setupData={testSetupData} schulleitungData={testSchulleitungData} />
}
