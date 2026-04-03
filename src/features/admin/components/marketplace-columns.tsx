"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

// Schema adapted for Marketplace Activity
export const marketplaceActivitySchema = z.object({
  id: z.string(),
  partName: z.string(),
  buyer: z.string(),
  brand: z.string(),
  year: z.string(),
  status: z.string(),
  offers: z.number(),
  createdAt: z.string(),
  image: z.string().optional()
});

export type MarketplaceActivity = z.infer<typeof marketplaceActivitySchema>;


// We'll pass the TableCellViewer as a component or keep it in the main file for now 
// but for true isolation we should define columns here.

export const marketplaceColumns = (
  t: (key: string) => string,
  TableCellViewer: React.ComponentType<{ item: MarketplaceActivity }>,
  showSelection: boolean = true
): ColumnDef<MarketplaceActivity>[] => {
  const columns: ColumnDef<MarketplaceActivity>[] = [];

  if (showSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    });
  }

  columns.push(
  {
    accessorKey: "partName",
    header: t('table.columns.part_name'),
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false
  },
  {
    accessorKey: "brand",
    header: t('table.vehicle'),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {row.original.brand}
        </Badge>
        <span className="text-muted-foreground text-xs">{row.original.year}</span>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: t('table.status_placeholder'),
    cell: ({ row }) => {
      const status = row.original.status as 'fulfilled' | 'open' | 'cancelled';
      return (
        <Badge 
          variant={status === "fulfilled" ? "default" : "secondary"} 
          className="capitalize"
        >
          {t(`table.status.${status}`)}
        </Badge>
      );

    }
  },
  {
    accessorKey: "buyer",
    header: t('table.buyer'),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.buyer}
      </span>
    )
  },
  {
    accessorKey: "offers",
    header: t('metrics.avg_offers'),
    cell: ({ row }) => (
      <div className="text-center w-12 font-mono">
        {row.original.offers}
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: t('table.columns.created_at'),
    cell: ({ row }) => (
      <div className="text-muted-foreground text-xs">
        {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
      </div>
    )
  }
  );

  return columns;
};

