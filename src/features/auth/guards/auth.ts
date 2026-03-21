import { auth } from "@/lib/auth";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const req = getRequest();

  const session = await auth.api.getSession({
    headers: req?.headers,
    query: {
      // ensure session is fresh
      // https://www.better-auth.com/docs/concepts/session-management#session-caching
      disableCookieCache: true,
    },
  });

  if (!session) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }

  return next({ 
    context: { 
      user: session.user, 
      session: session.session,
    } 
  });
});

export const optionalAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const req = getRequest();

  const session = await auth.api.getSession({
    headers: req?.headers,
    query: {
      disableCookieCache: true,
    },
  });

  return next({
    context: {
      user: session?.user ?? null,
      session: session?.session ?? null,
    }
  });
});


