"use client";

import { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchDialog } from "@/components/search-dialog";
import { Breadcrumbs } from "../dataroom/breadcrumbs";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const folderId = pathname.split("/").pop();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-800   w-full pb-6 flex md:items-center md:justify-between justify-start px-6 py-3 md:flex-row flex-col gap-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" />
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Breadcrumbs folderId={folderId} />
          </div>
        </div>

        <div className="flex items-start space-x-4 md:justify-end justify-start w-full md:w-auto md:flex-row flex-col gap-2 lg:gap-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-64 text-left"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search..."
              className="w-64 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-pointer"
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 flex flex-row items-center">
              <Command className="h-3 w-3" />
              <span className="ml-1">K</span>
            </div>
          </button>
          <SignOutButton />
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
