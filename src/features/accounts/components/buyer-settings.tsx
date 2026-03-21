import { useAuth } from "@/features/auth/hooks/use-auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfileSchema, UpdateProfileInput } from "../validation/account-schemas"
import { updateProfileServerFn } from "@/fn/users"
import { toast } from "sonner"
import { useEffect } from "react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin } from "lucide-react"

const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annabba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"
];

export function BuyerSettings() {
    const queryClient = useQueryClient()
    const { data: user } = useAuth()

    const form = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            userId: user?.id || "",
            wilaya: user?.wilaya || "",
            city: user?.city || "",
            address: user?.address || "",
            whatsappNumber: user?.whatsappNumber || "",
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                userId: user.id,
                wilaya: user.wilaya || "",
                city: user.city || "",
                address: user.address || "",
                whatsappNumber: user.whatsappNumber || "",
            })
        }
    }, [user, form])

    const { mutate: updateProfile, isPending } = useMutation({
        mutationFn: async (values: UpdateProfileInput) => {
            return await (updateProfileServerFn as any)({ data: values })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] })
            toast.success("Delivery Saved", {
                description: "Your delivery preferences have been updated."
            })
        },
        onError: () => {
            toast.error("Update Failed")
        }
    })

    function onSubmit(values: UpdateProfileInput) {
        updateProfile(values)
    }

    return (
        <Card className="border-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery & Communication
                </CardTitle>
                <CardDescription>
                    Your location helps sellers provide accurate shipping estimates.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="wilaya"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wilaya</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Wilaya" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {WILAYAS.map(w => (
                                                    <SelectItem key={w} value={w}>{w}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Kouba" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Street, Building, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="whatsappNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+213..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Delivery Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
