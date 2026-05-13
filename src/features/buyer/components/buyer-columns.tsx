import { useMemo, useState } from "react";
import {
  Calendar,
  Eye,
  MessageSquare,
  MoreHorizontal,
  RefreshCcw,
  SquarePen,
  Trash2,
  XCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionConfirmDialog } from "./action-confirm-dialog";

const ActionCell = ({ row, onAction, mutations }: { row: any, onAction?: (action: { type: string, item: any }) => void, mutations?: any }) => {
  const { t } = useTranslation('requests/list');
  const request = row.original;
  const cancelRequest = mutations?.cancelRequest
  const deleteRequest = mutations?.deleteRequest
  const reopenRequest = mutations?.reopenRequest
  const isCancelling = mutations?.isCancelling
  const isDeleting = mutations?.isDeleting
  const isReopening = mutations?.isReopening

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-xl hover:bg-accent" title={t('actions.open_menu')}>
            <span className="sr-only">{t('actions.open_menu')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2">{t('actions.title')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction?.({ type: 'view_request', item: request })} className="gap-2.5 text-xs font-bold p-3 cursor-pointer rounded-xl">
            <Eye className="size-4" /> {t('actions.view_details')}
          </DropdownMenuItem>
          {request.status === "open" && (
            <DropdownMenuItem onClick={() => onAction?.({ type: 'edit_request', item: request })} className="gap-2.5 text-xs font-bold p-3 cursor-pointer rounded-xl">
              <SquarePen className="size-4" /> {t('actions.edit_request')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {request.status === "open" && (
            <DropdownMenuItem
              onClick={() => setIsCancelDialogOpen(true)}
              className="gap-2.5 text-xs font-bold p-3 cursor-pointer rounded-xl text-amber-600 focus:text-amber-700"
            >
              <XCircle className="size-4" /> {t('actions.cancel_request')}
            </DropdownMenuItem>
          )}

          {request.status !== "open" && (
            <DropdownMenuItem
              onClick={() => setIsReopenDialogOpen(true)}
              className="gap-2.5 text-xs font-bold p-3 cursor-pointer rounded-xl text-blue-600 focus:text-blue-700"
            >
              <RefreshCcw className="size-4" /> {t('actions.reopen_request')}
            </DropdownMenuItem>
          )}

          {request.status !== "fulfilled" && (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2.5 text-xs font-bold p-3 cursor-pointer rounded-xl text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" /> {t('actions.delete_permanently')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title={t('dialogs.cancel.title')}
        description={t('dialogs.cancel.description')}
        confirmLabel={t('dialogs.cancel.confirm')}
        confirmIcon={<XCircle className="size-4" />}
        variant="destructive"
        isLoading={isCancelling}
        loadingLabel={t('dialogs.cancel.cancelling')}
        onConfirm={() => cancelRequest(request.id, { onSuccess: () => setIsCancelDialogOpen(false) })}
      />

      <ActionConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('dialogs.delete.title')}
        description={t('dialogs.delete.description')}
        confirmLabel={t('dialogs.delete.confirm')}
        confirmIcon={<Trash2 className="size-4" />}
        variant="destructive"
        isLoading={isDeleting}
        loadingLabel={t('dialogs.delete.deleting')}
        onConfirm={() => deleteRequest(request.id, { onSuccess: () => setIsDeleteDialogOpen(false) })}
      />

      <ActionConfirmDialog
        open={isReopenDialogOpen}
        onOpenChange={setIsReopenDialogOpen}
        title={t('dialogs.reopen.title')}
        description={t('dialogs.reopen.description')}
        confirmLabel={t('dialogs.reopen.confirm')}
        confirmIcon={<RefreshCcw className="size-4" />}
        isLoading={isReopening}
        loadingLabel={t('dialogs.reopen.reopening')}
        onConfirm={() => reopenRequest(request.id, { onSuccess: () => setIsReopenDialogOpen(false) })}
      />
    </>
  );
};

export const useBuyerColumns = (
  onAction?: (action: { type: string, item: any }) => void,
  mutations?: any,
  tOverride?: (key: string) => string
): Array<ColumnDef<any>> => {
  const { t: tHook } = useTranslation('requests/list');
  const t = tOverride || tHook;

  return useMemo(() => [
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }: { row: any }) => {
        const images = row.original.imageUrls || [];
        return (
          <div className="size-8 rounded bg-muted overflow-hidden border">
            {images.length > 0 ? (
              <img src={images[0]} alt="" className="size-full object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                {row.original.partName?.substring(0, 2).toUpperCase() || "P"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "partName",
      header: t('columns.part'),
      cell: ({ row }: { row: any }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row.original.partName}</span>
          <span className="text-[10px] text-muted-foreground uppercase">ID: {row.original.id.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      accessorKey: "vehicleBrand",
      header: t('columns.vehicle'),
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
            {row.original.brand?.imageUrl ? (
              <img src={row.original.brand.imageUrl} alt="" className="size-4 object-contain" />
            ) : (
              <span className="text-[9px] font-bold text-muted-foreground">{(row.original.vehicleBrand || '?').substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium">{row.original.vehicleBrand}</span>
            <span className="text-xs text-muted-foreground">{row.original.modelYear} • {row.original.brand?.clusterRegion || t('empty.general')}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: t('columns.category'),
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.category?.name || t('empty.inquiry')}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t('columns.posted'),
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-3" />
          <span className="text-xs">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "quotes",
      header: t('columns.offers'),
      cell: ({ row }: { row: any }) => {
        const count = row.original.quotesCount ?? row.original.quotes?.length ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            <MessageSquare className={`size-3 ${count > 0 ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-sm font-bold ${count > 0 ? "text-foreground" : "text-muted-foreground"}`}>{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t('columns.status'),
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        return (
          <GlowingBadge
            variant={
              status === "open" ? "success" :
                status === "fulfilled" ? "neutral" :
                  "default"
            }
            pulse={status === "open"}
          >
            {t(`filters.statuses.${status}`)}
          </GlowingBadge>
        );
      },
      filterFn: (row: any, id: string, value: any) => value.includes(row.getValue(id)),
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="sticky right-0 bg-background pl-2 -mr-2" onClick={(e) => e.stopPropagation()}>
          <ActionCell row={row} onAction={onAction} mutations={mutations} />
        </div>
      ),
    },
  ], [onAction, t]);
};

