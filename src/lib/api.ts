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

// Fonction pour gérer la déconnexion automatique en cas de token expiré
const handleTokenExpired = () => {
  console.warn('🔐 Token expiré - Déconnexion automatique');
  localStorage.removeItem('arch_excellence_token');
  // Rediriger vers la page de login
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login?expired=true';
  }
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  console.log(`🌐 API Request: ${rest.method || 'GET'} ${API_URL}${path}`);

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
    console.error(`❌ API Error ${res.status}:`, message, json);
    
    // Si erreur 401 (token invalide/expiré), déconnecter automatiquement
    if (res.status === 401 && token) {
      handleTokenExpired();
    }
    
    throw new Error(message);
  }

  console.log(`✅ API Response:`, json?.success ? 'Success' : 'Failed', json?.data?.length || 0, 'items');
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
    
    // Si erreur 401 (token invalide/expiré), déconnecter automatiquement
    if (res.status === 401 && token) {
      handleTokenExpired();
    }
    
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

export async function previewDocumentsApi(
  token: string | '', // Optionnel car route publique
  payload: {
    company: any;
    associates?: any[];
    managers?: any[];
    docs: string[];
    formats?: ('pdf' | 'docx')[];
    additionalData?: any;
  }
) {
  return apiRequest<ApiResult<Array<{ docName: string; pdf?: { data: string; mimeType: string; fileName: string }; error?: string }>>>(
    "/api/documents/preview",
    {
      method: "POST",
      token: token || undefined, // Ne pas envoyer le token si vide
      body: JSON.stringify(payload),
    },
  );
}

