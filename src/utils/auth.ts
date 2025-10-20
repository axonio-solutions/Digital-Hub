// app/utils/auth.ts
import { auth } from '@/lib/auth';
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server';

export const getSession = createServerFn().handler(async () => {
  const request = getRequest();
    const data = await auth.api.getSession({
      headers : request.headers as Headers ,
      query : {
        disableCookieCache : true,
      }
    })

    return {data}
})
