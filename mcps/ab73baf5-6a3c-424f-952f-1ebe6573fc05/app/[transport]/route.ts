import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const BASE_URL = process.env.MCP_BASE_URL ?? ''
const CREDENTIAL_ENDPOINT = process.env.CREDENTIAL_ENDPOINT ?? ''
const HMAC_SECRET = process.env.HMAC_SECRET ?? ''
const INTEGRATION_ID = process.env.INTEGRATION_ID ?? ''

const handler = createMcpHandler((server) => {
    server.tool(
    "create_pet",
    "Call this to add a new pet to the pet store. Provide the pet's name, photo URLs, and optionally an ID, category, tags, and status. Returns the newly created pet object.",
    {
      id: z.number().describe("The numeric ID for the pet. If not provided, the system will assign one.").optional(),
      name: z.string().describe("The name of the pet. For example: 'Fluffy' or 'Rex'."),
      category: z.record(z.unknown()).describe("A category object for the pet, such as 'dog' or 'cat'. Can contain id and name properties.").optional(),
      photoUrls: z.array(z.unknown()).describe("An array of URLs pointing to images of the pet. At least one URL is required."),
      tags: z.array(z.unknown()).describe("An array of tag objects to categorize the pet. Each tag can have an id and name.").optional(),
      status: z.string().describe("The current status of the pet in the store. Use values like 'available', 'pending', or 'sold'.").optional(),
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
    "Call this to update an existing pet's information. Provide the pet ID, name, photo URLs, and optionally other details. Returns the updated pet object.",
    {
      id: z.number().describe("The numeric ID of the pet to update. This identifies which pet to modify."),
      name: z.string().describe("The updated name of the pet."),
      category: z.record(z.unknown()).describe("The updated category object for the pet.").optional(),
      photoUrls: z.array(z.unknown()).describe("Updated array of photo URLs for the pet. At least one URL is required."),
      tags: z.array(z.unknown()).describe("Updated array of tags for the pet.").optional(),
      status: z.string().describe("Updated status of the pet in the store, such as 'available', 'pending', or 'sold'.").optional(),
    },
    async (params, { authInfo }) => {
      const creds = await fetchCredentials(authInfo?.token)
      const url = `${BASE_URL}/pet`
      const body = JSON.stringify({ id: params.id, name: params.name, ...(params.category !== undefined && { category: params.category }), photoUrls: params.photoUrls, ...(params.tags !== undefined && { tags: params.tags }), ...(params.status !== undefined && { status: params.status }) })
      const res = await fetch(url, { method: "PUT", headers: { 'Authorization': `Bearer ${creds.apiKey}`, 'Content-Type': 'application/json' }, body })
      const data = await res.json()
      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.tool(
    "list_pets_by_status",
    "Call this to search for pets in the store by their status. Provide a status value or comma-separated status values. Returns a list of pets matching the status filter.",
    {
      status: z.string().describe("Status values to filter by. Use comma-separated values like 'available,pending' or single values like 'sold'."),
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
    "Call this to search for pets in the store by tags. Provide one or more tags separated by commas, such as 'tag1,tag2,tag3'. Returns a list of pets that have those tags.",
    {
      tags: z.array(z.unknown()).describe("Array of tag names to filter by. For example: ['dog', 'fluffy'] or use comma-separated string format."),
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
    "Call this to retrieve a single pet's details from the store using its numeric ID. Returns the complete pet object including name, status, tags, and photos.",
    {
      petId: z.number().describe("The numeric ID of the pet to retrieve."),
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
    "Call this to update a pet's details using form data. Provide the pet ID and optionally the pet's new name or status. Returns success upon update.",
    {
      petId: z.number().describe("The numeric ID of the pet to update."),
      name: z.string().describe("The updated name of the pet. This field is optional.").optional(),
      status: z.string().describe("The updated status of the pet, such as 'available', 'pending', or 'sold'. This field is optional.").optional(),
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
    "Call this to delete a pet from the store using its ID. Requires a valid pet ID. Returns confirmation that the pet was deleted.",
    {
      petId: z.number().describe("The numeric ID of the pet to delete from the store."),
      api_key: z.string().describe("An optional API key for authorization. If not provided, OAuth2 bearer token will be used.").optional(),
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
    "Call this to upload an image for a pet. Provide the pet ID and the image file. Optionally include additional metadata about the image. Returns the uploaded file information.",
    {
      petId: z.number().describe("The numeric ID of the pet to upload an image for."),
      additionalMetadata: z.string().describe("Optional metadata about the image, such as the photographer's name or image description.").optional(),
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
    "Call this to get the current inventory of pets in the store organized by status. Returns a map showing how many pets are available, pending, or sold.",
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
    "Call this to place a new order for a pet. Provide a pet ID and optionally quantity, ship date, status, and order ID. Returns the created order object with confirmation details.",
    {
      id: z.number().describe("The numeric ID for the order. If not provided, the system will assign one.").optional(),
      petId: z.number().describe("The ID of the pet being ordered.").optional(),
      quantity: z.number().describe("The number of this pet to order.").optional(),
      shipDate: z.string().describe("The date when the order should ship, in ISO 8601 format like '2024-01-15T10:00:00Z'.").optional(),
      status: z.string().describe("The order status, such as 'placed', 'approved', 'delivered'.").optional(),
      complete: z.boolean().describe("Whether the order has been completed. Set to true or false.").optional(),
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
    "Call this to retrieve a specific order by its ID. For testing, use integer IDs <= 5 or > 10. Returns the complete order details including pet ID, quantity, status, and ship date.",
    {
      orderId: z.number().describe("The numeric ID of the order to retrieve. For testing, use IDs <= 5 or > 10."),
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
    "Call this to delete a purchase order from the store. Provide the order ID. For testing, use IDs < 1000. Returns confirmation that the order was deleted.",
    {
      orderId: z.number().describe("The numeric ID of the order to delete. For testing, use IDs < 1000."),
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
    "Call this to create a new user account in the system. Provide the user's username and optionally other details like email, password, and name. Returns the newly created user object.",
    {
      id: z.number().describe("The numeric ID for the user account. If not provided, the system will assign one.").optional(),
      username: z.string().describe("The username for the account, used for login.").optional(),
      firstName: z.string().describe("The user's first name.").optional(),
      lastName: z.string().describe("The user's last name.").optional(),
      email: z.string().describe("The user's email address.").optional(),
      password: z.string().describe("The user's password for the account.").optional(),
      phone: z.string().describe("The user's phone number.").optional(),
      userStatus: z.number().describe("The user's status code, such as 1 for active or 0 for inactive.").optional(),
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
    "Call this to create multiple user accounts at once by providing a list of user objects. Each user object can contain username, email, password, and other details. Returns confirmation of all created users.",
    {
      users: z.array(z.unknown()).describe("An array of user objects to create. Each object can contain id, username, firstName, lastName, email, password, phone, and userStatus.").optional(),
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
    "Call this to log a user into the system. Provide username and password. Returns a session token or confirmation of successful login.",
    {
      username: z.string().describe("The username for the account to log in with.").optional(),
      password: z.string().describe("The password for the account in plain text.").optional(),
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
    "Call this to log the current user out of the system. Ends the user's session.",
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
    "get_user_by_username",
    "Call this to retrieve a user's account details by their username. Returns the user's profile information including email, phone, and status. Use 'user1' for testing.",
    {
      username: z.string().describe("The username to look up. For testing, use 'user1'."),
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
    "Call this to update an existing user's account details. Provide the username and any fields you want to change, such as email, password, name, or phone. Returns the updated user object.",
    {
      username: z.string().describe("The username of the account to update."),
      id: z.number().describe("The numeric ID of the user. This is optional and typically should not be changed.").optional(),
      firstName: z.string().describe("The updated first name.").optional(),
      lastName: z.string().describe("The updated last name.").optional(),
      email: z.string().describe("The updated email address.").optional(),
      password: z.string().describe("The updated password.").optional(),
      phone: z.string().describe("The updated phone number.").optional(),
      userStatus: z.number().describe("The updated user status code.").optional(),
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
    "Call this to delete a user account from the system. Provide the username. Returns confirmation that the user was deleted.",
    {
      username: z.string().describe("The username of the account to delete."),
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
