const env = (import.meta as any).env;
const API_URL = env?.VITE_API_URL ?? (env?.DEV ? "http://localhost:5000" : "");

export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AuthUser = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
};

export type UserDocument = {
  id: number;
  user_id: number;
  company_id: number | null;
  doc_type: string;
  doc_name: string;
  file_name: string;
  mime_type: string;
  created_at: string;
};

export type SiteBanner = {
  enabled: boolean;
  message: string;
  variant: "info" | "warning" | "success" | "danger";
};

export type PricingSetting = {
  pricingPlans: Array<{ id: string; price: number }>;
  companyTypePrices: Record<string, number>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const json = (await res.json().catch(() => null)) as any;

  if (!res.ok) {
    const message = json?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

export async function apiRequestBlob(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<Blob> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as any;
    const message = json?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return await res.blob();
}

export async function registerApi(email: string, password: string) {
  return apiRequest<ApiResult<{ user: AuthUser; token: string }>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginApi(email: string, password: string) {
  return apiRequest<ApiResult<{ user: AuthUser; token: string }>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function meApi(token: string) {
  return apiRequest<ApiResult<AuthUser>>("/api/auth/me", {
    method: "GET",
    token,
  });
}

export async function generateDocumentsApi(token: string, payload: { companyTypeName?: string; docs: string[] }) {
  return apiRequest<ApiResult<Array<{ id: number; docType: string; docName: string; fileName: string; createdAt: string }>>>(
    "/api/documents/generate",
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    },
  );
}

export async function getMyDocumentsApi(token: string) {
  return apiRequest<ApiResult<UserDocument[]>>("/api/documents/my", {
    method: "GET",
    token,
  });
}

export async function downloadDocumentApi(token: string, id: number) {
  return apiRequestBlob(`/api/documents/${id}/download`, {
    method: "GET",
    token,
  });
}

export async function getPublicBannerApi() {
  return apiRequest<ApiResult<SiteBanner>>("/api/settings/banner", { method: "GET" });
}

export async function getPublicPricingApi() {
  return apiRequest<ApiResult<PricingSetting>>("/api/settings/pricing", { method: "GET" });
}

export async function adminDashboardApi(token: string) {
  return apiRequest<any>("/api/admin/dashboard", { method: "GET", token });
}

export async function adminUsersApi(token: string) {
  return apiRequest<any>("/api/admin/users", { method: "GET", token });
}

export async function adminCompaniesApi(token: string) {
  return apiRequest<any>("/api/admin/companies", { method: "GET", token });
}

export async function adminDocumentsApi(token: string) {
  return apiRequest<any>("/api/admin/documents", { method: "GET", token });
}

export async function adminToggleUserStatusApi(token: string, userId: number) {
  return apiRequest<any>(`/api/admin/users/${userId}/toggle-status`, { method: "PUT", token });
}

export async function adminUpdateUserRoleApi(token: string, userId: number, role: "user" | "admin") {
  return apiRequest<any>(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    token,
    body: JSON.stringify({ role }),
  });
}

export async function adminGetBannerApi(token: string) {
  return apiRequest<ApiResult<SiteBanner>>("/api/admin/settings/banner", { method: "GET", token });
}

export async function adminUpdateBannerApi(token: string, payload: SiteBanner) {
  return apiRequest<ApiResult<SiteBanner>>("/api/admin/settings/banner", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function adminGetPricingApi(token: string) {
  return apiRequest<ApiResult<PricingSetting>>("/api/admin/settings/pricing", { method: "GET", token });
}

export async function adminUpdatePricingApi(token: string, payload: PricingSetting) {
  return apiRequest<ApiResult<PricingSetting>>("/api/admin/settings/pricing", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}
