"use client";

import { useFolderPath } from "@/lib/queries/folders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useUser } from "@/lib/supabase/client";

interface BreadcrumbsProps {
  folderId: string;
}

export function Breadcrumbs({ folderId }: BreadcrumbsProps) {
  const { data: path, isLoading } = useFolderPath(folderId);
  const { data: user } = useUser();

  if (isLoading) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dataroom/root">
              Data Room ({user?.email ? `${user.email.slice(0, 10)}...` : 'root'})
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {path && path.length > 0 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>

            {path.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                {index > 0 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {index === path.length - 1 ? (
                    <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={`/dataroom/${folder.id}`}>{folder.name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
