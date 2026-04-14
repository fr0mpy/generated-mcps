import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Call this to add a new pet to the store. Provide the pet's name, photo URLs, and optionally a category, tags, and status. Returns the created pet record with its assigned ID.",
    {
      id: z.number().describe("Unique numeric identifier for the pet (optional; may be auto-assigned)").optional(),
      name: z.string().describe("The pet's name"),
      category: z.record(z.unknown()).describe("A category object that can contain pet classification details").optional(),
      photoUrls: z.array(z.unknown()).describe("Array of photo URLs for the pet"),
      tags: z.array(z.unknown()).describe("Array of tags to label and organize the pet").optional(),
      status: z.string().describe("The pet's status in the store (e.g., available, pending, sold)").optional(),
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
    "update_pet",
    "Call this to update an existing pet's information by ID. Provide the pet ID and any fields you want to change including name, category, photos, tags, or status. Returns the updated pet object.",
    {
      id: z.number().describe("The numeric ID of the pet to update").optional(),
      name: z.string().describe("The pet's updated name"),
      category: z.record(z.unknown()).describe("Updated category object for the pet").optional(),
      photoUrls: z.array(z.unknown()).describe("Updated array of photo URLs"),
      tags: z.array(z.unknown()).describe("Updated array of tags").optional(),
      status: z.string().describe("Updated pet status in the store").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), name: params.name, ...(params.category !== undefined && { category: params.category }), photoUrls: params.photoUrls, ...(params.tags !== undefined && { tags: params.tags }), ...(params.status !== undefined && { status: params.status }) })
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
    "search_pets_by_status",
    "Call this to find all pets filtered by status. You can provide multiple comma-separated status values. Returns an array of matching pet records.",
    {
      status: z.string().describe("One or more status values to filter by (e.g., 'available' or 'available,pending,sold')"),
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
    "Call this to find all pets filtered by their tags. Provide comma-separated tag names. Returns an array of matching pet records.",
    {
      tags: z.array(z.unknown()).describe("Array or comma-separated list of tags to filter pets by"),
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
    "get_pet_by_id",
    "Call this to retrieve a single pet's complete details by its numeric ID. Returns the pet record including name, status, tags, and photo URLs.",
    {
      petId: z.number().describe("The numeric ID of the pet to retrieve"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}`
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
    "update_pet_with_form",
    "Call this to update a pet's name or status using form data. Provide the pet ID and optionally the new name and/or status. Returns confirmation of the update.",
    {
      petId: z.number().describe("The numeric ID of the pet to update"),
      name: z.string().describe("Updated name for the pet (optional)").optional(),
      status: z.string().describe("Updated status for the pet (optional)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}`
      const body = JSON.stringify({ ...(params.name !== undefined && { name: params.name }), ...(params.status !== undefined && { status: params.status }) })
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
    "delete_pet",
    "Call this to delete a pet from the store by its ID. Returns confirmation that the pet was deleted.",
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
    "Call this to upload a photo or image file for a pet. Provide the pet ID and the image file. Optionally include additional metadata. Returns confirmation of the upload.",
    {
      petId: z.number().describe("The numeric ID of the pet to associate with the image"),
      additionalMetadata: z.string().describe("Optional additional information about the image (optional)").optional(),
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
    "Call this to retrieve the current pet store inventory summary. Returns a map showing the count of pets by their status (available, pending, sold, etc.).",
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
    "Call this to create a new purchase order for a pet. Provide the pet ID, quantity, and optionally a ship date and order status. Returns the created order with its assigned ID.",
    {
      id: z.number().describe("Unique numeric identifier for the order (optional; may be auto-assigned)").optional(),
      petId: z.number().describe("The numeric ID of the pet being ordered").optional(),
      quantity: z.number().describe("Number of pets to order").optional(),
      shipDate: z.string().describe("Scheduled ship date for the order (optional; ISO 8601 format)").optional(),
      status: z.string().describe("Order status (e.g., placed, approved, delivered)").optional(),
      complete: z.boolean().describe("Whether the order is complete").optional(),
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
    "Call this to retrieve a specific purchase order by its ID. Returns the order details including pet ID, quantity, ship date, and status. (Use IDs ≤ 5 or > 10 for valid responses.)",
    {
      orderId: z.number().describe("The numeric ID of the order to retrieve"),
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
    "Call this to delete a purchase order by its ID. Returns confirmation that the order was deleted. (Use order IDs < 1000 for valid responses.)",
    {
      orderId: z.number().describe("The numeric ID of the order to delete"),
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
    "Call this to create a new user account. Provide the user's username, password, and optionally their first name, last name, email, phone, and status. Returns the created user record.",
    {
      id: z.number().describe("Unique numeric identifier for the user (optional; may be auto-assigned)").optional(),
      username: z.string().describe("The user's login username").optional(),
      firstName: z.string().describe("The user's first name (optional)").optional(),
      lastName: z.string().describe("The user's last name (optional)").optional(),
      email: z.string().describe("The user's email address (optional)").optional(),
      password: z.string().describe("The user's password").optional(),
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
    "Call this to create multiple user accounts in bulk using an array of user objects. Each user object can include username, password, email, and other fields. Returns confirmation of all created users.",
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
    "Call this to log a user into the system. Provide the username and password. Returns an authentication token or session confirmation for the logged-in user.",
    {
      username: z.string().describe("The user's login username").optional(),
      password: z.string().describe("The user's password in clear text").optional(),
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
    "Call this to end the current user's authenticated session and log them out of the system. Returns confirmation of logout.",
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
    "Call this to retrieve a user's profile and details by their username. Returns the user record including email, phone, and status information.",
    {
      username: z.string().describe("The username of the user to retrieve (e.g., 'user1')"),
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
    "Call this to update an existing user's profile information. Provide the username and any fields you want to change including password, email, phone, first name, last name, or status. Returns the updated user record.",
    {
      username: z.string().describe("The username of the user to update"),
      id: z.number().describe("The user's numeric ID (optional)").optional(),
      firstName: z.string().describe("Updated first name (optional)").optional(),
      lastName: z.string().describe("Updated last name (optional)").optional(),
      email: z.string().describe("Updated email address (optional)").optional(),
      password: z.string().describe("Updated password (optional)").optional(),
      phone: z.string().describe("Updated phone number (optional)").optional(),
      userStatus: z.number().describe("Updated user status (optional)").optional(),
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
    "Call this to delete a user account by username. Returns confirmation that the user was deleted.",
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
