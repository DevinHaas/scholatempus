"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, GraduationCap, Building } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setupData: any
  schulleitungData: any
  onSave: (setupData: any, schulleitungData: any, profileData: any) => void
}

export function SettingsDialog({ open, onOpenChange, setupData, schulleitungData, onSave }: SettingsDialogProps) {
  const [profileData, setProfileData] = useState({
    name: "Devin Hasler",
    username: "devinhasler1023",
  })

  const [currentSetupData, setCurrentSetupData] = useState({
    stufe: "",
    anzahlLektionen: "",
    pflichtlektionen: "",
    uebertragSemester: "",
  })

  const [currentSchulleitungData, setCurrentSchulleitungData] = useState({
    beschaeftigungsgrad: "",
    uebertragSemester: "",
    klassenlehrperson: false,
    wochenlektionenWegzeit: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  // Initialize data when dialog opens
  useEffect(() => {
    if (open && setupData) {
      setCurrentSetupData({
        stufe: setupData.stufe || "",
        anzahlLektionen: setupData.anzahlLektionen || "",
        pflichtlektionen: setupData.pflichtlektionen || "",
        uebertragSemester: setupData.uebertragSemester || "",
      })
    }
    if (open && schulleitungData) {
      setCurrentSchulleitungData({
        beschaeftigungsgrad: schulleitungData.beschaeftigungsgrad || "",
        uebertragSemester: schulleitungData.uebertragSemester || "",
        klassenlehrperson: schulleitungData.klassenlehrperson || false,
        wochenlektionenWegzeit: schulleitungData.wochenlektionenWegzeit || "",
      })
    }
  }, [open, setupData, schulleitungData])

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate save process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSave(currentSetupData, currentSchulleitungData, profileData)
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription>Bearbeiten Sie Ihre Profil- und Arbeitszeit-Einstellungen</DialogDescription>
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
                <CardDescription className="text-xs">Bearbeiten Sie Ihre persönlichen Daten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm">
                    Benutzername
                  </Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                    className="h-9"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Lehrperson Einstellungen</CardTitle>
                <CardDescription className="text-xs">Arbeitszeit-Berechnungsparameter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stufe" className="text-sm">
                    Stufe
                  </Label>
                  <Select
                    value={currentSetupData.stufe}
                    onValueChange={(value) => setCurrentSetupData((prev) => ({ ...prev, stufe: value }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kindergarten">Kindergarten</SelectItem>
                      <SelectItem value="unterstufe">Unterstufe (1.-3. Klasse)</SelectItem>
                      <SelectItem value="mittelstufe">Mittelstufe (4.-6. Klasse)</SelectItem>
                      <SelectItem value="oberstufe">Oberstufe (7.-9. Klasse)</SelectItem>
                      <SelectItem value="gymnasium">Gymnasium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anzahlLektionen" className="text-sm">
                    Anzahl erteilte Lektionen
                  </Label>
                  <Input
                    id="anzahlLektionen"
                    type="number"
                    value={currentSetupData.anzahlLektionen}
                    onChange={(e) => setCurrentSetupData((prev) => ({ ...prev, anzahlLektionen: e.target.value }))}
                    className="h-9"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pflichtlektionen" className="text-sm">
                    Pflichtlektionen
                  </Label>
                  <Select
                    value={currentSetupData.pflichtlektionen}
                    onValueChange={(value) => setCurrentSetupData((prev) => ({ ...prev, pflichtlektionen: value }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 Lektionen</SelectItem>
                      <SelectItem value="22">22 Lektionen</SelectItem>
                      <SelectItem value="24">24 Lektionen</SelectItem>
                      <SelectItem value="26">26 Lektionen</SelectItem>
                      <SelectItem value="28">28 Lektionen</SelectItem>
                      <SelectItem value="30">30 Lektionen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uebertragSemester" className="text-sm">
                    Übertrag letztes Semester
                  </Label>
                  <Input
                    id="uebertragSemester"
                    type="number"
                    value={currentSetupData.uebertragSemester}
                    onChange={(e) => setCurrentSetupData((prev) => ({ ...prev, uebertragSemester: e.target.value }))}
                    className="h-9"
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schulleitung" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Schulleitung Einstellungen</CardTitle>
                <CardDescription className="text-xs">Spezialfunktion und Führungsaufgaben</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="beschaeftigungsgrad" className="text-sm">
                    Beschäftigungsgrad %
                  </Label>
                  <Input
                    id="beschaeftigungsgrad"
                    type="number"
                    value={currentSchulleitungData.beschaeftigungsgrad}
                    onChange={(e) =>
                      setCurrentSchulleitungData((prev) => ({ ...prev, beschaeftigungsgrad: e.target.value }))
                    }
                    className="h-9"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uebertragSemesterSL" className="text-sm">
                    Übertrag letztes Semester
                  </Label>
                  <Input
                    id="uebertragSemesterSL"
                    type="number"
                    value={currentSchulleitungData.uebertragSemester}
                    onChange={(e) =>
                      setCurrentSchulleitungData((prev) => ({ ...prev, uebertragSemester: e.target.value }))
                    }
                    className="h-9"
                    min="0"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="klassenlehrperson" className="text-sm">
                    Klassenlehrperson
                  </Label>
                  <Switch
                    id="klassenlehrperson"
                    checked={currentSchulleitungData.klassenlehrperson}
                    onCheckedChange={(checked) =>
                      setCurrentSchulleitungData((prev) => ({ ...prev, klassenlehrperson: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wochenlektionenWegzeit" className="text-sm">
                    Wochenlektionen für Wegzeit
                  </Label>
                  <Select
                    value={currentSchulleitungData.wochenlektionenWegzeit}
                    onValueChange={(value) =>
                      setCurrentSchulleitungData((prev) => ({ ...prev, wochenlektionenWegzeit: value }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 Lektionen</SelectItem>
                      <SelectItem value="1">1 Lektion</SelectItem>
                      <SelectItem value="2">2 Lektionen</SelectItem>
                      <SelectItem value="3">3 Lektionen</SelectItem>
                      <SelectItem value="4">4 Lektionen</SelectItem>
                      <SelectItem value="5">5 Lektionen</SelectItem>
                      <SelectItem value="6">6 Lektionen</SelectItem>
                      <SelectItem value="8">8 Lektionen</SelectItem>
                      <SelectItem value="10">10 Lektionen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
