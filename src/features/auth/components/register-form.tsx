import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerSchema, RegisterInput } from "@/types/auth-schemas"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Store, User } from "lucide-react"

export function RegisterForm() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            role: "buyer",
            phoneNumber: "",
            storeName: "",
            companyAddress: "",
            commercialRegister: "",
        },
    })

    const role = form.watch("role")

    const { mutate: register, isPending } = useMutation({
        mutationFn: async (values: RegisterInput) => {
            const { role, ...rest } = values;
            
            // Map the frontend 'role' to 'user_type' to bypass Better Auth's strict admin 
            // plugin restriction on sending 'role' directly from the client.
            const payload = {
                ...rest,
                user_type: role,
            };
            
            const result = await authClient.signUp.email(payload);
            if (result.error) {
                throw new Error(result.error.message || "Registration failed");
            }
            return result;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["auth"] })
            toast.success("Account created successfully!", {
                description: "Welcome. Redirecting..."
            })
            setTimeout(() => {
                navigate({ to: "/dashboard" });
            }, 1000);
        },
        onError: (error: Error) => {
            toast.error("Registration Error", {
                description: error.message || "Please try again."
            })
        },
    })

    function onSubmit(values: RegisterInput) {
        register(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Account Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="buyer" className="sr-only" />
                                        </FormControl>
                                        <FormLabel
                                            className={cn(
                                                "flex flex-col items-center justify-center space-y-2 rounded-xl p-4 cursor-pointer transition-all border-2",
                                                field.value === 'buyer' ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" : "border-muted hover:bg-muted/50"
                                            )}
                                        >
                                            <User className={cn("w-6 h-6", field.value === 'buyer' ? "text-primary" : "text-muted-foreground")} />
                                            <span className="font-semibold text-sm text-center">Buyer</span>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="seller" className="sr-only" />
                                        </FormControl>
                                        <FormLabel
                                            className={cn(
                                                "flex flex-col items-center justify-center space-y-2 rounded-xl p-4 cursor-pointer transition-all border-2",
                                                field.value === 'seller' ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" : "border-muted hover:bg-muted/50"
                                            )}
                                        >
                                            <Store className={cn("w-6 h-6", field.value === 'seller' ? "text-primary" : "text-muted-foreground")} />
                                            <span className="font-semibold text-sm text-center">Seller</span>
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="0550112233" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {role === 'seller' && (
                    <div className="space-y-4 pt-4 border-t border-dashed mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <FormField
                            control={form.control}
                            name="storeName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Store Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Garage" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="companyAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="City, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="commercialRegister"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RC Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="RC 24/00-1234567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={isPending}>
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create {role === 'seller' ? "Seller" : "Buyer"} Account
                </Button>
            </form>
        </Form>
    )
}
