import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Creates and adds a new pet to the store inventory. Provide the pet's name, photo URLs, and optionally an ID, category, tags, and status. Returns the newly added pet on success.",
    {
      id: z.number().describe("Unique identifier for the pet").optional(),
      name: z.string().describe("Name of the pet"),
      category: z.record(z.unknown()).describe("Category object containing the pet's category information").optional(),
      photoUrls: z.array(z.unknown()).describe("List of photo URLs for the pet"),
      tags: z.array(z.unknown()).describe("List of tags to categorize the pet").optional(),
      status: z.string().describe("Current status of the pet in the store (e.g., available, pending, sold)").optional(),
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
    "Updates the information for an existing pet by ID. Provide the pet's ID, name, photo URLs, and optionally category, tags, and status. Returns the updated pet on success.",
    {
      id: z.number().describe("Unique identifier of the pet to update").optional(),
      name: z.string().describe("Updated name of the pet"),
      category: z.record(z.unknown()).describe("Updated category object for the pet").optional(),
      photoUrls: z.array(z.unknown()).describe("Updated list of photo URLs for the pet"),
      tags: z.array(z.unknown()).describe("Updated list of tags for the pet").optional(),
      status: z.string().describe("Updated status of the pet in the store").optional(),
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
    "Retrieves a list of pets filtered by their status in the store. You can filter by multiple statuses by providing comma-separated values like 'available,pending,sold'. Returns matching pets.",
    {
      status: z.string().describe("Status values to filter by (comma-separated, e.g., 'available,pending,sold')"),
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
    "Retrieves a list of pets filtered by their tags. You can filter by multiple tags using comma-separated values like 'tag1,tag2,tag3'. Returns matching pets.",
    {
      tags: z.array(z.unknown()).describe("Tags to filter by (provide multiple tags for filtering)"),
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
    "Retrieves detailed information about a single pet by its ID. Returns the pet's complete information including name, status, photos, and tags.",
    {
      petId: z.number().describe("The unique ID of the pet to retrieve"),
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
    "Updates a pet's information using form data. You can update the pet's name and status without replacing the entire pet record. Provide the pet ID and any fields to update.",
    {
      petId: z.number().describe("The unique ID of the pet to update"),
      name: z.string().describe("New name for the pet").optional(),
      status: z.string().describe("New status for the pet").optional(),
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
    "Removes a pet from the store by its ID. Optionally provide an API key for authentication. Returns confirmation that the pet has been deleted.",
    {
      petId: z.number().describe("The unique ID of the pet to delete"),
      api_key: z.string().describe("API key for authentication").optional(),
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
    "Uploads a photo image for a pet. Provide the pet ID and the image file. Optionally include additional metadata about the image. Returns confirmation of the upload.",
    {
      petId: z.number().describe("The unique ID of the pet to upload an image for"),
      additionalMetadata: z.string().describe("Optional metadata to associate with the uploaded image").optional(),
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
    "Retrieves the current inventory of the pet store, showing the count of pets grouped by their status (e.g., available, pending, sold). Returns a map of status codes to quantities.",
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
    "Creates a new purchase order for a pet. Provide the pet ID, quantity, and optionally an order ID, ship date, status, and completion flag. Returns the newly created order.",
    {
      id: z.number().describe("Unique identifier for the order").optional(),
      petId: z.number().describe("The ID of the pet being ordered").optional(),
      quantity: z.number().describe("Number of pets in the order").optional(),
      shipDate: z.string().describe("Expected ship date for the order").optional(),
      status: z.string().describe("Current status of the order (e.g., placed, approved, delivered)").optional(),
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
    "Retrieves the details of a purchase order by its ID. For valid responses, use IDs with value <= 5 or > 10. Other values may generate exceptions. Returns the order information.",
    {
      orderId: z.number().describe("The unique ID of the order to retrieve (use values <= 5 or > 10 for valid responses)"),
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
    "Removes a purchase order from the system by its ID. For valid responses, use IDs with value < 1000. Non-integer or very large values may generate errors. Returns confirmation of deletion.",
    {
      orderId: z.number().describe("The unique ID of the order to delete (use values < 1000 for valid responses)"),
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
    "Creates a new user account in the system. Provide user details like username, email, password, and optional personal information. Only the logged-in user can create new users. Returns the newly created user.",
    {
      id: z.number().describe("Unique identifier for the user").optional(),
      username: z.string().describe("Username for the account").optional(),
      firstName: z.string().describe("User's first name").optional(),
      lastName: z.string().describe("User's last name").optional(),
      email: z.string().describe("User's email address").optional(),
      password: z.string().describe("User's password").optional(),
      phone: z.string().describe("User's phone number").optional(),
      userStatus: z.number().describe("Status code for the user account").optional(),
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
    "Creates multiple user accounts in the system at once using a provided list of user data. Useful for batch user creation. Returns confirmation of the created users.",
    {

    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/user/createWithList`
      const res = await fetch(url, { method: "POST", headers: { 'Authorization': `Bearer ${creds.apiKey}` } })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "login_user",
    "Authenticates a user and logs them into the system. Provide the username and password. Returns a session token or confirmation that the login was successful.",
    {
      username: z.string().describe("The username for login").optional(),
      password: z.string().describe("The password for login in plain text").optional(),
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
    "Logs out the currently authenticated user from the system. Terminates the user's session. Returns confirmation that the logout was successful.",
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
    "Retrieves user details based on their username. Returns the user's profile information including email, phone, and status. Use 'user1' for testing.",
    {
      username: z.string().describe("The username to look up (use 'user1' for testing)"),
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
    "Updates an existing user's information. Provide the username and any fields to update such as name, email, password, or phone. Only the logged-in user can update user information. Returns the updated user.",
    {
      username: z.string().describe("The username of the user to update"),
      id: z.number().describe("User's unique identifier").optional(),
      firstName: z.string().describe("Updated first name").optional(),
      lastName: z.string().describe("Updated last name").optional(),
      email: z.string().describe("Updated email address").optional(),
      password: z.string().describe("Updated password").optional(),
      phone: z.string().describe("Updated phone number").optional(),
      userStatus: z.number().describe("Updated user status code").optional(),
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
    "Removes a user account from the system by username. Only the logged-in user can delete user accounts. Returns confirmation that the user has been deleted.",
    {
      username: z.string().describe("The username of the user account to delete"),
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
