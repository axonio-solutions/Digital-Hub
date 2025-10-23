import { loginFn } from "@/fn/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { zodResolver } from '@hookform/resolvers/zod';

import { SubmitHandler, useForm } from "react-hook-form";
import { loginSchema } from "@/features/validation/schemas";
import { LoginFormData } from "@/features/validation/types";
import z from "zod";


export function useLogin (){
    const router = useRouter()
    const loginMutation = useMutation({
        mutationFn : async(data : z.infer<typeof loginSchema>)=>{
            
            const res = await loginFn(data); // Better Auth login

      // ✅ Handle unauthorized
      if (res.status === 401) {
        throw new Error("Invalid email or password");
      }

      // ✅ Handle other errors
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Login failed");
      }

      return res;
    },
        onSuccess : async ()=>{
            await router.invalidate()
            toast.success("Welcome Back")
            return router.navigate({
                to: "/dashboard"
            })

        },
        onError:(error)=>{
            toast.error(error.message)
        }
    })

    
    const form = useForm({
        resolver : zodResolver(loginSchema),
        defaultValues:{
            email :"",
            password : ""
        }
    })

    const onSubmit : SubmitHandler<LoginFormData>  = async (data)=>{
        loginMutation.mutate({data:{
            email : data.email,
            password : data.password,
        }})

    }


    return {
        form ,
        isPending : loginMutation.status ==="pending",
        onSubmit ,
        loginError :loginMutation.data?.error,
        loginMessage : loginMutation.data?.message

    }
}