# Premium Theme System

This project uses a custom, high-performance theme system built with React Context, Tailwind CSS v4, and native CSS variables.

## Features

- **SSR Friendly**: Includes a blocking script in the `<head>` to prevent hydration flickers.
- **System Sync**: Automatically detects and reacts to system color scheme preferences.
- **Premium Transitions**: Smooth, performant transitions for background and text colors.
- **Semantic Tokens**: Uses standard Shadcnd/UI-like semantic tokens (background, foreground, primary, etc.).

## Usage

### Theme Context

The `ThemeContext` provides access to the current theme and a function to update it.

```tsx
import { useTheme } from "@/components/theme-provider"

const { theme, setTheme } = useTheme()

// theme can be "light", "dark", or "system"
setTheme("dark")
```

### CSS Variables

All themed colors are defined as CSS variables in `src/styles.css`.

| Variable | Description |
| :--- | :--- |
| `--background` | Page background color |
| `--foreground` | Main text color |
| `--primary` | Primary action color |
| `--muted` | Subdued background elements |
| `--border` | Default border color |

### Components

- `ThemeProvider`: Wraps the application (already in `__root.tsx`).
- `ThemeToggle`: A toggle button with an interactive dropdown for switching themes.

## SSR Implementation

To prevent the "flash of un-themed content" (FOUTC), we inject a script into the document head in `src/routes/__root.tsx`. This script runs before React hydrates, ensuring the `dark` class is applied based on the user's stored preference or system setting.

```html
<script>
  (function() {
    const theme = localStorage.getItem("mlila-ui-theme");
    const supportDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (theme !== "light" && supportDarkMode)) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```
