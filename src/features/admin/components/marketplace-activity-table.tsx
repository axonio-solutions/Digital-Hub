"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('dashboard/admin');
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-foreground no-underline hover:text-primary">
          <div className="flex items-center gap-3 text-start">
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
              {t('table.submitted', { time: formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) })}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t('table.vehicle')}</span>
                <p className="font-medium text-sm uppercase">{item.brand}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t('table.year')}</span>
                <p className="font-medium text-sm">{item.year}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t('table.buyer')}</span>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {item.buyer.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{item.buyer}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t('table.lifecycle')}</span>
                <Select defaultValue={item.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('table.status_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulfilled">{t('table.status.fulfilled')}</SelectItem>
                    <SelectItem value="open">{t('table.status.open')}</SelectItem>
                    <SelectItem value="cancelled" className="text-destructive">{t('table.status.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-muted-foreground italic leading-relaxed">
              {t('table.liquidity')}
            </div>
          </div>
          <DrawerFooter className="pt-4">
            <Button className="w-full">{t('table.update')}</Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">{t('table.close')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


export function MarketplaceActivityTable({ data }: { data: MarketplaceActivity[] }) {
  const { t } = useTranslation('dashboard/admin');
  const columns = React.useMemo(() => marketplaceColumns(t, TableCellViewer, false), [t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('table.intelligence')}</h3>
          <p className="text-[10px] text-muted-foreground/70 font-medium">{t('table.signals')}</p>
        </div>
        <Button variant="link" asChild className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-primary hover:no-underline">
          <Link to="/dashboard/audit">
            {t('table.full_audit')}
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
