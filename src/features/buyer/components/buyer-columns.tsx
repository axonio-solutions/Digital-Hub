import { useState } from "react";
import {
  Calendar,
  MessageSquare,
  MoreHorizontal,
  SquarePen,
  Eye,
  Trash2,
  XCircle,
  RefreshCcw
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useCancelRequest, 
  useDeleteRequest, 
  useReopenRequest 
} from "@/features/requests/hooks/use-requests";
import { NewPartRequestForm } from "@/features/requests/components/new-request-form";

const ActionCell = ({ row, onAction }: { row: any, onAction?: (action: { type: string, item: any }) => void }) => {
  const request = row.original;
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelRequest();
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest();
  const { mutate: reopenRequest, isPending: isReopening } = useReopenRequest();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction?.({ type: 'view_request', item: request })}>
            <Eye className="me-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          {request.status === "open" && (
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <SquarePen className="me-2 h-4 w-4" /> Edit Request
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {request.status === "open" && (
            <DropdownMenuItem 
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-amber-600 focus:text-amber-700"
            >
              <XCircle className="me-2 h-4 w-4" /> Cancel Request
            </DropdownMenuItem>
          )}

          {request.status !== "open" && (
            <DropdownMenuItem 
              onClick={() => setIsReopenDialogOpen(true)}
              className="text-blue-600 focus:text-blue-700"
            >
              <RefreshCcw className="me-2 h-4 w-4" /> Reopen Request
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="me-2 h-4 w-4" /> Delete Permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Action Dialogs */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to cancel this request? It will no longer be visible to sellers.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>Close</Button>
            <Button variant="destructive" onClick={() => {
              cancelRequest(request.id, { onSuccess: () => setIsCancelDialogOpen(false) })
            }} disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Permanently?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action is irreversible. All data for this request will be removed.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              deleteRequest(request.id, { onSuccess: () => setIsDeleteDialogOpen(false) })
            }} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
          </DialogHeader>
          <NewPartRequestForm
            initialData={request}
            onSuccess={() => setIsEditDialogOpen(false)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen Request?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will make the request visible to sellers again.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsReopenDialogOpen(false)} disabled={isReopening}>Cancel</Button>
            <Button onClick={() => {
              reopenRequest(request.id, { onSuccess: () => setIsReopenDialogOpen(false) })
            }} disabled={isReopening}>
              {isReopening ? 'Reopening...' : 'Yes, Reopen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const buyerColumns = (onAction?: (action: { type: string, item: any }) => void): ColumnDef<any>[] => [
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
    header: "Part Description",
    cell: ({ row }: { row: any }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.partName}</span>
        <span className="text-[10px] text-muted-foreground uppercase">ID: {row.original.id.substring(0, 8)}</span>
      </div>
    ),
  },
  {
    accessorKey: "vehicleBrand",
    header: "Vehicle",
    cell: ({ row }: { row: any }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{row.original.vehicleBrand}</span>
        <span className="text-xs text-muted-foreground">{row.original.modelYear} • {row.original.brand?.clusterRegion || "General"}</span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: { row: any }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.category?.name || "Inquiry"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Posted",
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
    header: "Offers",
    cell: ({ row }: { row: any }) => {
      const count = row.original.quotes?.length || 0;
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
    header: "Status",
    cell: ({ row }: { row: any }) => {
      const status = row.original.status;
      return (
        <Badge 
          variant={
            status === "open" ? "default" : 
            status === "fulfilled" ? "secondary" : 
            "outline"
          } 
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row: any, id: string, value: any) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => <ActionCell row={row} onAction={onAction} />,
  },
];

