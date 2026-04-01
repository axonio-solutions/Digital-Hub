import { type ReactNode } from 'react'
import { Badge } from './badge'
import { Card, CardContent } from './card'
import { Clock, LayoutGrid, Star, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Button } from './button'

interface PartCardProps {
  id: string
  title: string
  brand: string
  modelYear: string
  category?: string
  region?: string
  imageUrls?: string[]
  quotesCount?: number
  status?: string
  createdAt: string
  notes?: string
  actionLabel?: string
  actionHref?: string
  onClick?: () => void
  className?: string
}

export function PartCard({
  id,
  title,
  brand,
  modelYear,
  category,
  region,
  imageUrls,
  quotesCount = 0,
  status,
  createdAt,
  notes,
  actionLabel,
  actionHref,
  onClick,
  className,
}: PartCardProps) {
  const isNew = new Date(createdAt).getTime() > Date.now() - 86400000

  return (
    <Card
      className={cn(
        "group p-0 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col h-full ring-0 outline-none",
        className
      )}
    >
      <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden m-0 rounded-t-[inherit]">
        {imageUrls?.[0] ? (
          <img
            src={imageUrls[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <LayoutGrid className="size-12 opacity-20" />
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {quotesCount > 0 && (
            <Badge className="bg-orange-500 text-white border-none font-bold text-[10px] uppercase shadow-lg px-2 py-1">
              Offers Received
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-primary text-white border-none font-bold text-[10px] uppercase shadow-lg px-2 py-1">
              New
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 italic italic">
              {title}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 py-0.5 h-auto px-1.5 rounded-sm">
                {brand}
              </Badge>
              {category && (
                <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-widest border-none px-1.5 py-0.5">
                  {category}
                </Badge>
              )}
              {region && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold uppercase text-[9px] tracking-widest border-none px-1.5 py-0.5">
                  {region}
                </Badge>
              )}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{id.substring(0, 6)}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-xl font-bold text-primary tracking-tighter leading-none">
              {quotesCount}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Quotes</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium line-clamp-2 italic">
          {notes || `Requesting ${title} for ${brand} ${modelYear}.`}
        </p>

        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="size-3.5" />
              <p className="text-[9px] font-bold uppercase tracking-widest">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="size-3 text-orange-400 fill-orange-400" />
              <span className="text-[9px] font-bold uppercase text-slate-500">Premium Grid</span>
            </div>
          </div>

          {(actionHref || onClick) && (
            <div onClick={(e) => {
              if (onClick) {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }
            }}>
              <Link 
                to={actionHref as any} 
                params={id ? { requestId: id } as any : undefined}
                disabled={!actionHref}
              >
                <Button className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl px-5 h-10 flex items-center gap-2 shadow-sm hover:bg-primary hover:text-white transition-all">
                  <span>{actionLabel || (quotesCount > 0 ? 'Review' : 'Details')}</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
