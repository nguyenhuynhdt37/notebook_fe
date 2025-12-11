"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wand2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ManualForm from "./manual-form";
import AutoForm from "./auto-form";

type CreateMode = "manual" | "auto";

export default function CreateNotebook() {
  const router = useRouter();
  const [mode, setMode] = useState<CreateMode>("manual");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tạo Notebook mới
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Tạo notebook cá nhân theo cách thủ công hoặc để AI hỗ trợ
          </p>
        </div>
      </div>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as CreateMode)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="manual" className="gap-2 py-2.5">
            <PenTool className="size-4" />
            <span>Thủ công</span>
          </TabsTrigger>
          <TabsTrigger value="auto" className="gap-2 py-2.5">
            <Wand2 className="size-4" />
            <span>AI tự động</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Tạo thủ công</CardTitle>
              <CardDescription>
                Nhập tiêu đề, mô tả và tải lên ảnh bìa cho notebook của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>AI tự động tạo</CardTitle>
              <CardDescription>
                Chỉ cần mô tả nội dung bạn muốn học, AI sẽ tự tạo tiêu đề và ảnh
                bìa phù hợp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
