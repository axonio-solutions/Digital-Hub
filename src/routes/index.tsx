import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  PackageCheck,
  Settings,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 w-full border-border/50">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-foreground">
            MLILA
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link
            to="/"
            hash="how-it-works"
            className="hover:text-blue-600 transition-colors"
          >
            How it Works
          </Link>
          <Link to="/" hash="benefits" className="hover:text-blue-600 transition-colors">
            Benefits
          </Link>
          <Link to="/explore" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Explore Marketplace
          </Link>
          <Link to="/" hash="faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:block h-6 w-px bg-border mx-2" />
          <Link to="/login">
            <Button
              variant="outline"
              className="hidden sm:inline-flex border-slate-300 font-semibold"
            >
              Log in
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {/* Background Decoration */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none -z-10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none -z-10"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

        {/* Hero Section */}
        <section className="w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 md:px-6 z-20">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700 border-none transition-all px-4 py-1 text-sm font-semibold rounded-full">
            <SparkleIcon className="w-4 h-4 mr-2" />
            The First Reverse-Marketplace in Algeria
          </Badge>
          <div className="max-w-[800px] space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              Don't search for parts. <br className="hidden md:block" />
              <span className="text-primary">Let the parts find you.</span>
            </h1>
            <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl font-medium leading-relaxed">
              Buyers post what they need. Verified sellers across Algeria
              compete to give the best quotes. Connect instantly via Call or
              WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-md mx-auto justify-center">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white w-full shadow-lg shadow-blue-500/30 transition-all font-semibold rounded-xl"
              >
                I am a Buyer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register-seller" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base border-2 border-slate-300 hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full transition-all font-semibold rounded-xl text-slate-700"
              >
                I am a Seller
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex items-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex gap-2 items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure
              Verification
            </div>
            <div className="flex gap-2 items-center">
              <Zap className="w-5 h-5 text-amber-500" /> Real-time Quotes
            </div>
            <div className="hidden sm:flex gap-2 items-center">
              <Truck className="w-5 h-5 text-blue-500" /> Direct Delivery
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full py-20 bg-card border-y border-border relative overflow-hidden"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How MLILA Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                A seamless flow designed to get your vehicle back on the road in
                record time.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl"></div>
                <div className="relative h-full bg-background border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md shadow-primary/20">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Request a Part
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Submit the exact details of the spare part you need,
                    including vehicle brand, year, and photos of the broken
                    piece.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl"></div>
                <div className="relative h-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md shadow-indigo-600/20">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Receive Quotes
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Verified Sellers across the network receive your request
                    immediately and respond with competitive quotes (New or
                    Used).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl"></div>
                <div className="relative h-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md shadow-emerald-600/20">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Accept & Connect
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Select the best quote based on price and warranty. Connect
                    directly with the seller via Native Call or WhatsApp to
                    finalize.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Sellers Section */}
        <section
          id="benefits"
          className="w-full py-24 bg-slate-900 text-white overflow-hidden relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/20 px-3 py-1 font-medium border-blue-500/30">
                For Sellers
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Scale your auto parts business exponentially.
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                Stop waiting for foot traffic. Access a live feed of high-intent
                buyers looking exactly for the inventory sitting on your
                shelves.
              </p>

              <ul className="space-y-5">
                <li className="flex items-center gap-4 text-lg text-slate-200">
                  <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30 text-emerald-400">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  Match inventory to real demand instantly
                </li>
                <li className="flex items-center gap-4 text-lg text-slate-200">
                  <div className="bg-blue-500/20 p-2 rounded-full border border-blue-500/30 text-blue-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  Increase monthly revenue and liquidation
                </li>
              </ul>

              <Link to="/login" className="inline-block mt-4">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-14 px-8 rounded-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                  Start Selling on MLILA
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-2xl blur-3xl -z-10"></div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="h-12 border-b border-slate-700 flex items-center px-4 gap-2 bg-slate-800/80">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Fake UI Element 1 */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                      <div>
                        <div className="text-slate-300 font-semibold mb-1">
                          Clio 4 Alternator
                        </div>
                        <div className="text-slate-500 text-xs text-mono">
                          REQ-006 • 4 Competing Quotes
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs text-white"
                      >
                        View & Quote
                      </Button>
                    </div>
                    {/* Fake UI Element 2 */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                      <div>
                        <div className="text-slate-300 font-semibold mb-1">
                          Golf 7 Bumper
                        </div>
                        <div className="text-slate-500 text-xs text-mono">
                          REQ-001 •{' '}
                          <span className="text-emerald-400">
                            Be the first!
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs text-white"
                      >
                        View & Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Marketplace Section */}
        <section className="w-full py-24 bg-accent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <Badge className="bg-primary text-white border-none py-1 px-3 rounded-full font-bold uppercase tracking-wider text-[10px]">
                Live Marketplace
              </Badge>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Browse our live <span className="text-primary">Demand Feed</span>.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                You don't need an account to see what buyers are looking for. 
                Explore live requests for car parts across Algeria right now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/explore">
                  <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl flex items-center">
                    Enter Marketplace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 transform rotate-2 hover:rotate-0 transition-all duration-500 scale-105">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-blue-50 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600" />
                   </div>
                   <div className="font-bold text-slate-900">Active Signals</div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center opacity-70">
                      <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-6 bg-blue-100 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-6 -left-6 bg-blue-600 text-white p-4 rounded-2xl shadow-xl font-black text-xl z-20">
                Live
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              MLILA
            </span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            © 2026 MLILA Reverse-Marketplace Algeria. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function SparkleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}
export function Badge({ children, className, variant, ...props }: any) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
