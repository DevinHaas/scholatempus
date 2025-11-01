"use client";

import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Calendar, Home, User } from "lucide-react";

const CalendarFeature = dynamic(
  () => import("@/features/calendar").then((module) => module.CalendarScreen),
  {
    ssr: false,
    loading: () => <TabLoading />,
  },
);

const HomeFeature = dynamic(
  () => import("@/features/home").then((module) => module.HomeScreen),
  {
    ssr: false,
    loading: () => <TabLoading />,
  },
);

const ProfileFeature = dynamic(
  () => import("@/features/profile").then((module) => module.ProfileScreen),
  {
    ssr: false,
    loading: () => <TabLoading />,
  },
);

interface MainAppProps {
  user: { email: string } | null;
  setupData: any;
  schulleitungData: any;
}

type TabKey = "calendar" | "home" | "profile";

export function MainApp({ user, setupData, schulleitungData }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "calendar":
        return <CalendarFeature />;
      case "profile":
        return (
          <ProfileFeature
            user={user}
            setupData={setupData}
            schulleitungData={schulleitungData}
          />
        );
      case "home":
      default:
        return <HomeFeature />;
    }
  }, [activeTab, schulleitungData, setupData, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-20">
        <Suspense fallback={<TabLoading />}>{tabContent}</Suspense>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex items-center justify-around py-2">
          <TabButton
            icon={Calendar}
            isActive={activeTab === "calendar"}
            onSelect={() => setActiveTab("calendar")}
          />
          <TabButton
            icon={Home}
            isActive={activeTab === "home"}
            onSelect={() => setActiveTab("home")}
          />
          <TabButton
            icon={User}
            isActive={activeTab === "profile"}
            onSelect={() => setActiveTab("profile")}
          />
        </div>
      </nav>
    </div>
  );
}

interface TabButtonProps {
  icon: typeof Calendar;
  isActive: boolean;
  onSelect: () => void;
}

function TabButton({ icon: Icon, isActive, onSelect }: TabButtonProps) {
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-6 w-6" />
      {isActive && <div className="w-8 h-1 bg-primary rounded-full mt-1" />}
    </button>
  );
}

function TabLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
