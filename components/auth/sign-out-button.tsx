"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to sign out", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="cursor-pointer bg-gray-100 dark:bg-gray-800"
    >
      Sign Out
    </Button>
  );
}
