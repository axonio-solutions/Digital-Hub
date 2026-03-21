"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusIcon, XIcon, Loader2, UploadCloud, Car } from "lucide-react";
import { productFormSchema, type ProductFormData } from "../validation/product-schemas";
import { useCreateRequest } from "../hooks/use-requests";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface NewPartRequestFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function NewPartRequestForm({ onSuccess, onCancel }: NewPartRequestFormProps) {
    const { data: user } = useAuth();
    const createRequest = useCreateRequest();

    const [newCategory, setNewCategory] = useState("");
    const [variations, setVariations] = useState<Array<{ type: string; value: string }>>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema) as any,
        defaultValues: {
            partName: "",
            description: "",
            status: "published",
            vehicleBrand: "",
            vehicleModel: "",
            modelYear: "",
            categories: [],
            tags: [],
            variations: [],
            expectedPrice: "",
            budgetType: "negotiable",
            template: "default",
        }
    });

    const categories = watch("categories") || [];

    const onSubmit = (data: any) => {
        if (!user?.id) {
            toast.error("You must be logged in to create a request");
            return;
        }

        createRequest.mutate({
            buyerId: user.id,
            partName: data.partName,
            vehicleBrand: data.vehicleBrand,
            modelYear: `${data.vehicleModel} ${data.modelYear}`, // Combining for compatibility with existing schema if needed
            notes: data.description,
            // In a real app, we'd handle images and extra fields here
        }, {
            onSuccess: () => {
                toast.success("Part request submitted successfully!");
                onSuccess?.();
            },
            onError: (error) => {
                toast.error("Failed to submit request: " + (error as any).message);
            }
        });
    };

    const addCategory = () => {
        const currentCategories = watch("categories") || [];
        if (newCategory && !currentCategories.includes(newCategory)) {
            const updatedCategories = [...currentCategories, newCategory];
            setValue("categories", updatedCategories);
            setNewCategory("");
        }
    };

    const removeCategory = (category: string) => {
        const currentCategories = watch("categories") || [];
        const updatedCategories = currentCategories.filter((c) => c !== category);
        setValue("categories", updatedCategories);
    };

    const addVariation = () => {
        const newVariation = { type: "Condition", value: "" };
        const updatedVariations = [...variations, newVariation];
        setVariations(updatedVariations);
        setValue("variations", updatedVariations);
    };

    const removeVariation = (index: number) => {
        const updatedVariations = variations.filter((_, i) => i !== index);
        setVariations(updatedVariations);
        setValue("variations", updatedVariations);
    };

    const updateVariation = (index: number, field: "type" | "value", value: string) => {
        const updatedVariations = variations.map((variation, i) =>
            i === index ? { ...variation, [field]: value } : variation
        );
        setVariations(updatedVariations);
        setValue("variations", updatedVariations);
    };

    return (
        <div className="mx-auto max-w-full space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* General Section */}
                        <Card className="shadow-none border-muted-foreground/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Part Information</CardTitle>
                                <CardDescription>Specify what part you need and add details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="partName">
                                        Part Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="partName" placeholder="e.g. Brake Pads, Front Bumper" {...register("partName")} />
                                    {errors.partName && <p className="text-sm text-red-500">{errors.partName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Detailed Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide any specific details, OEM numbers, or special requirements."
                                        className="min-h-[120px]"
                                        {...register("description")}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description.message}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Details Section */}
                        <Card className="shadow-none border-muted-foreground/20 text-md">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Car className="size-5" />
                                    Vehicle Specification
                                </CardTitle>
                                <CardDescription>Crucial information for sellers to find the correct parts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicleBrand">Brand <span className="text-red-500">*</span></Label>
                                        <Input id="vehicleBrand" placeholder="Toyota, VW, etc." {...register("vehicleBrand")} />
                                        {errors.vehicleBrand && <p className="text-sm text-red-500">{errors.vehicleBrand.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicleModel">Model <span className="text-red-500">*</span></Label>
                                        <Input id="vehicleModel" placeholder="Camry, Golf, etc." {...register("vehicleModel")} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="modelYear">Year <span className="text-red-500">*</span></Label>
                                        <Input id="modelYear" placeholder="2018" {...register("modelYear")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vinNumber">VIN Number (Optional)</Label>
                                        <Input id="vinNumber" placeholder="Chassis No." {...register("vinNumber")} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Section */}
                        <Card className="shadow-none border-muted-foreground/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Part Reference Photos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center cursor-pointer hover:bg-primary/10 transition-colors">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-primary/60">
                                        <UploadCloud className="size-8" />
                                    </div>
                                    <p className="text-primary font-medium">Drop photos here to upload</p>
                                    <p className="text-xs text-muted-foreground mt-2">Take a photo of your old part or your vehicle's license plate.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variation Section */}
                        <Card className="shadow-none border-muted-foreground/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Extra Specifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <Label>Additional Attributes</Label>
                                    {variations.map((variation, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Select
                                                value={variation.type}
                                                onValueChange={(value) => updateVariation(index, "type", value)}>
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Condition">Condition</SelectItem>
                                                    <SelectItem value="Origin">Part Origin</SelectItem>
                                                    <SelectItem value="Location">Localisation</SelectItem>
                                                    <SelectItem value="Urgency">Urgency</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="e.g. Broken but repairable"
                                                value={variation.value}
                                                onChange={(e) => updateVariation(index, "value", e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeVariation(index)}>
                                                <XIcon className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                                        <PlusIcon className="size-4 mr-2" /> Add attribute
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-4">
                        {/* Status Section */}
                        <Card className="shadow-none border-muted-foreground/20 bg-muted/20">
                            <CardHeader className="pb-3 border-b border-muted">
                                <CardTitle className="flex items-center gap-2 text-md">
                                    Request Status
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <Select defaultValue="published" onValueChange={(val: any) => setValue("status", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Immediate Broadcast</SelectItem>
                                        <SelectItem value="draft">Save as Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">"Broadcasting" sends your request to verified sellers instantly.</p>
                            </CardContent>
                        </Card>

                        {/* Pricing Section */}
                        <Card className="shadow-none border-muted-foreground/20">
                            <CardHeader>
                                <CardTitle className="text-md">Budget Preference</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="expectedPrice">Target Price (DZD)</Label>
                                    <Input id="expectedPrice" placeholder="Optional budget" {...register("expectedPrice")} />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold">Budget Flexibility</Label>
                                    <RadioGroup defaultValue="negotiable" className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="negotiable" id="negotiable" onClick={() => setValue("budgetType", "negotiable")} />
                                            <Label htmlFor="negotiable" className="font-normal text-sm">Negotiable</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="fixed" id="fixed" onClick={() => setValue("budgetType", "fixed")} />
                                            <Label htmlFor="fixed" className="font-normal text-sm">Strict Budget</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Categories Section */}
                        <Card className="shadow-none border-muted-foreground/20">
                            <CardHeader>
                                <CardTitle className="text-md">Tags & Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.length === 0 && <span className="text-xs text-muted-foreground italic underline">No tags added yet...</span>}
                                        {categories.map((category) => (
                                            <Badge
                                                key={category}
                                                variant="secondary"
                                                className="bg-primary/10 text-primary border-primary/20">
                                                <XIcon
                                                    className="size-3 mr-1 cursor-pointer"
                                                    onClick={() => removeCategory(category)}
                                                />
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Input
                                            placeholder="Fast delivery..."
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className="flex-1 text-xs h-8"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addCategory} className="h-8 text-xs">
                                            <PlusIcon className="size-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-muted">
                    <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground">
                        Cancel
                    </Button>
                    <Button type="submit" className="px-8 shadow-sm" disabled={createRequest.isPending}>
                        {createRequest.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Submit Request"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
