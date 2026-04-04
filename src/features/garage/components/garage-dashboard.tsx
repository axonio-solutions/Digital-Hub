import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  Car,
  History,
  Loader2,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useAddVehicle,
  useRemoveVehicle,
  useVehicles,
} from '../hooks/use-vehicles'
import { GarageForm } from './garage-form'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function GarageDashboard() {
  const { data: user } = useAuth()
  const userId = user?.id || ''

  const { data: userVehicles = [], isLoading, isError } = useVehicles(userId)
  const { mutate: addVehicle, isPending: isAdding } = useAddVehicle()
  const { mutate: removeVehicle } = useRemoveVehicle()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddVehicle = (data: any) => {
    addVehicle(
      { ...data, userId },
      {
        onSuccess: () => {
          setIsDialogOpen(false)
          toast.success('Vehicle added to your garage!')
        },
        onError: () => {
          toast.error('Failed to add vehicle. Please try again.')
        },
      },
    )
  }

  const handleDeleteVehicle = (id: string) => {
    if (
      confirm('Are you sure you want to remove this vehicle from your garage?')
    ) {
      removeVehicle(
        { id, userId },
        {
          onSuccess: () => {
            toast.success('Vehicle removed')
          },
        },
      )
    }
  }

  if (isLoading)
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-4 animate-pulse">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">
          Accessing your garage...
        </p>
      </div>
    )

  if (isError)
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-500">Garage Error</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          We couldn't reach the garage at the moment. Please check your
          connection.
        </p>
      </div>
    )

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Garage
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your cars and use them to auto-fill parts requests.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Register Vehicle
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to add a car to your digital garage.
              </DialogDescription>
            </DialogHeader>
            <GarageForm onSubmit={handleAddVehicle} isSubmitting={isAdding} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userVehicles.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 bg-muted/30 py-16 flex flex-col items-center justify-center text-center hover:bg-muted/40 transition-colors">
            <div className="bg-card p-4 rounded-full shadow-sm mb-4 border ring-offset-background">
              <Car className="h-12 w-12 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Your Garage is Empty
            </h3>
            <p className="text-muted-foreground max-w-xs mt-2 mb-6">
              Add your vehicles now to make finding spare parts 5x faster.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="rounded-xl border-2 hover:bg-accent"
            >
              Click here to start
            </Button>
          </Card>
        ) : (
          userVehicles.map((vehicle: any) => (
            <Card
              key={vehicle.id}
              className="group relative overflow-hidden border-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300 rounded-3xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-bold px-3 py-1 rounded-full"
                  >
                    {vehicle.year}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-extrabold mt-4 text-foreground">
                  {vehicle.make}
                </CardTitle>
                <CardDescription className="text-lg font-medium">
                  {vehicle.model}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-2xl border">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Plate
                    </div>
                    <div className="font-mono text-sm text-foreground bg-muted px-2 py-0.5 rounded border inline-block select-all">
                      {vehicle.licensePlate || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-2xl border">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      VIN
                    </div>
                    <div
                      className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded border block truncate select-all"
                      title={vehicle.vin}
                    >
                      {vehicle.vin || 'N/A'}
                    </div>
                  </div>
                </div>
 
                <div className="flex items-center gap-2 text-sm text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                  Verified in Network
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-10 font-bold hover:bg-muted"
                  onClick={() =>
                    toast.info('Vehicle details editing coming soon!')
                  }
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Analytics/Tips Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden group">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4 uppercase tracking-wider">
                <Activity className="h-3 w-3" /> Garage Tip
              </div>
              <h3 className="text-2xl font-bold mb-3">Maintenance Reminders</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Soon you'll be able to track oil changes and inspection dates
                directly from your garage.
              </p>
            </div>
            <Button className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6">
              Notify Me
            </Button>
          </div>
        </div>
        <div className="bg-card border rounded-[2rem] p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <History className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              Service History
            </h3>
            <p className="text-muted-foreground">
              View all parts requested and quotes accepted for each of your
              vehicles in one place.
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-primary font-bold mt-2 hover:no-underline"
            >
              Go to History →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
