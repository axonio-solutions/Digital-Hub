import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";

// #region agent log
const AGENT_ENDPOINT = 'http://127.0.0.1:7617/ingest/4bd9446b-0abc-45e2-99c0-ff1e9f329f69'
const AGENT_SESSION_ID = '8088a9'
const AGENT_RUN_ID = 'pre-debug'

function agentLog(params: {
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
}) {
  if (typeof fetch === 'undefined') return

  const { hypothesisId, location, message, data } = params
  const id = `log_${Date.now()}_${Math.random().toString(16).slice(2)}`

  fetch(AGENT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': AGENT_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: AGENT_SESSION_ID,
      runId: AGENT_RUN_ID,
      id,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {})
}
// #endregion

export function DefaultNotFound() {
  const location = useLocation()

  agentLog({
    hypothesisId: 'H7',
    location: 'src/routes/components/errors/-default-not-found.tsx:DefaultNotFound',
    message: 'DefaultNotFound rendered',
    data: { pathname: (location as any).pathname ?? null },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
