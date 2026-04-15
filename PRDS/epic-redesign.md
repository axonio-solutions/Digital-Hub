# Milestone: Marketplace V2 Redesign & Hardening

## 1. Codebase Cleanup & Architecture
* Remove all unnecessary, unused, and redundant files across the project.
* Strictly enforce the existing folder architecture (do not create new root folders).

## 2. Security & Route Guarding
* Implement strict route guarding.
* Role-based actions: On the Explore Page, ONLY users with the 'Seller' role can see or click the "Send Quote" button.
* Buyers and Admins must be explicitly blocked from quoting on public requests.

## 3. UI/UX Theming & Navbar
* Create a highly modern, premium color theme and design system.
* Build a dynamic Navigation Bar that changes state based on authentication and displays the user's profile information.

## 4. Explore Page Redesign
* Completely redesign the public Explore page with a focus on premium UI/UX.
* Dynamic Status UI: Request cards must adapt their UI based on the project's actual status (e.g., Open, Quoted, Closed).
* Performance Priority: The page must load instantly. Utilize proper TanStack Query caching, SSR, and lightweight DOM elements.