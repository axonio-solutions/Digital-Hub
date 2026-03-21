"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Calendar,
    Car,
    Tag,
    ChevronRight
} from "lucide-react";

interface RequestsGridViewProps {
    data: any[];
    onReview: (request: any) => void;
}

export function RequestsGridView({ data, onReview }: RequestsGridViewProps) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/5 border-muted-foreground/10">
                <Car className="size-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">No demands found in this view.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((req) => {
                const images = req.imageUrls || [];
                const quoteCount = req.quotes?.length || 0;
                const status = req.status;

                return (
                    <Card key={req.id} className="group overflow-hidden shadow-none border-muted-foreground/10 hover:border-primary/30 transition-all flex flex-col">
                        <div className="relative aspect-video bg-muted overflow-hidden flex items-center justify-center">
                            {images.length > 0 ? (
                                <img
                                    src={images[0]}
                                    alt={req.partName}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <Car className="size-10 text-muted-foreground/40" />
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge
                                    variant={status === 'open' ? 'default' : 'secondary'}
                                    className={`text-[9px] uppercase font-bold px-1.5 h-4 shadow-sm ${status === 'open' ? 'bg-blue-500' :
                                            status === 'fulfilled' ? 'bg-green-500 text-white border-none' :
                                                'bg-muted-foreground'
                                        }`}
                                >
                                    {status}
                                </Badge>
                            </div>
                        </div>

                        <CardHeader className="p-4 pb-2 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm line-clamp-1 leading-tight">{req.partName}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Tag className="size-3" />
                                <span className="font-medium">{req.vehicleBrand}</span>
                                <span className="opacity-50">•</span>
                                <span>{req.modelYear}</span>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-0 flex-1">
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted/50">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className={`size-3 ${quoteCount > 0 ? 'text-primary' : 'text-muted-foreground/30'}`} />
                                    <span className={`text-xs font-bold ${quoteCount > 0 ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                                        {quoteCount}
                                    </span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-3 bg-muted/5 border-t border-muted/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-8 text-xs font-semibold group/btn hover:bg-primary/5 hover:text-primary transition-all"
                                onClick={() => onReview(req)}
                            >
                                Review Demands
                                <ChevronRight className="ml-1 size-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
