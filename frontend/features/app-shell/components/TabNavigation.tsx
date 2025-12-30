"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, User } from "lucide-react";

interface TabButtonProps {
  icon: typeof Calendar;
  isActive: boolean;
  href: string;
}

function TabButton({ icon: Icon, isActive, href }: TabButtonProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-6 w-6" />
      {isActive && <div className="w-8 h-1 bg-primary rounded-full mt-1" />}
    </Link>
  );
}

export function TabNavigation() {
  const pathname = usePathname();

  // Map pathnames to active state
  const isHomeActive = pathname === "/home";
  const isCalendarActive = pathname === "/calendar";
  const isProfileActive = pathname === "/profile";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        <TabButton
          icon={Calendar}
          isActive={isCalendarActive}
          href="/calendar"
        />
        <TabButton icon={Home} isActive={isHomeActive} href="/home" />
        <TabButton
          icon={User}
          isActive={isProfileActive}
          href="/profile"
        />
      </div>
    </nav>
  );
}

