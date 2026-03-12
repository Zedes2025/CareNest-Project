const apiServerURL = import.meta.env.VITE_APP_API_SERVER_URL ?? "http://localhost:3000";

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type ApiUserProfile = {
  _id: string;
  email?: string;
  firstName: string;
  lastName: string;

  birthday?: string | Date | null;
  profilePicture?: File | null;
  aboutMe?: string;

  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  address?: {
    street: string;
    houseNumber: string;
    city: string;
    plz: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;

  availability?: Array<{ day: Weekday; slots: string[] }>;
  servicesOffered?: string[];
  interests?: string[];
};

function withAuthHeaders(headers?: HeadersInit): HeadersInit {
  const accessToken = localStorage.getItem("accessToken");
  return {
    ...(headers ?? {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? `${res.status}. Something went wrong!`;
  } catch {
    return `${res.status}. Something went wrong!`;
  }
}

// GET /users/profile/:id
export async function getMyProfileById(id: string): Promise<ApiUserProfile> {
  const res = await fetch(`${apiServerURL}/users/profile/${id}`, {
    headers: withAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readError(res));

  const data = (await res.json()) as any;
  // supports: { user: ... } OR direct user object
  return (data?.user ?? data) as ApiUserProfile;
}

// PUT /users/profile/:id  (requires full body)
export async function updateMyProfileById(id: string, body: unknown): Promise<ApiUserProfile> {
  const res = await fetch(`${apiServerURL}/users/profile/${id}`, {
    method: "PUT",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await readError(res));

  const data = (await res.json()) as any;
  return (data?.user ?? data) as ApiUserProfile;
}

// DELETE /users/profile/:id (requires auth)
export async function deleteMyProfileById(id: string): Promise<{ message: string }> {
  const res = await fetch(`${apiServerURL}/users/profile/${id}`, {
    method: "DELETE",
    headers: withAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readError(res));

  return (await res.json()) as { message: string };
}

// Public endpoints currently without authenticate.
const SEND_AUTH_HEADER_FOR_PUBLIC = true;

function maybeAuthHeaders(headers?: HeadersInit): HeadersInit | undefined {
  return SEND_AUTH_HEADER_FOR_PUBLIC ? withAuthHeaders(headers) : headers;
}

// GET /users/all (public)
export async function getPublicUsers(): Promise<ApiUserProfile[]> {
  const res = await fetch(`${apiServerURL}/users/all`, {
    headers: maybeAuthHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as ApiUserProfile[];
}

// GET /users/:id (public)
export async function getPublicUserById(id: string): Promise<ApiUserProfile> {
  const res = await fetch(`${apiServerURL}/users/${id}`, {
    headers: maybeAuthHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as ApiUserProfile;
}

//POST/users/profile/picture
export async function profilePictureUpdate(_id: string, formData: FormData): Promise<ApiUserProfile> {
  const res = await fetch(`${apiServerURL}/users/profile/picture`, {
    method: "POST",
    headers: withAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as ApiUserProfile;
}
