"use client";

import * as React from "react";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { DataTable } from "@/components/ui/data-table/data-table";
import { marketplaceColumns } from "./marketplace-columns";

import { MarketplaceActivity } from "./marketplace-columns";


function TableCellViewer({ item }: { item: MarketplaceActivity }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-foreground no-underline hover:text-primary">
          <div className="flex items-center gap-3 text-left">
            <div className="size-10 rounded bg-muted overflow-hidden border shrink-0">
              <img src={item.image || 'https://via.placeholder.com/150'} alt={item.partName} className="size-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">{item.partName}</span>
              <span className="text-[10px] text-muted-foreground uppercase">ID: {item.id}</span>
            </div>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>{item.partName}</DrawerTitle>
            <DrawerDescription>
              Submitted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">Vehicle</span>
                <p className="font-medium text-sm uppercase">{item.brand}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">Year</span>
                <p className="font-medium text-sm">{item.year}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">Buyer</span>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {item.buyer.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{item.buyer}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">Lifecycle Status</span>
                <Select defaultValue={item.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="open">Open Demand</SelectItem>
                    <SelectItem value="cancelled" className="text-destructive">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-muted-foreground italic leading-relaxed">
              Market liquidity is optimal. High conversion potential detected within the last 24 hours.
            </div>
          </div>
          <DrawerFooter className="pt-4">
            <Button className="w-full">Update Lifecycle</Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


export function MarketplaceActivityTable({ data }: { data: MarketplaceActivity[] }) {
  const columns = React.useMemo(() => marketplaceColumns(TableCellViewer, false), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Marketplace Intelligence</h3>
          <p className="text-[10px] text-muted-foreground/70 font-medium">Real-time demand signals and fulfillment velocity</p>
        </div>
        <Button variant="link" asChild className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline">
          <Link to="/dashboard/audit">
            View Full Audit
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border bg-card/30 backdrop-blur-sm overflow-hidden">
        <DataTable
          data={data}
          columns={columns}
          enableRowSelection={false}
        />
      </div>
    </div>
  );
}
