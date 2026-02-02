"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { UserRole } from "@/src/lib/constants";

interface MobileSidebarProps {
  role: UserRole;
}

export function MobileSidebar({ role }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0">
        <Sidebar role={role} />
      </SheetContent>
    </Sheet>
  );
}
