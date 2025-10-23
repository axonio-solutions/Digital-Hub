    import { createFileRoute, redirect } from '@tanstack/react-router'

    export const Route = createFileRoute('/_admin')({
    beforeLoad : async({context , location})=>{
        const {user} = context
        if(!user){
            throw redirect({
                to : "/login",
                search:{
                    redirect : location.href
                }
            })
        }
        }
    })



