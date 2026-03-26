"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, User } from "lucide-react";
import { motion } from "framer-motion";

interface DockTabProps {
  icon: typeof Calendar;
  label: string;
  isActive: boolean;
  href: string;
}

function DockTab({ icon: Icon, label, isActive, href }: DockTabProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full z-10 transition-colors ${
        isActive
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="dock-active-pill"
          className="absolute inset-0 bg-primary rounded-full -z-10"
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export function TabNavigation() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/home";
  const isCalendarActive = pathname === "/calendar";
  const isProfileActive = pathname === "/profile";

  return (
    <nav className="flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-1 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg px-2 py-2">
      <DockTab icon={Calendar} label="Kalender" isActive={isCalendarActive} href="/calendar" />
      <DockTab icon={Home} label="Home" isActive={isHomeActive} href="/home" />
      <DockTab icon={User} label="Profil" isActive={isProfileActive} href="/profile" />
    </nav>
  );
}
