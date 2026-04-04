import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Call this to add a new pet to the store. Provide the pet's name, photo URLs, and optionally its ID, category, tags, and status. Returns the created pet object.",
    {
      id: z.number().describe("The unique numeric identifier for the pet (optional)").optional(),
      name: z.string().describe("The name of the pet"),
      category: z.record(z.unknown()).describe("The category or type of pet (optional)").optional(),
      photoUrls: z.array(z.unknown()).describe("A list of photo URLs for the pet"),
      tags: z.array(z.unknown()).describe("Tags to categorize the pet (optional)").optional(),
      status: z.string().describe("The current status of the pet in the store (e.g., available, pending, sold)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), name: params.name, ...(params.category !== undefined && { category: params.category }), photoUrls: params.photoUrls, ...(params.tags !== undefined && { tags: params.tags }), ...(params.status !== undefined && { status: params.status }) })
      let data: unknown
      try {
        const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "search_pets_by_status",
    "Call this to search for pets filtered by their status in the store. Provide one or more status values (comma-separated). Returns a list of pets matching the specified statuses.",
    {
      status: z.string().describe("One or more status values to filter by (e.g., available, pending, sold). Use comma-separated values for multiple statuses."),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const _params = new URLSearchParams()
      _params.set("status", String(params.status))
      const url = `${BASE_URL}/pet/findByStatus?${_params.toString()}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "search_pets_by_tags",
    "Call this to search for pets filtered by their tags. Provide one or more tags (comma-separated). Returns a list of pets matching the specified tags.",
    {
      tags: z.array(z.unknown()).describe("One or more tags to filter by (e.g., tag1, tag2, tag3). Use comma-separated values for multiple tags."),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const _params = new URLSearchParams()
      _params.set("tags", String(params.tags))
      const url = `${BASE_URL}/pet/findByTags?${_params.toString()}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_pet",
    "Call this to delete a pet from the store by its ID. Returns a success confirmation.",
    {
      petId: z.number().describe("The numeric ID of the pet to delete"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "upload_pet_image",
    "Call this to upload an image file for a pet. Provide the pet ID and the image file. Optionally include additional metadata. Returns upload confirmation.",
    {
      petId: z.number().describe("The numeric ID of the pet to upload an image for"),
      additionalMetadata: z.string().describe("Optional additional metadata about the image").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}/uploadImage`
      const body = JSON.stringify({ ...(params.additionalMetadata !== undefined && { additionalMetadata: params.additionalMetadata }) })
      let data: unknown
      try {
        const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_store_inventory",
    "Call this to retrieve the current inventory of pets in the store organized by status. Returns a map showing the count of pets for each status.",
    {

    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/inventory`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_order",
    "Call this to place a new order for a pet in the store. Provide the pet ID, quantity, and optionally the order ID, ship date, status, and completion flag. Returns the created order object.",
    {
      id: z.number().describe("The unique numeric identifier for the order (optional)").optional(),
      petId: z.number().describe("The numeric ID of the pet being ordered (optional)").optional(),
      quantity: z.number().describe("The quantity of the pet to order (optional)").optional(),
      shipDate: z.string().describe("The date when the order should ship (optional)").optional(),
      status: z.string().describe("The status of the order (e.g., placed, approved, delivered)").optional(),
      complete: z.boolean().describe("Whether the order is complete (optional)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.petId !== undefined && { petId: params.petId }), ...(params.quantity !== undefined && { quantity: params.quantity }), ...(params.shipDate !== undefined && { shipDate: params.shipDate }), ...(params.status !== undefined && { status: params.status }), ...(params.complete !== undefined && { complete: params.complete }) })
      let data: unknown
      try {
        const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_order_by_id",
    "Call this to retrieve a specific order's details by its ID. Returns the order object with all information including pet ID, quantity, ship date, and status.",
    {
      orderId: z.number().describe("The numeric ID of the order to retrieve (use IDs <= 5 or > 10 for valid responses)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order/${encodeURIComponent(String(params.orderId))}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_order",
    "Call this to delete a purchase order by its ID. Returns a success confirmation.",
    {
      orderId: z.number().describe("The numeric ID of the order to delete (use IDs < 1000 for valid responses)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order/${encodeURIComponent(String(params.orderId))}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_user",
    "Call this to create a new user account. Provide the username and optionally the user's ID, first name, last name, email, password, phone, and status. Returns the created user object.",
    {
      id: z.number().describe("The unique numeric identifier for the user (optional)").optional(),
      username: z.string().describe("The username for the account (optional)").optional(),
      firstName: z.string().describe("The user's first name (optional)").optional(),
      lastName: z.string().describe("The user's last name (optional)").optional(),
      email: z.string().describe("The user's email address (optional)").optional(),
      password: z.string().describe("The user's password (optional)").optional(),
      phone: z.string().describe("The user's phone number (optional)").optional(),
      userStatus: z.number().describe("The user's status code (optional)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.username !== undefined && { username: params.username }), ...(params.firstName !== undefined && { firstName: params.firstName }), ...(params.lastName !== undefined && { lastName: params.lastName }), ...(params.email !== undefined && { email: params.email }), ...(params.password !== undefined && { password: params.password }), ...(params.phone !== undefined && { phone: params.phone }), ...(params.userStatus !== undefined && { userStatus: params.userStatus }) })
      let data: unknown
      try {
        const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_users_with_list",
    "Call this to create multiple user accounts at once using a list of user objects. Returns confirmation of successful creation.",
    {

    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/createWithList`
      let data: unknown
      try {
        const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "login_user",
    "Call this to log a user into the system. Provide the username and password. Returns a session token or confirmation of successful login.",
    {
      username: z.string().describe("The username to log in with").optional(),
      password: z.string().describe("The password in clear text").optional(),
    },
    async (params, { authInfo }) => {
      const _params = new URLSearchParams()
      if (params.username !== undefined) _params.set("username", String(params.username))
      if (params.password !== undefined) _params.set("password", String(params.password))
      const url = `${BASE_URL}/user/login?${_params.toString()}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET" })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "logout_user",
    "Call this to log out the currently logged-in user and end their session. Returns a success confirmation.",
    {

    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/logout`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_user_by_username",
    "Call this to retrieve a user's complete profile information by their username. Returns the user object with all details including email, phone, and status.",
    {
      username: z.string().describe("The username to look up (e.g., user1)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${encodeURIComponent(String(params.username))}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "update_user",
    "Call this to update an existing user's information by their username. Provide the username and the fields you want to update (first name, last name, email, password, phone, status). Returns the updated user object.",
    {
      username: z.string().describe("The username of the user to update"),
      id: z.number().describe("The user's unique numeric identifier (optional)").optional(),
      firstName: z.string().describe("The updated first name (optional)").optional(),
      lastName: z.string().describe("The updated last name (optional)").optional(),
      email: z.string().describe("The updated email address (optional)").optional(),
      password: z.string().describe("The updated password (optional)").optional(),
      phone: z.string().describe("The updated phone number (optional)").optional(),
      userStatus: z.number().describe("The updated user status code (optional)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${encodeURIComponent(String(params.username))}`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.firstName !== undefined && { firstName: params.firstName }), ...(params.lastName !== undefined && { lastName: params.lastName }), ...(params.email !== undefined && { email: params.email }), ...(params.password !== undefined && { password: params.password }), ...(params.phone !== undefined && { phone: params.phone }), ...(params.userStatus !== undefined && { userStatus: params.userStatus }) })
      let data: unknown
      try {
        const res = await fetch(url, { method: "PUT", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_user",
    "Call this to delete a user account by their username. Returns a success confirmation.",
    {
      username: z.string().describe("The username of the user to delete"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${encodeURIComponent(String(params.username))}`
      let data: unknown
      try {
        const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        data = await res.json()
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )
})

export { handler as GET, handler as POST, handler as DELETE }

async function fetchCredentials(token: string | undefined): Promise<{ apiKey: string }> {
  if (!CREDENTIAL_ENDPOINT || !INTEGRATION_ID) {
    return { apiKey: token ?? '' }
  }
  const sig = await createHmacSignature(HMAC_SECRET, INTEGRATION_ID)
  const res = await fetch(
    `${CREDENTIAL_ENDPOINT}/api/credentials?integrationId=${INTEGRATION_ID}`,
    { headers: { 'x-hmac-signature': sig, 'x-integration-id': INTEGRATION_ID } },
  )
  if (!res.ok) return { apiKey: token ?? '' }
  const data = await res.json() as { apiKey?: string }
  return { apiKey: data.apiKey ?? token ?? '' }
}

async function createHmacSignature(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Buffer.from(sig).toString('hex')
}
