import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X, Zap, Clock, Flame, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PLACEHOLDERS = [
  'Search alternators, headlights, bumpers...',
  'OEM number: 820036, 770147...',
  'Peugeot 208, Renault Clio 4...',
  'Find any spare part instantly',
]

const QUICK_CHIPS = [
  { label: 'Renault', icon: Zap },
  { label: 'Peugeot', icon: Zap },
  { label: 'Dacia', icon: Zap },
  { label: 'Volkswagen', icon: Zap },
  { label: 'Engine', icon: Flame },
  { label: 'Brakes', icon: Clock },
  { label: 'Body', icon: Clock },
]

const POPULAR_SEARCHES = [
  'Golf 7 Alternator',
  'Clio 4 Headlight',
  'Symbol Brake Pads',
  'Peugeot 208 Bumper',
  'Dacia Logan Engine',
]

export function NavSearch() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Rotating placeholder
  useEffect(() => {
    if (focused || query) return
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [focused, query])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault()
        if (window.innerWidth >= 768) {
          inputRef.current?.focus()
        } else {
          setMobileOpen(true)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus()
  }, [mobileOpen])

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return
    navigate({ to: '/explore', search: { q: query } as any })
    setMobileOpen(false)
  }, [query, navigate])

  const handleChipClick = useCallback((label: string) => {
    setQuery(label)
    navigate({ to: '/explore', search: { q: label } as any })
    inputRef.current?.blur()
  }, [navigate])

  const handleSuggestionClick = useCallback((term: string) => {
    setQuery(term)
    navigate({ to: '/explore', search: { q: term } as any })
    inputRef.current?.blur()
  }, [navigate])

  const searchContent = (
    <>
      <Search className={cn(
        "ms-4 w-4 h-4 flex-shrink-0 transition-all duration-500 text-muted-foreground",
        focused && "text-primary scale-110 -rotate-12"
      )} />
      <Input
        ref={inputRef}
        id="global-search"
        type="search"
        placeholder={focused || query ? PLACEHOLDERS[placeholderIdx] : 'Search for any spare part...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-10 px-3 placeholder:text-muted-foreground/45 placeholder:transition-opacity placeholder:duration-500"
      />
      {query ? (
        <button
          onClick={() => setQuery('')}
          className="me-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="me-3 hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground/35 bg-muted border border-border/60 group-hover/bar:opacity-100 transition-opacity">
            /
          </kbd>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop: wrapped for dropdown positioning */}
      <div className="flex-1 max-w-2xl mx-auto hidden md:block relative group/bar">
        {/* Search input ring */}
        <div className={cn(
          "flex items-center h-10 rounded-full border transition-all duration-300",
          "bg-muted/50",
          focused
            ? "border-primary/40 bg-background ring-1 ring-primary/10 shadow-[0_0_20px_-4px_rgba(var(--primary)/0.15)]"
            : query
              ? "border-primary/20 bg-background"
              : "border-border hover:border-border/80"
        )}>
          {searchContent}
        </div>

        {/* Dropdown: quick chips + popular searches */}
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden transition-all duration-300 origin-top",
          focused && !query
            ? "opacity-100 scale-y-100 translate-y-0 z-50"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        )}>
          {/* Quick chips */}
          <div className="p-3 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2 px-1">
              Quick Filters
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChipClick(chip.label)}
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold bg-muted hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-150"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border mx-3 my-2" />

          {/* Popular searches */}
          <div className="p-3 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2 px-1">
              Popular Searches
            </p>
            <div className="space-y-0.5">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick(term)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 group/item"
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/item:text-primary/50 transition-colors" />
                    {term}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all duration-200" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile trigger */}
      <button
        className="md:hidden flex-1 flex items-center justify-end"
        onClick={() => setMobileOpen(true)}
        aria-label="Open search"
      >
        <Search className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-background/98 backdrop-blur-xl flex flex-col">
          <div className="flex items-center h-14 px-4 gap-3 border-b border-border">
            <div className={cn(
              "flex-1 flex items-center h-10 rounded-full border transition-all duration-300",
              "bg-muted/50 border-border",
              "focus-within:border-primary/40 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/10",
            )}>
              <Search className="ms-4 w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="search"
                placeholder="Search parts, OEM, brands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/50 px-3"
              />
            </div>
            <button
              onClick={() => { setMobileOpen(false); setQuery('') }}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile quick chips */}
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Quick Filters
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setQuery(chip.label)
                    navigate({ to: '/explore', search: { q: chip.label } as any })
                    setMobileOpen(false)
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-semibold bg-muted hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-150"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-border my-4" />

            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Popular Searches
            </p>
            <div className="space-y-1">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term)
                    navigate({ to: '/explore', search: { q: term } as any })
                    setMobileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                >
                  <Clock className="w-4 h-4 text-muted-foreground/40" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
