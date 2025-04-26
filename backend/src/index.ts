import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { z } from 'zod'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand
} from '@aws-sdk/lib-dynamodb'

// Optionally load .env into process.env
// import 'dotenv/config'

const app = new Hono()

// Global logging middleware
app.use('*', logger())

// CORS preflight for /test
app.options('/test', (c) => {
  return c.json(null, 204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
})

// ——————————————
// 1. DynamoDB DocumentClient setup
// ——————————————
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
})
const docClient = DynamoDBDocumentClient.from(ddbClient)

// ——————————————
// 2. Request-body schema
// ——————————————
const TestSchema = z.object({
  username: z.string().min(1, 'username is required'),
  comment: z.string().min(1, 'comment is required'),
})

// ——————————————
// 3. POST /test handler with detailed logging and CORS header
// ——————————————
app.post('/test', async (c) => {
  console.log(`[${new Date().toISOString()}] POST /test - Received request`)

  let rawBody: unknown
  try {
    rawBody = await c.req.json()
    console.log(`[${new Date().toISOString()}] Request JSON payload:`, rawBody)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Invalid JSON payload:`, err)
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = TestSchema.safeParse(rawBody)
  if (!parsed.success) {
    console.warn(
      `[${new Date().toISOString()}] Validation failed:`,
      parsed.error.flatten()
    )
    return c.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      400
    )
  }

  const { username, comment } = parsed.data
  console.log(
    `[${new Date().toISOString()}] Validation succeeded for user: ${username}`
  )

  // ——————————————
  // 4. Save to DynamoDB (userid is partition key)
  // ——————————————
  const item = {
    userid: username,
    comment,
    createdAt: new Date().toISOString(),
  }

  try {
    console.log(
      `[${new Date().toISOString()}] Saving item to DynamoDB:`,
      item
    )
    await docClient.send(
      new PutCommand({
        TableName: process.env.DDB_TABLE_NAME!,
        Item: item,
      })
    )
    console.log(
      `[${new Date().toISOString()}] Successfully saved item for user: ${username}`
    )
  } catch (err) {
    console.error(`[${new Date().toISOString()}] DynamoDB error:`, err)
    return c.json({ error: 'Could not save to database' }, 500)
  }

  // Attach CORS header to the successful response
  const response = c.json(
    { message: 'Received and saved!', data: { username, comment } },
    200
  )
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
})

// 404 handler
app.notFound((c) => {
  console.warn(
    `[${new Date().toISOString()}] 404 Not Found: ${new URL(c.req.url).pathname}`
  )
  return c.json({ error: 'Not Found' }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error(
    `[${new Date().toISOString()}] Unhandled error in ${c.req.method} ${c.req.url}:`,
    err
  )
  return c.json({ error: 'Internal Server Error' }, 500)
})

// ——————————————
// 5. Start Bun server
// ——————————————
Bun.serve({
  fetch: app.fetch,
  port: 3001,
})
console.log(`🚀 Server listening on http://localhost:3001`)
