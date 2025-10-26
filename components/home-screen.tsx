"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit3 } from "lucide-react"
import { CategorySelectionDialog } from "@/components/category-selection-dialog"

export function HomeScreen() {
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime())
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, startTime])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleStartStop = () => {
    if (isTracking) {
      setIsTracking(false)
      setShowCategoryDialog(true)
    } else {
      // Start tracking
      setIsTracking(true)
      setStartTime(new Date())
      setElapsedTime(0)
    }
  }

  const handleCancel = () => {
    setIsTracking(false)
    setStartTime(null)
    setElapsedTime(0)
  }

  const handleCategorySelection = (categories: any[]) => {
    // Handle saving the time entries with categories
    console.log("Time entries saved:", categories)
    setShowCategoryDialog(false)
    setStartTime(null)
    setElapsedTime(0)
  }

  const handleCategoryCancel = () => {
    // Resume tracking if user cancels
    setIsTracking(true)
    setShowCategoryDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      {/* Timer Display */}
      <div className="mb-8 text-center">
        {(isTracking || elapsedTime > 0) && (
          <>
            <div className="text-sm text-muted-foreground mb-2">{isTracking ? "Working Time:" : "Worked Time:"}</div>
            <div className="text-2xl font-mono font-semibold text-foreground">{formatTime(elapsedTime)}</div>
          </>
        )}
      </div>

      <div className="relative mb-8">
        {/* Background circles for layered effect */}
        <div className="absolute inset-0">
          {/* Outermost circle - lightest */}
          <div
            className="absolute w-52 h-52 rounded-full -top-6 -left-6"
            style={{
              background: isTracking
                ? "linear-gradient(135deg, #fca5a5 0%, #f87171 100%)"
                : "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
              opacity: 0.6,
            }}
          />

          {/* Middle circle - medium opacity */}
          <div
            className="absolute w-50 h-50 rounded-full -top-3 -left-3"
            style={{
              width: "200px",
              height: "200px",
              background: isTracking
                ? "linear-gradient(135deg, #f87171 0%, #ef4444 100%)"
                : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
              opacity: 0.8,
            }}
          />
        </div>

        {/* Main button - front layer */}
        <button
          onClick={handleStartStop}
          className={`
            relative z-10 w-48 h-48 rounded-full text-white text-3xl font-bold
            transition-all duration-300 transform hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl
          `}
          style={{
            background: isTracking
              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            boxShadow: isTracking
              ? "0 10px 30px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
              : "0 10px 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          {isTracking ? "Stop" : "Start"}
        </button>
      </div>

      {isTracking && (
        <Button
          variant="outline"
          className="mb-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 bg-transparent"
          onClick={handleCancel}
        >
          Cancel Timer
        </Button>
      )}

      {/* Add Manually Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => setShowCategoryDialog(true)}
      >
        <Edit3 className="h-4 w-4" />
        Add manually
      </Button>

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        totalTime={elapsedTime}
        onSave={handleCategorySelection}
        onCancel={handleCategoryCancel}
      />
    </div>
  )
}
