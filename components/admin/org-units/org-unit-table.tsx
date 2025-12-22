"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgUnitResponse, ORG_UNIT_TYPE_LABELS } from "@/types/admin/org-unit";
import OrgUnitDeleteDialog from "./org-unit-delete-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface OrgUnitTableProps {
  orgUnits: OrgUnitResponse[];
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete: () => void;
}

export default function OrgUnitTable({
  orgUnits,
  sortBy,
  sortDir,
  onSort,
  onDelete,
}: OrgUnitTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const SortableHeader = ({
    field,
    label,
  }: {
    field: string;
    label: string;
  }) => {
    const isActive = sortBy === field;
    return (
      <TableHead className="h-12">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 -ml-2 font-semibold hover:bg-accent"
          onClick={() => onSort(field)}
        >
          {label}
          {isActive ? (
            sortDir === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowDown className="ml-2 size-3.5" />
            )
          ) : (
            <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground opacity-50" />
          )}
        </Button>
      </TableHead>
    );
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHeader field="code" label="Mã" />
              <SortableHeader field="name" label="Tên đơn vị" />
              <TableHead className="h-12">Loại</TableHead>
              <TableHead className="h-12">Trạng thái</TableHead>
              <SortableHeader field="createdAt" label="Ngày tạo" />
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgUnits.map((orgUnit) => (
              <TableRow key={orgUnit.id} className="hover:bg-accent/50">
                <TableCell>
                  <span className="font-mono text-sm font-medium">
                    {orgUnit.code}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{orgUnit.name}</span>
                    {orgUnit.parent && (
                      <span className="text-xs text-muted-foreground">
                        ↳ {orgUnit.parent.name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {orgUnit.type ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                      {ORG_UNIT_TYPE_LABELS[orgUnit.type] || orgUnit.type}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      orgUnit.isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {orgUnit.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(orgUnit.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/org-units/${orgUnit.id}/edit`}>
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedOrgUnit({
                            id: orgUnit.id,
                            name: orgUnit.name,
                          });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedOrgUnit && (
        <OrgUnitDeleteDialog
          orgUnitId={selectedOrgUnit.id}
          orgUnitName={selectedOrgUnit.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
