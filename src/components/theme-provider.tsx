"use client"

import * as React from "react"

export type Theme = "dark" | "light" | "system"

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "mlila-ui-theme",
  ...props
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = React.useState<Theme>(
    () => {
      try {
        if (typeof window !== "undefined") {
          return (localStorage.getItem(storageKey) as Theme) || defaultTheme
        }
      } catch (e) {
        // Handle potential security/storage errors
      }
      return defaultTheme
    }
  )

  const applyTheme = React.useCallback((newTheme: Theme) => {
    const root = window.document.documentElement
    
    // 1. Disable transitions to prevent lag/flashes
    root.classList.add("no-transitions")
    
    // 2. Perform the actual theme switch
    root.classList.remove("light", "dark")
    
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }

    // 3. Force a reflow to ensure the theme is applied without transitions
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    window.getComputedStyle(root).opacity

    // 4. Re-enable transitions in the next frame
    requestAnimationFrame(() => {
      root.classList.remove("no-transitions")
    })
  }, [])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    applyTheme(theme)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, applyTheme])

  const value = React.useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }), [theme, storageKey])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (!context)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
