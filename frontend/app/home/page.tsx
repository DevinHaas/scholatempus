"use client"

import { MainApp } from "@/features/app-shell"

export default function HomePage() {
  const testUser = { email: "test@example.com" }

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
