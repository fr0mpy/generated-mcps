import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Call this to add a new pet to the store. You must provide the pet's name and photo URLs. Returns the created pet object with its assigned ID.",
    {
      id: z.number().describe("The pet's unique identifier (auto-assigned if not provided)").optional(),
      name: z.string().describe("The pet's name"),
      category: z.record(z.unknown()).describe("The pet's category or type (e.g., dog, cat, bird)").optional(),
      photoUrls: z.array(z.unknown()).describe("Array of URLs to photos of the pet"),
      tags: z.array(z.unknown()).describe("Array of tag objects to label the pet").optional(),
      status: z.string().describe("The pet's status in the store (e.g., available, pending, sold)").optional(),
    },
    async (params, { authInfo }) => {

      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), name: params.name, ...(params.category !== undefined && { category: params.category }), photoUrls: params.photoUrls, ...(params.tags !== undefined && { tags: params.tags }), ...(params.status !== undefined && { status: params.status }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "update_pet",
    "Call this to update an existing pet's information by ID. You must provide the pet's name and photo URLs. Returns the updated pet object.",
    {
      id: z.number().describe("The pet's unique identifier to update").optional(),
      name: z.string().describe("The pet's updated name"),
      category: z.record(z.unknown()).describe("The pet's updated category or type").optional(),
      photoUrls: z.array(z.unknown()).describe("Updated array of URLs to photos of the pet"),
      tags: z.array(z.unknown()).describe("Updated array of tag objects for the pet").optional(),
      status: z.string().describe("The pet's updated status in the store").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), name: params.name, ...(params.category !== undefined && { category: params.category }), photoUrls: params.photoUrls, ...(params.tags !== undefined && { tags: params.tags }), ...(params.status !== undefined && { status: params.status }) })
      const res = await fetch(url, { method: "PUT", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "search_pets_by_status",
    "Call this to find all pets in the store with a specific status. You can provide multiple statuses as comma-separated values (e.g., 'available,pending'). Returns an array of matching pet objects.",
    {
      status: z.string().describe("The status value(s) to filter by. Can be a single status or multiple comma-separated statuses like 'available,pending,sold'"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const _params = new URLSearchParams()
      _params.set("status", String(params.status))
      const url = `${BASE_URL}/pet/findByStatus?${_params.toString()}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "search_pets_by_tags",
    "Call this to find all pets with specific tags. You can provide multiple tags as comma-separated values. Returns an array of matching pet objects.",
    {
      tags: z.array(z.unknown()).describe("Array of tag values to filter pets by (e.g., ['red', 'blue'])"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const _params = new URLSearchParams()
      _params.set("tags", String(params.tags))
      const url = `${BASE_URL}/pet/findByTags?${_params.toString()}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_pet_by_id",
    "Call this to retrieve a single pet's details by its ID. Returns the complete pet object including name, status, tags, and photos.",
    {
      petId: z.number().describe("The numeric ID of the pet to retrieve"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "update_pet_with_form",
    "Call this to update a pet's information using form data (name and/or status). Provide the pet's ID and the fields you want to update.",
    {
      petId: z.number().describe("The numeric ID of the pet to update"),
      name: z.string().describe("The pet's new name (optional)").optional(),
      status: z.string().describe("The pet's new status (optional)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}`
      const body = JSON.stringify({ ...(params.name !== undefined && { name: params.name }), ...(params.status !== undefined && { status: params.status }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_pet",
    "Call this to remove a pet from the store by its ID. The pet will be permanently deleted.",
    {
      petId: z.number().describe("The numeric ID of the pet to delete"),
      api_key: z.string().describe("Optional API key for additional authorization").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const _params = new URLSearchParams()
      if (params.api_key !== undefined) _params.set("api_key", String(params.api_key))
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}?${_params.toString()}`
      const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "upload_pet_image",
    "Call this to upload a photo or image for a specific pet. Provide the pet's ID and the image file. Optionally include additional metadata about the image.",
    {
      petId: z.number().describe("The numeric ID of the pet to upload an image for"),
      additionalMetadata: z.string().describe("Optional metadata describing the image or upload").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${encodeURIComponent(String(params.petId))}/uploadImage`
      const body = JSON.stringify({ ...(params.additionalMetadata !== undefined && { additionalMetadata: params.additionalMetadata }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_store_inventory",
    "Call this to view the current pet inventory organized by status. Returns a count of how many pets are in each status (available, pending, sold, etc.).",
    {

    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/inventory`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_order",
    "Call this to place a new order for a pet in the store. Provide the pet ID, quantity, and other order details. Returns the created order object with its ID.",
    {
      id: z.number().describe("The order's unique identifier").optional(),
      petId: z.number().describe("The ID of the pet being ordered").optional(),
      quantity: z.number().describe("The number of pets to order").optional(),
      shipDate: z.string().describe("The date when the order should ship (ISO 8601 format)").optional(),
      status: z.string().describe("The order's status (e.g., placed, approved, delivered)").optional(),
      complete: z.boolean().describe("Whether the order is complete").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.petId !== undefined && { petId: params.petId }), ...(params.quantity !== undefined && { quantity: params.quantity }), ...(params.shipDate !== undefined && { shipDate: params.shipDate }), ...(params.status !== undefined && { status: params.status }), ...(params.complete !== undefined && { complete: params.complete }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_order_by_id",
    "Call this to retrieve details of a specific order by its ID. Returns the complete order object including pet ID, quantity, status, and shipment date.",
    {
      orderId: z.number().describe("The numeric ID of the order to retrieve (use IDs <= 5 or > 10 for testing)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order/${encodeURIComponent(String(params.orderId))}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_order",
    "Call this to cancel and remove an order from the store by its ID. The order will be permanently deleted.",
    {
      orderId: z.number().describe("The numeric ID of the order to delete (use IDs < 1000 for testing)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order/${encodeURIComponent(String(params.orderId))}`
      const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_user",
    "Call this to create a new user account in the system. Provide user details like username, email, and password. Returns the created user object.",
    {
      id: z.number().describe("The user's unique identifier").optional(),
      username: z.string().describe("The user's login username").optional(),
      firstName: z.string().describe("The user's first name").optional(),
      lastName: z.string().describe("The user's last name").optional(),
      email: z.string().describe("The user's email address").optional(),
      password: z.string().describe("The user's password").optional(),
      phone: z.string().describe("The user's phone number").optional(),
      userStatus: z.number().describe("The user's account status (e.g., 0 = active, 1 = inactive)").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.username !== undefined && { username: params.username }), ...(params.firstName !== undefined && { firstName: params.firstName }), ...(params.lastName !== undefined && { lastName: params.lastName }), ...(params.email !== undefined && { email: params.email }), ...(params.password !== undefined && { password: params.password }), ...(params.phone !== undefined && { phone: params.phone }), ...(params.userStatus !== undefined && { userStatus: params.userStatus }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_users_with_list",
    "Call this to create multiple user accounts at once using a list of user objects. Useful for bulk user registration. Returns confirmation of created users.",
    {
      users: z.array(z.unknown()).describe("Array of user objects to create, each containing username, email, password, and other user details").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/createWithList`
      const body = JSON.stringify({ ...(params.users !== undefined && { users: params.users }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "login_user",
    "Call this to authenticate a user and log them into the system. Provide the username and password. Returns a session token or confirmation of successful login.",
    {
      username: z.string().describe("The user's login username").optional(),
      password: z.string().describe("The user's password in plain text").optional(),
    },
    async (params, { authInfo }) => {
      const _params = new URLSearchParams()
      if (params.username !== undefined) _params.set("username", String(params.username))
      if (params.password !== undefined) _params.set("password", String(params.password))
      const url = `${BASE_URL}/user/login?${_params.toString()}`
      const res = await fetch(url, { method: "GET" })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "logout_user",
    "Call this to log out the currently logged-in user and end their session.",
    {

    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/logout`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_user_by_name",
    "Call this to retrieve a specific user's details by their username. Returns the user object with all profile information.",
    {
      username: z.string().describe("The username to look up (e.g., 'user1' for testing)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${encodeURIComponent(String(params.username))}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "update_user",
    "Call this to update an existing user's profile information by username. You can update fields like name, email, phone, and password.",
    {
      username: z.string().describe("The username of the user to update"),
      id: z.number().describe("The user's unique identifier").optional(),
      firstName: z.string().describe("The user's updated first name").optional(),
      lastName: z.string().describe("The user's updated last name").optional(),
      email: z.string().describe("The user's updated email address").optional(),
      password: z.string().describe("The user's updated password").optional(),
      phone: z.string().describe("The user's updated phone number").optional(),
      userStatus: z.number().describe("The user's updated status").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${encodeURIComponent(String(params.username))}`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.firstName !== undefined && { firstName: params.firstName }), ...(params.lastName !== undefined && { lastName: params.lastName }), ...(params.email !== undefined && { email: params.email }), ...(params.password !== undefined && { password: params.password }), ...(params.phone !== undefined && { phone: params.phone }), ...(params.userStatus !== undefined && { userStatus: params.userStatus }) })
      const res = await fetch(url, { method: "PUT", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_user",
    "Call this to remove a user account from the system by username. The user and all associated data will be permanently deleted.",
    {
      username: z.string().describe("The username of the user to delete"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${encodeURIComponent(String(params.username))}`
      const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
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
