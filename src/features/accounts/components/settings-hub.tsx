"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Bell, CreditCard, Settings, Menu, X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-components
import { GeneralInfoForm } from "./general-info-form";
import { SellerSettings } from "./seller-settings";
import { AccountManagement } from "./account-management";

const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notification", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "integrations", label: "Integration", icon: Settings }
];

const integrations = [
    { name: "Google Drive", description: "Storage for documents", icon: "🟢", enabled: true },
    { name: "Slack", description: "Team communication", icon: "🟣", enabled: true },
    { name: "Notion", description: "Project notes", icon: "⚫", enabled: false },
    { name: "Github", description: "Code repository", icon: "⚫", enabled: false }
];

export function SettingsHub() {
    const { data: user } = useAuth();
    const [activeSection, setActiveSection] = useState("profile");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeSection) {
            case "profile":
                return <ProfileSection user={user} />;
            case "security":
                return <SecuritySection />;
            case "notifications":
                return <NotificationsSection />;
            case "billing":
                return <BillingSection />;
            case "integrations":
                return <IntegrationsSection />;
            default:
                return <ProfileSection user={user} />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-10rem)] gap-8">
            {/* Mobile menu button */}
            <div className="lg:hidden flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Settings</h2>
                <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
                    Menu
                </Button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={cn(
                    "lg:w-64 flex flex-col gap-2 shrink-0 transition-all duration-300",
                    sidebarOpen ? "block" : "hidden lg:flex"
                )}>
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id);
                                setSidebarOpen(false);
                            }}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-sm",
                                activeSection === item.id
                                    ? "bg-primary text-primary-foreground scale-[1.02] shadow-primary/20"
                                    : "bg-white border hover:bg-slate-50 text-muted-foreground hover:text-foreground"
                            )}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    );
                })}
            </aside>

            {/* Content Area */}
            <main className="flex-1 max-w-4xl">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

function ProfileSection({ user }: { user: any }) {
    const role = user?.role || 'buyer';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Personal Information</h1>
                <p className="text-muted-foreground">Manage your identity and contact details across the platform.</p>
            </div>

            <GeneralInfoForm />

            {role === 'seller' && (
                <div className="space-y-8 pt-8 border-t">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Store Profile</h2>
                        <p className="text-muted-foreground text-sm">Manage your business identity as a seller.</p>
                    </div>
                    <SellerSettings />
                </div>
            )}
        </div>
    );
}

function SecuritySection() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Account Security</h1>
                <p className="text-muted-foreground">Protect your account with strong passwords and multi-factor authentication.</p>
            </div>
            <AccountManagement />
        </div>
    );
}

function NotificationsSection() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Notification Preferences</h1>
                <p className="text-muted-foreground">Control when and how you receive updates about your requests and quotes.</p>
            </div>

            <Card className="border-primary/5 shadow-sm">
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold">Desktop Notifications</h3>
                            <p className="text-muted-foreground text-sm">Get real-time alerts shown in the corner of your screen.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-bold">Messaging Alerts</h3>
                        <RadioGroup defaultValue="mentions" className="space-y-4">
                            <div className="flex items-start space-x-3 bg-slate-50/50 p-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                <RadioGroupItem value="all" id="all" className="mt-1" />
                                <div>
                                    <Label htmlFor="all" className="font-bold cursor-pointer">All Activity</Label>
                                    <p className="text-muted-foreground text-xs leading-relaxed">Notify me for every new quote or update on my requests.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 bg-slate-50/50 p-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                <RadioGroupItem value="mentions" id="mentions" className="mt-1" />
                                <div>
                                    <Label htmlFor="mentions" className="font-bold cursor-pointer">Direct Impacts</Label>
                                    <p className="text-muted-foreground text-xs leading-relaxed">Only alert me when a quote is accepted or my account is mentioned.</p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold">Email Digest</h3>
                            <p className="text-muted-foreground text-sm">Receive a daily summary of missed activity.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function BillingSection() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Billing & Payments</h1>
                <p className="text-muted-foreground">Manage your payment methods and view your transaction history.</p>
            </div>

            <Card className="border-primary/10 overflow-hidden shadow-sm">
                <div className="bg-emerald-50/50 p-6 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm text-emerald-600">
                            <TrendingUp className="size-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-emerald-900">Standard Marketplace Plan</h3>
                                <Badge className="bg-emerald-200 text-emerald-800 border-none shadow-none text-[10px] uppercase font-bold">Free Tier</Badge>
                            </div>
                            <p className="text-emerald-700/70 text-sm">Enjoy zero commission on your first 10 successful transactions.</p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-emerald-200 hover:bg-emerald-100/50 text-emerald-700">Explore Pro</Button>
                </div>
                <CardContent className="p-0">
                    <div className="p-6 space-y-4">
                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Payment Methods</h4>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dashed hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <CreditCard className="size-5 text-muted-foreground" />
                                <span className="text-sm font-bold text-muted-foreground">No payment cards linked yet</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary font-bold">Add Card</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/5 shadow-sm">
                <CardHeader>
                    <CardTitle>History</CardTitle>
                    <CardDescription>Records of your marketplace fees and successful deals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                        <CreditCard className="size-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No transaction history found</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function IntegrationsSection() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">App Integrations</h1>
                <p className="text-muted-foreground">Connect your account with external tools to automate your workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((app) => (
                    <Card key={app.name} className="border-primary/5 hover:border-primary/20 transition-all group shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-4xl filter group-hover:drop-shadow-sm transition-all">{app.icon}</div>
                                <Switch defaultChecked={app.enabled} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{app.name}</h3>
                                <p className="text-muted-foreground text-xs leading-relaxed">{app.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
