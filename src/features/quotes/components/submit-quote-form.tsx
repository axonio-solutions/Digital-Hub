import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { quoteSchema, type QuoteInput } from "@/types/quote-schemas"
import { createQuoteServerFn } from "@/fn/quotes"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
import { Label } from "../../../components/ui/label"

interface SubmitQuoteFormProps {
    requestId: string
    sellerId: string
    onSuccess: () => void
}

export function SubmitQuoteForm({ requestId, sellerId, onSuccess }: SubmitQuoteFormProps) {
    const queryClient = useQueryClient()

    const form = useForm<QuoteInput>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            requestId,
            sellerId,
            price: 0,
            condition: "used",
            warranty: "",
        },
    })

    const { mutate: submitQuote, isPending } = useMutation({
        mutationFn: async (values: QuoteInput) => {
            const res = await createQuoteServerFn({ data: values })
            return res
        },
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Quote submitted successfully!")
                queryClient.invalidateQueries({ queryKey: ["requests"] })
                onSuccess()
            } else {
                toast.error("Failed to submit quote", {
                    description: res.error || "Please try again later."
                })
            }
        },
        onError: (err) => {
            console.error(err)
            toast.error("Failed to submit quote", {
                description: "An unexpected error occurred."
            })
        },
    })

    function onSubmit(values: QuoteInput) {
        submitQuote(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Condition</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <RadioGroupItem value="new" id="cond-new" />
                                        <Label htmlFor="cond-new" className="cursor-pointer">Brand New</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <RadioGroupItem value="used" id="cond-used" />
                                        <Label htmlFor="cond-used" className="cursor-pointer">Used (Casse)</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Price (DZD)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 15000"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                        className="pl-4 pr-12 text-lg font-medium h-12"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                        DZD
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="warranty"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warranty details (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. 3 days test, 1 year manufacturer"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isPending ? "Submitting Quote..." : "Submit Quote to Buyer"}
                </Button>
            </form>
        </Form>
    )
}
