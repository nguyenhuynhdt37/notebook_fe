"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Globe, Users, UserPlus, FolderOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AvailableCommunity from "./available";
import MyGroups from "./my-comunity-groups";
import MyPersonalGroups from "./my-personal-groups";

type TabValue = "community" | "joined" | "friends" | "my-notebooks";

const VALID_TABS: TabValue[] = [
  "community",
  "joined",
  "friends",
  "my-notebooks",
];

export default function NotebookTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: TabValue = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : "community";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/notebook?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notebooks</h1>
        <p className="text-muted-foreground mt-1.5">
          Quản lý và khám phá các nhóm notebook
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="community" className="gap-2 py-2.5">
            <Globe className="size-4" />
            <span className="hidden sm:inline">Cộng đồng</span>
          </TabsTrigger>
          <TabsTrigger value="joined" className="gap-2 py-2.5">
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Đã tham gia</span>
          </TabsTrigger>
          <TabsTrigger value="friends" className="gap-2 py-2.5">
            <Users className="size-4" />
            <span className="hidden sm:inline">Bạn bè</span>
          </TabsTrigger>
          <TabsTrigger value="my-notebooks" className="gap-2 py-2.5">
            <FolderOpen className="size-4" />
            <span className="hidden sm:inline">Của tôi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="community" className="mt-0">
          <AvailableCommunity />
        </TabsContent>

        <TabsContent value="joined" className="mt-0">
          <MyGroups />
        </TabsContent>

        <TabsContent value="friends" className="mt-0">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="size-12 mx-auto mb-4 opacity-50" />
            <p>Tính năng nhóm bạn bè đang phát triển</p>
          </div>
        </TabsContent>

        <TabsContent value="my-notebooks" className="mt-0">
          <MyPersonalGroups />
        </TabsContent>
      </Tabs>
    </div>
  );
}
