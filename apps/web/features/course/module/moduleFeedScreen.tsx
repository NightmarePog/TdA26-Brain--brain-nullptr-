"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";

export default function ModuleFeedScreen() {
  return (
    <Sidebar side="right" variant="sidebar">
      {/* Sloupec karet */}
      <div className="flex flex-col space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="font-medium">System {index + 1}</div>
              <div className="text-sm text-muted-foreground">
                Something something lmao lmao
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Sidebar>
  );
}
