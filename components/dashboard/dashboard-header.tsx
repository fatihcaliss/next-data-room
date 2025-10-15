"use client";

import { User } from "@supabase/supabase-js";
import { Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900  w-full pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" />
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Data Room ({user.email})</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search..."
              className="w-64 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 flex flex-row items-center">
              <Command className="h-3 w-3" />
              <span className="ml-1">K</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
