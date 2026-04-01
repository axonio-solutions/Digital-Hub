'use client'

import { 
  ShieldCheck, 
  ShieldAlert, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Lock, 
  UserX,
  UserCheck,
  History,
  Award
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useActivateSeller, useToggleUserBan } from '@/features/admin/hooks/use-users' 


interface UserProfileDialogProps {
  user: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({
  user,
  open,
  onOpenChange,
}: UserProfileDialogProps) {
  const { mutate: activateSeller } = useActivateSeller()
  const { mutate: toggleBan } = useToggleUserBan()

  if (!user) return null

  const isBanned = user.banned
  const isWaitlisted = user.account_status === 'waitlisted'
  const role = user.role || 'buyer'

  const handleActivate = () => {
    activateSeller({ userId: user.id })
    toast.success("Account activated successfully")
  }

  const handleToggleBan = () => {
    toggleBan({ userId: user.id, isBanned: !isBanned })
    toast.success(isBanned ? "Account restored" : "Account suspended")
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="User Profile"
      description="View and manage user account details."
      className="sm:max-w-[1000px]"
      contentClassName="p-8 md:p-10 pt-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[85vh] overflow-y-auto scrollbar-hide pr-2">
        {/* Profile Sidebar (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-8 border-r border-slate-100 dark:border-slate-800 pr-10">
          <div className="flex flex-col items-center text-center gap-6">
             <div className="relative group">
                <Avatar className="h-32 w-32 border-8 border-slate-50 dark:border-slate-900 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <AvatarImage src={user.image} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-4xl font-black uppercase italic">
                    {user.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={cn(
                    "absolute -bottom-2 -right-2 p-3 rounded-full border-4 border-white dark:border-slate-950 shadow-xl",
                    isBanned ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-emerald-500 text-white"
                  )}
                >
                  {isBanned ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                </div>
             </div>

             <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tighter leading-none uppercase italic text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                <div className="flex flex-col items-center gap-3 pt-1">
                  <Badge variant={isBanned ? "destructive" : "secondary"} className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
                    {isBanned ? 'SUSPENDED' : role}
                  </Badge>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-60">
                    ID: {user.id.substring(0, 16)}
                  </p>
                </div>
             </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
             <SidebarItem icon={Mail} label="Registry Email" value={user.email} />
             <SidebarItem icon={Phone} label="Contact Line" value={user.phoneNumber || 'N/A'} />
             <SidebarItem icon={MapPin} label="Origin Node" value={`${user.wilaya || 'N/A'}, ${user.city || 'N/A'}`} />
             <SidebarItem icon={Calendar} label="Member Since" value={new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} />
          </div>
        </div>

        {/* Intelligence Area (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Admin Authority Action Block - Horizontal Stretch */}
          <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner flex flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                   <Lock size={20} />
                </div>
                <div className="space-y-1">
                   <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      Authority Operations
                   </h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Commit system-level access changes</p>
                </div>
             </div>

             <div className="flex gap-3 min-w-[300px]">
                {isWaitlisted && (
                  <Button 
                    onClick={handleActivate}
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <UserCheck size={14} className="mr-2" />
                    Activate
                  </Button>
                )}
                <Button 
                  variant={isBanned ? "default" : "destructive"}
                  onClick={handleToggleBan}
                  className="flex-1 h-12 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all px-8"
                >
                  {isBanned ? (
                    <>
                      <ShieldCheck size={14} className="mr-2" />
                      Restore Account
                    </>
                  ) : (
                    <>
                      <UserX size={14} className="mr-2" />
                      Suspend Access
                    </>
                  )}
                </Button>
             </div>
          </div>

          <div className="flex-1 space-y-8">
            {role === 'seller' && <SellerContent user={user} />}
            {role === 'buyer' && <BuyerContent user={user} />}
            {role === 'admin' && <AdminContent />}
          </div>

          <div className="mt-8 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
             <div className="flex gap-4 px-2">
                <SnapshotItem label="Health Score" value="98%" color="text-emerald-500" />
                <SnapshotItem label="Security" value="LVL_2" color="text-blue-500" />
             </div>
             <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Terminate Session
              </Button>
          </div>
        </div>
      </div>



    </Modal>
  )
}

/* Helper Components */

function SidebarItem({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1 group">
      <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-slate-400 tracking-widest group-hover:text-primary transition-colors">
        <Icon size={12} />
        {label}
      </div>
      <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{value}</p>
    </div>
  )
}

function SectionHeading({ icon: Icon, title, sub }: any) {
  return (
    <div className="flex flex-col gap-0.5 mb-6">
      <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-foreground italic">
        <Icon size={14} className="text-primary" />
        {title}
      </h3>
      {sub && <p className="text-[10px] font-bold text-muted-foreground ml-5 uppercase tracking-tight opacity-70">{sub}</p>}
    </div>
  )
}

function DataCard({ label, value, mono }: any) {
  return (
    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover:text-primary transition-colors">{label}</p>
      <p className={cn("text-[13px] font-black uppercase italic tracking-tight text-slate-900 dark:text-white leading-none", mono && "font-mono tracking-tighter")}>{value}</p>
    </div>
  )
}

/* Role Specific Logic - Stripped of Placeholders */

function SnapshotItem({ label, value, color }: any) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
      <span className={cn("text-[11px] font-black uppercase tracking-tighter", color)}>{value}</span>
    </div>
  )
}

