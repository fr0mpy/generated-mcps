import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Call this to add a new pet to the store. Provide the pet's name, photo URLs, and optionally category, tags, and status. Returns the created pet object.",
    {
      id: z.number().describe("The unique identifier for the pet").optional(),
      name: z.string().describe("The name of the pet"),
      category: z.record(z.unknown()).describe("The category object for the pet (e.g., dog, cat)").optional(),
      photoUrls: z.array(z.unknown()).describe("A list of URLs pointing to photos of the pet"),
      tags: z.array(z.unknown()).describe("A list of tags to categorize the pet").optional(),
      status: z.string().describe("The current status of the pet in the store (e.g., available, pending, sold)").optional(),
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
    "Call this to update an existing pet's details by ID. Provide the pet's ID, name, photo URLs, and optionally category, tags, and status. Returns the updated pet object.",
    {
      id: z.number().describe("The unique identifier of the pet to update").optional(),
      name: z.string().describe("The updated name of the pet"),
      category: z.record(z.unknown()).describe("The updated category object for the pet").optional(),
      photoUrls: z.array(z.unknown()).describe("The updated list of URLs pointing to photos of the pet"),
      tags: z.array(z.unknown()).describe("The updated list of tags to categorize the pet").optional(),
      status: z.string().describe("The updated status of the pet in the store").optional(),
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
    "Call this to search for pets by their status in the store. Provide one or more status values (comma-separated). Returns a list of matching pets.",
    {
      status: z.string().describe("Status values to filter by (e.g., available, pending, sold). Use comma-separated values for multiple statuses"),
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
    "Call this to search for pets by their tags. Provide one or more tag values (comma-separated). Returns a list of pets matching the specified tags.",
    {
      tags: z.array(z.unknown()).describe("List of tags to filter by (e.g., tag1, tag2, tag3)"),
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
    "Call this to retrieve a single pet's complete details by its ID. Returns the pet object including name, status, tags, and photos.",
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
    "Call this to update a pet's name and/or status using form data. Provide the pet ID and optionally the new name and status. Returns success confirmation.",
    {
      petId: z.number().describe("The numeric ID of the pet to update"),
      name: z.string().describe("The new name for the pet").optional(),
      status: z.string().describe("The new status for the pet (e.g., available, pending, sold)").optional(),
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
    "Call this to delete a pet from the store by its ID. Returns confirmation that the pet has been deleted.",
    {
      petId: z.number().describe("The numeric ID of the pet to delete"),
      api_key: z.string().describe("Optional API key for authentication").optional(),
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
    "Call this to upload a photo of a pet. Provide the pet ID and the image file. Optionally include additional metadata about the image. Returns upload confirmation.",
    {
      petId: z.number().describe("The numeric ID of the pet to upload an image for"),
      additionalMetadata: z.string().describe("Optional metadata or description about the image being uploaded").optional(),
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
    "Call this to retrieve the current inventory of pets by status. Returns a map showing how many pets are in each status (available, pending, sold, etc.).",
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
    "Call this to place a new order for a pet. Provide the pet ID, quantity, and optionally order ID, ship date, status, and completion flag. Returns the created order object.",
    {
      id: z.number().describe("The unique identifier for the order").optional(),
      petId: z.number().describe("The ID of the pet being ordered").optional(),
      quantity: z.number().describe("The quantity of the pet to order").optional(),
      shipDate: z.string().describe("The date when the order should be shipped").optional(),
      status: z.string().describe("The status of the order (e.g., placed, approved, delivered)").optional(),
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
    "Call this to retrieve details of a specific order by its ID. Returns the order object including pet ID, quantity, status, and ship date. (Use order IDs <= 5 or > 10 for valid responses.)",
    {
      orderId: z.number().describe("The numeric ID of the order to retrieve"),
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
    "Call this to delete an order by its ID. Returns confirmation that the order has been deleted. (Use order IDs < 1000 for valid responses.)",
    {
      orderId: z.number().describe("The numeric ID of the order to delete"),
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
    "Call this to create a new user account. Provide the user's username and optionally first name, last name, email, password, phone, and status. Returns the created user object.",
    {
      id: z.number().describe("The unique identifier for the user").optional(),
      username: z.string().describe("The username for the new account").optional(),
      firstName: z.string().describe("The user's first name").optional(),
      lastName: z.string().describe("The user's last name").optional(),
      email: z.string().describe("The user's email address").optional(),
      password: z.string().describe("The user's password").optional(),
      phone: z.string().describe("The user's phone number").optional(),
      userStatus: z.number().describe("The user's status (e.g., 1 for active, 0 for inactive)").optional(),
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
    "Call this to create multiple user accounts at once using a list of user objects. Each user object can include id, username, firstName, lastName, email, password, phone, and userStatus. Returns confirmation of created users.",
    {
      users: z.array(z.unknown()).describe("A list of user objects to create, each containing user details").optional(),
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
    "Call this to log a user into the system. Provide the username and password. Returns a session token or confirmation of successful login.",
    {
      username: z.string().describe("The username to log in with").optional(),
      password: z.string().describe("The password for the user account in clear text").optional(),
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
    "Call this to log out the currently logged-in user and end their session. Returns confirmation of successful logout.",
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
    "Call this to retrieve a user's details by their username. Returns the user object including email, phone, status, and other profile information.",
    {
      username: z.string().describe("The username of the user to retrieve (e.g., user1 for testing)"),
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
    "Call this to update an existing user's profile information. Provide the username and optionally update first name, last name, email, password, phone, and status. Returns the updated user object.",
    {
      username: z.string().describe("The username of the user to update"),
      id: z.number().describe("The unique identifier for the user").optional(),
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
    "Call this to delete a user account by username. Returns confirmation that the user has been deleted.",
    {
      username: z.string().describe("The username of the user account to delete"),
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
