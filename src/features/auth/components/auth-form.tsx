import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

/**
 * Axis Layer 1: Unified Auth Container
 * This component orchestrates the high-level UI for Auth
 */

export function AuthForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-primary/10 shadow-lg">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <div className="space-y-4 pt-2">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </div>
                <LoginForm />
              </div>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
              <div className="space-y-4 pt-2">
                <div className="text-center mb-4">
                  <CardTitle className="text-2xl">Join MLILA</CardTitle>
                  <CardDescription>Select your account type to proceed</CardDescription>
                </div>
                <RegisterForm />
              </div>
            </TabsContent>

          </CardContent>
        </Tabs>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
