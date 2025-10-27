"use client";

import { useState } from "react";
import { HomeScreen } from "@/components/home-screen";
import { CalendarScreen } from "@/components/calendar-screen";
import { ProfileScreen } from "@/components/profile-screen";
import { Calendar, Home, User } from "lucide-react";

interface MainAppProps {
  user: { email: string } | null;
  setupData: any;
  schulleitungData: any;
}

export function MainApp({ user, setupData, schulleitungData }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "home" | "profile">(
    "home",
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 pb-20">
        {activeTab === "calendar" && <CalendarScreen />}
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "profile" && (
          <ProfileScreen
            user={user}
            setupData={setupData}
            schulleitungData={schulleitungData}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              activeTab === "calendar"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-6 w-6" />
            {activeTab === "calendar" && (
              <div className="w-8 h-1 bg-primary rounded-full mt-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              activeTab === "home"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-6 w-6" />
            {activeTab === "home" && (
              <div className="w-8 h-1 bg-primary rounded-full mt-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              activeTab === "profile"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-6 w-6" />
            {activeTab === "profile" && (
              <div className="w-8 h-1 bg-primary rounded-full mt-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
