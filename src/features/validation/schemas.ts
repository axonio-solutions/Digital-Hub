import {z} from "zod"



export const loginSchema = z.object({
    email : z.email("Please enter a valid email").min(1,"Please enter a valid email"),
    password : z.string().min(8,"Password must have at least 8 characters")
})


