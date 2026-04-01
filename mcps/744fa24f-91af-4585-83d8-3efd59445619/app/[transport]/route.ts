import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Add a new pet to the store by providing pet details. Returns the newly created pet with assigned ID.",
    {
      id: z.number().describe("The unique identifier for the pet").optional(),
      name: z.string().describe("The name of the pet"),
      category: z.record(z.unknown()).describe("The category or type the pet belongs to").optional(),
      photoUrls: z.array(z.unknown()).describe("URLs to photos of the pet"),
      tags: z.array(z.unknown()).describe("Tags or labels associated with the pet").optional(),
      status: z.string().describe("The pet status in the store (e.g., available, pending, sold)").optional(),
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
    "Update an existing pet by providing its ID and new details. Returns the updated pet information.",
    {
      id: z.number().describe("The unique identifier of the pet to update").optional(),
      name: z.string().describe("The new name for the pet"),
      category: z.record(z.unknown()).describe("The new category or type for the pet").optional(),
      photoUrls: z.array(z.unknown()).describe("New URLs to photos of the pet"),
      tags: z.array(z.unknown()).describe("New tags or labels for the pet").optional(),
      status: z.string().describe("The new pet status in the store (e.g., available, pending, sold)").optional(),
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
    "list_pets_by_status",
    "Search for pets in the store by their status. Provide multiple statuses as comma-separated values. Returns a list of pets matching the status criteria.",
    {
      status: z.string().describe("Status values to filter by, separated by commas (e.g., available, pending, sold)"),
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
    "list_pets_by_tags",
    "Search for pets in the store by their tags. Provide multiple tags as comma-separated values. Returns a list of pets matching the tag criteria.",
    {
      tags: z.array(z.unknown()).describe("Tags to filter by (provide as comma-separated string or array)"),
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
    "get_pet",
    "Retrieve detailed information about a specific pet using its ID. Returns the pet object with all details.",
    {
      petId: z.number().describe("The unique identifier of the pet to retrieve"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${params.petId}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "update_pet_with_form",
    "Update a pet's information using form data. You can update the pet's name and/or status. Returns confirmation of the update.",
    {
      petId: z.number().describe("The unique identifier of the pet to update"),
      name: z.string().describe("The new name for the pet").optional(),
      status: z.string().describe("The new status for the pet").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${params.petId}`
      const body = JSON.stringify({ ...(params.name !== undefined && { name: params.name }), ...(params.status !== undefined && { status: params.status }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_pet",
    "Delete a pet from the store by its ID. Returns confirmation when the pet is deleted.",
    {
      petId: z.number().describe("The unique identifier of the pet to delete"),
      api_key: z.string().describe("API key for authorization").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const _params = new URLSearchParams()
      if (params.api_key !== undefined) _params.set("api_key", String(params.api_key))
      const url = `${BASE_URL}/pet/${params.petId}?${_params.toString()}`
      const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "upload_pet_image",
    "Upload an image file for a pet. Optionally include additional metadata. Returns information about the uploaded image.",
    {
      petId: z.number().describe("The unique identifier of the pet to upload image for"),
      additionalMetadata: z.string().describe("Optional metadata information about the image").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet/${params.petId}/uploadImage`
      const body = JSON.stringify({ ...(params.additionalMetadata !== undefined && { additionalMetadata: params.additionalMetadata }) })
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "get_store_inventory",
    "Get a summary of the pet store inventory broken down by pet status. Returns counts of pets in each status category.",
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
    "Create a new order for a pet in the store. Provide order details like pet ID, quantity, and optional shipping date. Returns the created order with confirmation.",
    {
      id: z.number().describe("The order identifier").optional(),
      petId: z.number().describe("The ID of the pet being ordered").optional(),
      quantity: z.number().describe("The quantity of the pet being ordered").optional(),
      shipDate: z.string().describe("The date when the order should be shipped").optional(),
      status: z.string().describe("The current order status (e.g., placed, approved, delivered)").optional(),
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
    "get_order",
    "Retrieve details of a specific order by its ID. Use IDs <= 5 or > 10 for valid results. Returns the order information.",
    {
      orderId: z.number().describe("The unique identifier of the order to retrieve"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order/${params.orderId}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_order",
    "Delete an order from the store by its ID. Use IDs with values less than 1000 for valid deletion. Returns confirmation when the order is deleted.",
    {
      orderId: z.number().describe("The unique identifier of the order to delete"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/store/order/${params.orderId}`
      const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "create_user",
    "Create a new user account with the provided details. Returns the created user information.",
    {
      id: z.number().describe("The user identifier").optional(),
      username: z.string().describe("The username for the account").optional(),
      firstName: z.string().describe("The user's first name").optional(),
      lastName: z.string().describe("The user's last name").optional(),
      email: z.string().describe("The user's email address").optional(),
      password: z.string().describe("The user's password").optional(),
      phone: z.string().describe("The user's phone number").optional(),
      userStatus: z.number().describe("The user's status (e.g., active, inactive)").optional(),
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
    "Create multiple user accounts at once by providing an array of user details. Returns confirmation of created users.",
    {
      users: z.array(z.unknown()).describe("Array of user objects to create").optional(),
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
    "Authenticate a user by username and password to start a session. Returns a session token upon successful login.",
    {
      username: z.string().describe("The username to log in with").optional(),
      password: z.string().describe("The password for the username").optional(),
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
    "End the current user's session and log them out of the system. Returns confirmation of logout.",
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
    "get_user",
    "Retrieve detailed information about a specific user by their username. Returns the user's profile information.",
    {
      username: z.string().describe("The username to retrieve (e.g., user1 for testing)"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${params.username}`
      const res = await fetch(url, { method: "GET", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "update_user",
    "Update an existing user's information by username. Provide the fields to update. Returns the updated user information.",
    {
      username: z.string().describe("The username of the user to update"),
      id: z.number().describe("The user identifier").optional(),
      firstName: z.string().describe("The user's first name").optional(),
      lastName: z.string().describe("The user's last name").optional(),
      email: z.string().describe("The user's email address").optional(),
      password: z.string().describe("The user's password").optional(),
      phone: z.string().describe("The user's phone number").optional(),
      userStatus: z.number().describe("The user's status").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${params.username}`
      const body = JSON.stringify({ ...(params.id !== undefined && { id: params.id }), ...(params.firstName !== undefined && { firstName: params.firstName }), ...(params.lastName !== undefined && { lastName: params.lastName }), ...(params.email !== undefined && { email: params.email }), ...(params.password !== undefined && { password: params.password }), ...(params.phone !== undefined && { phone: params.phone }), ...(params.userStatus !== undefined && { userStatus: params.userStatus }) })
      const res = await fetch(url, { method: "PUT", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "delete_user",
    "Delete a user account by username. Returns confirmation when the user is deleted.",
    {
      username: z.string().describe("The username of the user to delete"),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/${params.username}`
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
