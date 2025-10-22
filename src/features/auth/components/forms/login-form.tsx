import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginFn } from "@/fn/auth"
import { useRouter } from "@tanstack/react-router"
import { useLogin } from "../../hooks/use-login"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { AtSignIcon } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  // const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault() // stop page reload

  //   // Extract the data from the form
  //   const formData = new FormData(e.currentTarget)
  //   const email = formData.get("email") as string
  //   const password = formData.get("password") as string

  //   // For now, just log the values (you can replace with API call)
  //    loginFn({data : { email, password }}).then(()=>{
  //     router.navigate({
  //       to: "/dashboard"
  //     })
  //    })
    
  //   // Example: later you might call a server function like:
  //   // await loginUser({ email, password })
  // }


  const {form , onSubmit , isPending ,  } = useLogin()

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your accuntt
          </CardDescription>
        </CardHeader>
        <CardContent>


        
        <Form {...form}>
          <form className="flex flex-col gap-6" 
          onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField 
            control={form.control}
            name="email"
            render={({field})=>(
              <FormItem>
                <FormLabel className="block text-left rtl:text-right">
												Email										</FormLabel>
                      <FormControl>
                        <div className="relative">
													<Input
														{...field}
														className="peer ps-9 rtl:ps-9 text-left rtl:text-right"
														placeholder="Enter your email"
														type="email"
													/>
													<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
														<AtSignIcon
															size={16}
															strokeWidth={2}
															aria-hidden="true"
														/>
													</div>
												</div>
                      </FormControl>
              </FormItem>
            )}
            />
<FormField 
            control={form.control}
            name="password"
            render={({field})=>(
              <FormItem>
                <FormLabel className="block text-left rtl:text-right">
												Password										</FormLabel>
                      <FormControl>
                        <div className="relative">
													<Input
														{...field}
														className="peer ps-9 rtl:ps-9 text-left rtl:text-right"
														placeholder="Enter you"
														type="password"
													/>
													<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
														<AtSignIcon
															size={16}
															strokeWidth={2}
															aria-hidden="true"
														/>
													</div>
												</div>
                      </FormControl>
              </FormItem>
            )}
            />
            <Button disabled={isPending} type="submit" className="w-full">
									{isPending ? "pending ..." : "Login"}
								</Button>
            
          </form>

        </Form>

          {/* <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                   name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                
                <Input id="password" type="password" name="password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form> */}
        </CardContent>
      </Card>
    </div>
  )
}
