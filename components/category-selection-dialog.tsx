"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface TimeEntry {
  id: string
  workingTime: number
  category: string
  subcategory?: string
}

interface CategorySelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalTime: number
  onSave: (entries: TimeEntry[]) => void
  onCancel: () => void
}

const CATEGORIES = {
  unterrichten: {
    label: "Unterrichten, beraten, begleiten",
    subcategories: [
      { value: "unterricht", label: "Unterricht" },
      { value: "vor-nachbereitung", label: "Vor und Nachbereitung" },
      { value: "beraten-begleiten", label: "Beraten, Begleiten" },
    ],
  },
  zusammenarbeit: {
    label: "Zusammenarbeit",
    subcategories: [],
  },
  weiterbildung: {
    label: "Weiterbildung",
    subcategories: [],
  },
  schulleitung: {
    label: "Schulleitung",
    subcategories: [],
  },
}

export function CategorySelectionDialog({
  open,
  onOpenChange,
  totalTime,
  onSave,
  onCancel,
}: CategorySelectionDialogProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [validationError, setValidationError] = useState<string>("")

  useEffect(() => {
    if (open) {
      setEntries([
        {
          id: "1",
          workingTime: Math.floor(totalTime / 60000), // Convert milliseconds to minutes
          category: "",
          subcategory: "",
        },
      ])
      setValidationError("")
    }
  }, [open, totalTime])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    return `${hours}h${minutes.toString().padStart(2, "0")}min`
  }

  const getTotalDistributedTime = () => {
    return entries.reduce((total, entry) => total + (entry.workingTime || 0), 0)
  }

  const validateTimeDistribution = () => {
    const totalDistributed = getTotalDistributedTime()
    const totalSessionMinutes = Math.floor(totalTime / 60000)

    if (totalDistributed > totalSessionMinutes) {
      setValidationError(
        `Total distributed time (${totalDistributed}min) cannot exceed session time (${totalSessionMinutes}min)`,
      )
      return false
    }

    setValidationError("")
    return true
  }

  const addEntry = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      workingTime: 0,
      category: "",
      subcategory: "",
    }
    setEntries([...entries, newEntry])
  }

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id))
      setTimeout(validateTimeDistribution, 0)
    }
  }

  const updateEntry = (id: string, field: keyof TimeEntry, value: string | number) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
    if (field === "workingTime") {
      setTimeout(validateTimeDistribution, 0)
    }
  }

  const handleSave = () => {
    if (validateTimeDistribution()) {
      onSave(entries)
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dimensions</DialogTitle>
          <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Time Display */}
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-sm font-medium">Session Time:</Label>
              <div className="text-lg font-semibold">{totalTime > 0 ? formatTime(totalTime) : "0h00min"}</div>
            </div>
            {entries.length > 1 && (
              <div className="text-right">
                <Label className="text-sm font-medium">Distributed:</Label>
                <div className="text-lg font-semibold">{getTotalDistributedTime()}min</div>
                <div className="text-xs text-muted-foreground">
                  Remaining: {Math.max(0, Math.floor(totalTime / 60000) - getTotalDistributedTime())}min
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{validationError}</div>
          )}

          {/* Time Entries */}
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Working Time (minutes):</Label>
                  <div className="flex-1" />
                  {entries.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeEntry(entry.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max={Math.floor(totalTime / 60000)}
                    value={entry.workingTime || ""}
                    onChange={(e) => updateEntry(entry.id, "workingTime", Number.parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Category</Label>
                  <Select value={entry.category} onValueChange={(value) => updateEntry(entry.id, "category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {entry.category && CATEGORIES[entry.category as keyof typeof CATEGORIES]?.subcategories.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Subcategory</Label>
                    <Select
                      value={entry.subcategory}
                      onValueChange={(value) => updateEntry(entry.id, "subcategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES[entry.category as keyof typeof CATEGORIES].subcategories.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <Button
            variant="ghost"
            onClick={addEntry}
            className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add more
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!!validationError || getTotalDistributedTime() === 0}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
