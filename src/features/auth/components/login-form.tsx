import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { loginSchema, LoginInput } from "@/types/auth-schemas"
import { toast } from "sonner"
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
import { Loader2 } from "lucide-react"

export function LoginForm() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { mutate: login, isPending } = useMutation({
        mutationFn: async (values: LoginInput) => {
            const result = await authClient.signIn.email(values);
            if (result.error) {
                throw new Error(result.error.message || "Login failed");
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            toast.success("Welcome back!", {
                description: "Redirecting to your dashboard..."
            });
            setTimeout(() => {
                navigate({ to: "/dashboard" });
            }, 500);
        },
        onError: (error: Error) => {
            toast.error("Authentication Error", {
                description: error.message || "Please check your email and password."
            });
        },
    })

    function onSubmit(values: LoginInput) {
        login(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full h-11" disabled={isPending}>
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In securely
                </Button>
            </form>
        </Form>
    )
}
