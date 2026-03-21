import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralInfoForm } from "./general-info-form"
import { BuyerSettings } from "./buyer-settings"
import { SellerSettings } from "./seller-settings"
import { AccountManagement } from "./account-management"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { User, Shield, Warehouse, Settings } from "lucide-react"

export function ProfileTabs() {
    const { data: user } = useAuth()
    const role = user?.role || 'buyer'

    return (
        <div className="flex flex-col space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-muted-foreground">
                    Manage your profile, preferences, and account security.
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        General
                    </TabsTrigger>

                    {role === 'buyer' && (
                        <TabsTrigger value="buyer" className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4" />
                            Delivery
                        </TabsTrigger>
                    )}

                    {role === 'seller' && (
                        <TabsTrigger value="seller" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Store
                        </TabsTrigger>
                    )}

                    <TabsTrigger value="management" className="flex items-center gap-2 text-destructive data-[state=active]:text-destructive">
                        <Settings className="h-4 w-4" />
                        Manage
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="general">
                        <GeneralInfoForm />
                    </TabsContent>

                    {role === 'buyer' && (
                        <TabsContent value="buyer">
                            <BuyerSettings />
                        </TabsContent>
                    )}

                    {role === 'seller' && (
                        <TabsContent value="seller">
                            <SellerSettings />
                        </TabsContent>
                    )}

                    <TabsContent value="management">
                        <AccountManagement />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