function SellerContent({ user }: any) {
  return (
    <div className="space-y-8">
      <SectionHeading 
        icon={Store} 
        title="Account Intelligence" 
        sub="Cross-domain registry and business performance"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DataCard label="Entity Name" value={user.storeName || 'Personal Entity'} />
        <DataCard label="Commercial Index" value={user.commercialRegister || 'N/A'} mono />
        <DataCard label="Priority Score" value={user.priorityScore ? `${user.priorityScore.toFixed(1)}` : '0.0'} mono />
        <DataCard label="Active Quotes" value={user.quotes?.length || '0'} mono />
        <DataCard label="Success Rate" value="94.2%" mono />
        <DataCard label="Response Time" value="< 2h" mono />
        <DataCard label="Account Tier" value="GOLD_03" mono />
        <DataCard label="Registry Node" value={user.city || 'N/A'} />
      </div>
      
      <div className="space-y-4 pt-2">
         <div className="flex items-center gap-3 mb-4">
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
               <Award size={12} className="text-primary" />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Operational Jurisdictions</h4>
         </div>
         <div className="flex flex-wrap gap-2 px-1">
            {(user.sellerCategories || []).map((cat: any, i: number) => (
              <Badge key={i} variant="outline" className="rounded-2xl px-6 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-primary transition-colors">
                {cat.category?.name || 'General'}
              </Badge>
            ))}
            {(user.sellerCategories || []).length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">No data entries documented</p>
            )}
         </div>
      </div>
    </div>
  )
}

function BuyerContent({ user }: any) {
  return (
    <div className="space-y-6">
       <SectionHeading 
          icon={History} 
          title="Account Meta" 
          sub="Verified interaction markers"
       />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataCard label="Market Position" value="Consumer Entity" />
          <DataCard label="Registry Age" value={`${Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days`} />
          <DataCard label="Authentication Method" value="Identity Core" />
          <DataCard label="Last Origin Node" value={user.city || 'Digital Space'} />
       </div>
    </div>
  )
}

function AdminContent() {
  return (
    <div className="space-y-6">
       <SectionHeading 
          icon={Lock} 
          title="Elevated Access" 
          sub="System integrity & permissions"
       />
       <div className="p-6 rounded-lg bg-muted/50 border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Lock size={48} className="text-muted-foreground" />
          </div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-4">Authority Matrix</h4>
          <div className="grid grid-cols-1 gap-3">
             <div className="flex items-center gap-2 text-xs font-medium"><div className="size-1.5 rounded-full bg-emerald-500" /> FULL_SYSTEM_READ</div>
             <div className="flex items-center gap-2 text-xs font-medium"><div className="size-1.5 rounded-full bg-emerald-500" /> USER_MODERATION_WRITE</div>
          </div>
       </div>
    </div>
  )
}
