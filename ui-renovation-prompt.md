# UI Generator Prompt for MLILA App

*(Copy and paste the text below into your preferred UI generator like v0 by Vercel, Lovable, Bolt.new, or Galileo AI)*

***

**System Context & App Description:**
You are an expert UX/UI designer and frontend engineer. I am building "MLILA", a modern B2B/B2C Automotive Spare Parts Marketplace. Our platform connects buyers (garages, mechanics, individuals needing parts) with sellers (auto part suppliers, junkyards, dealerships). We use a "Pull" marketplace model where buyers post requests and sellers bid or send offers.

**Design Aesthetic Requirements:**
I need you to generate a modern, premium, and cohesive UI for my application using React and Tailwind CSS. 
- **Style:** Use a sleek, premium aesthetic. Beautiful typography (Inter, Geist, or modern sans-serif), subtle glassmorphism effects, precise OKLCH colors, and ample whitespace. 
- **Dark/Light Mode:** Provide a design that either excels in an elegant light mode with subtle gray/zinc borders, or a very sleek, high-contrast dark mode.
- **Interactivity:** Elements should feel alive. Include hover states, focus rings round inputs, and subtle elevation/shadow transitions on cards.
- **Realism:** Use realistic automotive data placeholders (e.g., "2020 Toyota Camry Brake Pads", "OEM Alternator", "Requires VIN"). 

Please generate the UI for the following core routes and screens. Generate them one by one or as a unified dashboard application:

## 1. Landing Page (`/`)
- A modern, high-impact hero section with a strong value proposition: "Find the exact auto part you need, or get competitive quotes from top suppliers."
- Dual Call to Actions (CTAs): "Post a Part Request" (Buyer) and "Start Selling" (Seller).
- A visually appealing "How it Works" section (Post Request -> Get Quotes -> Choose Best Offer).
- A clean, minimal footer.

## 2. Authentication & Onboarding
- **Auth Modals (`/login`, `/register`)**: Clean card-based login with SSO buttons (Google, Apple) and email magic links. 
- **Complete Registration (`/authed/complete-registration`)**: A sleek multi-step wizard. Users select if they are a Buyer or Seller, input their company details, and upload verification documents.

## 3. Explore / Marketplace Feed (`/explore`)
- A public or semi-public feed showing active "Parts Requests" from buyers.
- **Layout**: A responsive grid (3 cards per row on desktop).
- **Request Cards**: Each card displays vehicle details (Make, Model, Year), the specific part requested, urgency/tag, and a primary "Send Offer" button.
- **Filters**: A sleek sidebar or top bar to filter by Car Make, Part Category, and Condition (New/Used).

## 4. Main Dashboard Overview (`/dashboard`)
- A highly visual summary page for logged-in users with a sleek top navigation/sidebar structure.
- **Buyer View**: Show active requests, new quotes received (with notification badges), and a quick "Add Vehicle to Garage" widget.
- **Seller View**: Show active offers/bids sent, earnings/win-rate summary, and a live feed of recent requests matching their inventory.

## 5. My Garage (`/dashboard/garage`)
- A management view for a buyer's vehicles.
- **Vehicle Cards**: Should feature a nice placeholder car image or silhouette, VIN number, Make, Model, Year, and Engine specs.
- Includes a primary action on each card: "Request Parts for this Vehicle".

## 6. Requests Management (`/dashboard/requests`)
- A sophisticated data table or masonry list view allowing buyers to manage their posted requests.
- Use colored badges for statuses (e.g., "Pending Quotes" [Yellow], "Quotes Received" [Green], "Resolved" [Gray]).
- **Request Details Dialog**: Clicking a request opens a detailed side-panel or wide modal showing the exact request specifications, attached photos, and a sub-list of all received offers from sellers.

## 7. Quotes & Offers Management (`/dashboard/quotes` & `/dashboard/offers`)
- **Offers Table**: A view tracking quotes the seller has provided. Needs to show the quoted price, condition, delivery timeframe, and if the buyer accepted it.
- **"Send Offer" Modal/Dialog**: A highly professional modal for sellers to input pricing, condition (Standard, Aftermarket), brand, and warranty information when responding to a request. Needs clear form validation styling.

## 8. Profile & Admin (`/dashboard/profile` & `/dashboard/admin`)
- User profile management utilizing a vertical tabs layout on the left.
- Sections for Personal Info, Company Details, Notification Preferences, and Payment/Subscription settings.
