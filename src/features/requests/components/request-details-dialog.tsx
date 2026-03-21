"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Car,
    Settings,
    Calendar,
    MapPin,
    MessageSquare,
    Activity,
    User,
    Hash
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RequestDetailsDialogProps {
    request: any | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function RequestDetailsDialog({
    request,
    isOpen,
    onOpenChange
}: RequestDetailsDialogProps) {
    if (!request) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl w-full p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl">
                <div className="flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="relative p-8 space-y-8">
                        <DialogHeader className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-widest text-[10px] font-black px-3 py-1">
                                        Audit Specification
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                        <Hash className="size-2.5" /> {request.id.substring(0, 12)}
                                    </div>
                                </div>
                                <DialogTitle className="text-4xl font-black text-slate-900 tracking-tight leading-tight text-left">
                                    {request.partName}
                                </DialogTitle>
                            </div>
                            <Separator className="bg-slate-100" />
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4">
                            <SpecItem
                                icon={Car}
                                label="Vehicle Identity"
                                value={request.vehicleBrand}
                                subtext={request.modelYear}
                            />
                            <SpecItem
                                icon={Settings}
                                label="OEM Index"
                                value={request.oemNumber || "NOT SPECIFIED"}
                                highlight={!!request.oemNumber}
                            />
                            <SpecItem
                                icon={Calendar}
                                label="Deployment Date"
                                value={new Date(request.createdAt).toLocaleDateString()}
                                subtext={new Date(request.createdAt).toLocaleTimeString()}
                            />
                            <SpecItem
                                icon={Activity}
                                label="Network Status"
                                value={request.status === 'open' ? "Active Demand" : "Archived Flow"}
                                active={request.status === 'open'}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare className="size-4 text-blue-600" /> Demand Analytics
                            </h3>
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400 font-medium">Market Traction</p>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-black text-[10px]">
                                        {request.quotes?.length || 0} Competitive Quotes
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 font-medium">Original Memo</p>
                                    <p className="text-sm text-slate-700 leading-relaxed italic">
                                        "{request.description || "No attached documentation for this node."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User className="size-4 text-emerald-600" /> Source Node
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <MapPin className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Regional Origin</p>
                                        <p className="text-lg font-black text-slate-900">{request.wilaya || "Global Distribution"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 text-center border-t border-slate-50">
                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                                Broadcast Signal: {request.id} | MLILA Data Audit v4.1
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function SpecItem({ icon: Icon, label, value, subtext, highlight, active }: any) {
    return (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100 transition-colors border-l-4 border-l-primary/30">
            <div className="flex items-center gap-2">
                <Icon className="size-3.5 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="space-y-0.5">
                <p className={cn(
                    "text-sm font-black tracking-tight",
                    highlight ? "text-primary" : active ? "text-emerald-600" : "text-slate-900"
                )}>
                    {value}
                </p>
                {subtext && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subtext}</p>}
            </div>
        </div>
    )
}
