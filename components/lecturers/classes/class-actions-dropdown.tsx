"use client";

import { Plus, FileSpreadsheet, Users, Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ClassActionFlow = "import" | "manual-create" | "manual-add";

interface ClassActionsDropdownProps {
    onActionSelect: (action: ClassActionFlow) => void;
}

export default function ClassActionsDropdown({ onActionSelect }: ClassActionsDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Thêm mới
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onActionSelect("manual-create")}>
                    <Settings className="mr-2 size-4" />
                    Tạo lớp học phần
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionSelect("import")}>
                    <FileSpreadsheet className="mr-2 size-4" />
                    Thêm SV từ Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionSelect("manual-add")}>
                    <UserPlus className="mr-2 size-4" />
                    Thêm SV thủ công
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
