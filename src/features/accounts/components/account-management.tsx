import { useAuth } from "@/features/auth/hooks/use-auth"
import { useMutation } from "@tanstack/react-query"
import { deactivateAccountServerFn, deleteAccountServerFn } from "@/fn/users"
import { toast } from "sonner"
import { AlertTriangle, Trash2, EyeOff, Loader2, Lock, ShieldCheck, Mail, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function AccountManagement() {
    const { data: user } = useAuth()

    const { mutate: deactivate, isPending: isDeactivating } = useMutation({
        mutationFn: async (userId: string) => {
            return await (deactivateAccountServerFn as any)({ data: { userId } })
        },
        onSuccess: () => {
            toast.success("Account Deactivated", {
                description: "You have been logged out. Your data is now hidden."
            })
            window.location.href = "/"
        },
        onError: () => {
            toast.error("Deactivation Failed")
        }
    })

    const { mutate: remove, isPending: isDeleting } = useMutation({
        mutationFn: async (userId: string) => {
            return await (deleteAccountServerFn as any)({ data: { userId } })
        },
        onSuccess: () => {
            toast.success("Account Deleted Permanently", {
                description: "All your data has been purged."
            })
            window.location.href = "/"
        },
        onError: () => {
            toast.error("Deletion Failed")
        }
    })

    const handleDeactivate = () => {
        if (!user?.id) return
        if (confirm("Are you sure? This will hide your profile and log you out.")) {
            deactivate(user.id)
        }
    }

    const handleDelete = () => {
        if (!user?.id) return
        const check = prompt("Type DELETE to confirm permanent deletion:")
        if (check === "DELETE") {
            remove(user.id)
        }
    }

    return (
        <div className="space-y-10">
            {/* Password Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Lock className="size-5 text-primary" />
                    <h2 className="text-xl font-bold">Password</h2>
                </div>
                <Card className="border-primary/5 shadow-sm">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button size="sm" className="font-bold">Update Password</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2FA Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    <h2 className="text-xl font-bold">Two-Step Verification</h2>
                </div>
                <Card className="border-primary/5 shadow-sm">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Smartphone className="size-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Authenticator App</h4>
                                    <p className="text-xs text-muted-foreground">Use Google Authenticator or Authy.</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="font-bold border-primary/20 text-primary">Enable</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Mail className="size-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Email Verification</h4>
                                    <p className="text-xs text-muted-foreground">Codes sent to your registered email.</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-none px-3 py-1 font-bold">Standard</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Destructive Actions */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-destructive" />
                    <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-orange-100 bg-orange-50/20 shadow-none">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base text-orange-900 flex items-center gap-2">
                                <EyeOff className="size-4" /> Deactivation
                            </CardTitle>
                            <CardDescription className="text-xs text-orange-700/70">
                                Temporarily hide your account. You can return anytime.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-white border-orange-200 text-orange-700 hover:bg-orange-50 font-bold"
                                onClick={handleDeactivate}
                                disabled={isDeactivating}
                            >
                                {isDeactivating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deactivate Account"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-red-100 bg-red-50/20 shadow-none">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base text-red-900 flex items-center gap-2">
                                <Trash2 className="size-4" /> Permanent Deletion
                            </CardTitle>
                            <CardDescription className="text-xs text-red-700/70">
                                This action is irreversible. All data will be purged.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full font-bold shadow-lg shadow-red-200"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Forever"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
