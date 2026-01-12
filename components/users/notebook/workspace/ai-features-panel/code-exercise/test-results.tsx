import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { RunCodeResult } from "@/types/user/ai-task";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  result: RunCodeResult | null;
  isRunning: boolean;
}

export default function TestResults({ result, isRunning }: Props) {
  if (isRunning) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4">
        Đang chạy test cases...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4">
        Chạy code để xem kết quả kiểm thử
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm">Kết quả kiểm thử</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              result.status === "passed"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : result.status === "failed"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            )}
          >
            {result.passed}/{result.total} Passed
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {result.details.map((detail, idx) => (
            <div key={idx} className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                {detail.passed ? (
                  <CheckCircle2 className="size-4 mt-0.5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="size-4 mt-0.5 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      Test Case {idx + 1}
                    </span>
                    {detail.isHidden && (
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </div>

                  {detail.error ? (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded mt-2 font-mono">
                      {detail.error}
                    </div>
                  ) : !detail.passed && !detail.isHidden ? (
                    <div className="text-xs space-y-1 mt-2 bg-muted/50 p-2 rounded">
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-muted-foreground">Input:</span>
                        <span className="font-mono">{detail.input}</span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-muted-foreground">Expect:</span>
                        <span className="font-mono text-green-600 dark:text-green-400">
                          {detail.expected}
                        </span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">
                          {detail.actual}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
