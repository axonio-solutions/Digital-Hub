import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import { authQueries } from '@/features/auth/queries/auth-queries'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/waitlist')({
  component: WaitlistPage,
})

function WaitlistPage() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const handleRefresh = async () => {
    await queryClient.refetchQueries({
      queryKey: authQueries.user().queryKey,
    })
    await router.invalidate()
  }

  return (
    <div className="min-h-svh w-full flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      <Card className="max-w-2xl w-full border-none shadow-2xl bg-white/80 backdrop-blur-sm relative z-10 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 animate-gradient-x w-full" />
        
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
                <Clock className="h-12 w-12 text-purple-600" />
              </div>
              <div className="absolute -bottom-2 -end-2 bg-green-500 rounded-full p-2 border-4 border-white shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Registration Received
              </h1>
              <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for joining <span className="text-purple-600 font-bold">MLILA</span>. Your store profile is currently in our <span className="font-semibold text-slate-900">moderation queue</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4">
              <StepInfo 
                icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
                title="Reviewing"
                desc="Our team checks your business info."
                active
              />
              <StepInfo 
                icon={<Mail className="h-5 w-5 text-slate-400" />}
                title="Notification"
                desc="You'll receive an email once approved."
              />
              <StepInfo 
                icon={<ArrowLeft className="h-5 w-5 text-slate-400" />}
                title="Access"
                desc="Login to start selling parts!"
              />
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
              <Button 
                onClick={handleRefresh}
                className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-base font-bold shadow-xl shadow-purple-200 transition-all hover:scale-105 active:scale-95"
              >
                Check Status
              </Button>
              <Button 
                variant="outline"
                asChild
                className="h-12 px-8 border-2 font-bold hover:bg-slate-50"
              >
                <a href="mailto:support@mlila.dz">Contact Support</a>
              </Button>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Average approval time: 12-24 hours
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepInfo({ icon, title, desc, active = false }: any) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${active ? 'border-blue-100 bg-blue-50/50 shadow-sm' : 'border-slate-50 bg-white'}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 mx-auto ${active ? 'bg-white shadow-inner' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <h3 className={`text-sm font-bold mb-1 ${active ? 'text-slate-900' : 'text-slate-500'}`}>{title}</h3>
      <p className="text-[11px] text-slate-400 leading-tight">{desc}</p>
    </div>
  )
}