export async function generateDocumentsApi(
  token: string, 
  payload: { 
    companyId?: number; 
    companyTypeName?: string; 
    docs: string[];
    formats?: ('pdf' | 'docx')[];
    regenerate?: boolean; // Nouveau paramètre pour régénérer les documents
  }
) {
  return apiRequest<ApiResult<Array<{ id: number; docType: string; docName: string; fileName: string; format?: string; createdAt: string }>>>(
    "/api/documents/generate",
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteCompanyDocumentsApi(token: string, companyId: number) {
  return apiRequest<ApiResult<{ deletedCount: number; deletedFiles: number }>>(
    `/api/documents/company/${companyId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export async function getMyDocumentsApi(token: string) {
  // Ajouter un timestamp pour éviter le cache
  const timestamp = new Date().getTime();
  return apiRequest<ApiResult<UserDocument[]>>(`/api/documents/my?t=${timestamp}`, {
    method: "GET",
    token,
  });
}

export async function getMyCompaniesApi(token: string) {
  return apiRequest<ApiResult<any[]>>("/api/companies", {
    method: "GET",
    token,
  });
}

export async function getMyStatsApi(token: string) {
  return apiRequest<ApiResult<any>>("/api/companies/stats/me", {
    method: "GET",
    token,
  });
}

export async function createCompanyApi(token: string, data: any) {
  return apiRequest<ApiResult<any>>("/api/companies", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteCompanyApi(token: string, companyId: number) {
  return apiRequest<ApiResult<any>>(`/api/companies/${companyId}`, {
    method: "DELETE",
    token,
  });
}

export async function downloadDocumentApi(token: string, id: number) {
  return apiRequestBlob(`/api/documents/${id}/download`, {
    method: "GET",
    token,
  });
}

export function viewDocumentUrl(id: number) {
  return `${API_URL}/api/documents/${id}/view`;
}

// ============================================
// API Paiements
// ============================================

export async function initiatePaymentApi(token: string, data: { company_id: number; amount: number; payment_method?: string }) {
  return await apiRequest('/api/payments/initiate', {
    method: 'POST',
    token,
    body: data
  });
}

export async function checkPaymentStatusApi(token: string, paymentId: number) {
  return await apiRequest(`/api/payments/${paymentId}/status`, {
    method: 'GET',
    token
  });
}

export async function checkCompanyPaymentApi(token: string, companyId: number) {
  return await apiRequest(`/api/payments/company/${companyId}/check`, {
    method: 'GET',
    token
  });
}

export async function getPaymentHistoryApi(token: string) {
  return await apiRequest('/api/payments/history', {
    method: 'GET',
    token
  });
}

export async function simulatePaymentApi(token: string, paymentId: number) {
  return await apiRequest(`/api/payments/${paymentId}/simulate`, {
    method: 'POST',
    token
  });
}

export async function submitPaymentProofApi(token: string, formData: FormData) {
  const response = await fetch(`${API_URL}/api/payments/submit-proof`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // Ne pas définir Content-Type, le navigateur le fait automatiquement avec boundary
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'envoi de la preuve');
  }

  return await response.json();
}

export async function getCompanyPaymentStatusApi(token: string, companyId: number) {
  return await apiRequest(`/api/payments/company/${companyId}/status`, {
    method: 'GET',
    token
  });
}

// API Admin pour les paiements
export async function adminGetAllPaymentsApi(token: string, status?: string) {
  const query = status ? `?status=${status}` : '';
  return await apiRequest(`/api/payments/admin/all${query}`, {
    method: 'GET',
    token
  });
}

export async function adminVerifyPaymentApi(token: string, paymentId: number, status: 'verified' | 'rejected', adminNotes?: string) {
  return await apiRequest(`/api/payments/admin/${paymentId}/verify`, {
    method: 'PUT',
    token,
    body: { status, adminNotes }
  });
}

export async function viewDocumentApi(token: string, id: number) {
  return apiRequestBlob(`/api/documents/${id}/view`, {
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

export async function adminUpdateCompanyStatusApi(token: string, companyId: string, status: string) {
  return apiRequest<any>(`/api/admin/companies/${companyId}/status`, {
    method: "PUT",
    token,
    body: JSON.stringify({ status }),
  });
}

export async function adminDeleteCompanyApi(token: string, companyId: string) {
  return apiRequest<any>(`/api/companies/${companyId}`, {
    method: "DELETE",
    token,
  });
}

export async function adminDocumentsApi(token: string) {
  return apiRequest<any>("/api/admin/documents", { method: "GET", token });
}

export async function adminCompaniesListApi(token: string) {
  return apiRequest<any>("/api/admin/companies-list", { method: "GET", token });
}

export async function adminToggleUserStatusApi(token: string, userId: number) {
  return apiRequest<any>(`/api/admin/users/${userId}/toggle`, { method: "PUT", token });
}

export async function adminUpdateUserRoleApi(token: string, userId: number, role: "client" | "admin") {
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

// ===== Paiement Manuel =====
export async function submitManualPaymentApi(token: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/payments/submit-manual`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la soumission du paiement');
  }

  return response.json();
}

export async function validateManualPaymentApi(token: string, paymentId: number, notes?: string) {
  return apiRequest<ApiResult<any>>(`/api/payments/${paymentId}/validate`, {
    method: "PUT",
    token,
    body: JSON.stringify({ notes }),
  });
}

export async function rejectManualPaymentApi(token: string, paymentId: number, reason: string) {
  return apiRequest<ApiResult<any>>(`/api/payments/${paymentId}/reject`, {
    method: "PUT",
    token,
    body: JSON.stringify({ reason }),
  });
}

export async function getPendingPaymentsApi(token: string, limit?: number) {
  return apiRequest<ApiResult<any[]>>(`/api/payments/admin/pending${limit ? `?limit=${limit}` : ''}`, {
    method: "GET",
    token,
  });
}

// ===== Admin Statistics =====
export async function getOverviewStatsApi(token: string) {
  return apiRequest<ApiResult<any>>("/api/admin/stats/overview", {
    method: "GET",
    token,
  });
}

export async function getRevenueStatsApi(token: string, period: string = '30d') {
  return apiRequest<ApiResult<any>>(`/api/admin/stats/revenue?period=${period}`, {
    method: "GET",
    token,
  });
}

export async function getCompaniesStatsApi(token: string, period: string = '30d') {
  return apiRequest<ApiResult<any>>(`/api/admin/stats/companies?period=${period}`, {
    method: "GET",
    token,
  });
}

export async function getUsersStatsApi(token: string, period: string = '30d') {
  return apiRequest<ApiResult<any>>(`/api/admin/stats/users?period=${period}`, {
    method: "GET",
    token,
  });
}

export async function getRecentActivitiesApi(token: string, limit: number = 20) {
  return apiRequest<ApiResult<any[]>>(`/api/admin/stats/activities?limit=${limit}`, {
    method: "GET",
    token,
  });
}