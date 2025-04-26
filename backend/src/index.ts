import { Hono } from 'hono'
import { z } from 'zod'

const app = new Hono()

// 1. Request‐body schema
const TestSchema = z.object({
  username: z.string().min(1, "username is required"),
  comments: z.string().min(1, "comments are required"),
})

// 2. POST /test
app.post('/test', async (c) => {
  let payload: unknown
  try {
    payload = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const result = TestSchema.safeParse(payload)
  if (!result.success) {
    return c.json(
      { error: 'Invalid request body', details: result.error.flatten() },
      400
    )
  }

  const { username, comments } = result.data
  return c.json({ message: 'Received!', data: { username, comments } })
})

// 404 & error handlers
app.notFound(() => new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 }))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

// 3. Start Bun server (Hono fetch adapter)
Bun.serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('🚀 Server listening on http://localhost:3000')