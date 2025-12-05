"use client";

import { Video, Upload, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-background via-background to-muted/10 hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-3 text-foreground">
            <div className="p-2 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 shadow-sm border border-border/30">
              <Video className="size-4.5" />
            </div>
            <span>Tổng quan Video</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="h-4 w-4 ml-auto">
                    <HelpCircle className="size-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    AI sẽ phân tích và tạo tóm tắt nội dung video của bạn
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mb-6 inline-flex p-5 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 shadow-lg border border-border/40">
              <Video className="size-16 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2.5">
              Chưa có video nào được tải lên
            </h3>
            <p className="text-sm text-muted-foreground mb-7 max-w-xs mx-auto leading-relaxed">
              Tải lên video để AI phân tích và tạo tóm tắt tự động
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/60 hover:bg-muted/60 hover:shadow-md transition-all"
            >
              <Upload className="size-4" />
              Tải lên video
            </Button>
            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
                Tính năng
              </p>
              <div className="space-y-2.5 text-left max-w-xs mx-auto">
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-foreground/60" />
                  <span>Tự động tóm tắt nội dung</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-foreground/60" />
                  <span>Trích xuất điểm chính</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-foreground/60" />
                  <span>Hỗ trợ MP4, YouTube links</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

