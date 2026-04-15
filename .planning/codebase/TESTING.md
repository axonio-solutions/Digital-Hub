# Testing

## Frameworks & Tools
- **Unit & Integration:** Governed by `vitest` which allows high-speed execution aligned naturally with Vite's module resolution.
- **Component Testing:** Managed with `@testing-library/react` and a `jsdom` testing environment to simulate browser runtimes.

## Structure and Patterns
- Test cases live adjacent to their definitions or within localized feature directories, maintaining the proximity convention of the project.
- Mocks and Spies: Defer to Vitest's intrinsic `vi` utilities for mocking network requests and database responses during unit execution.
- Complex end-to-end (E2E) testing appears undocumented in the primary dependencies, indicating reliance primarily on fast, lightweight component tests presently.
