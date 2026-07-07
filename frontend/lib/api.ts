import type {
  AiSummaryResponse,
  AdminOfficialPayload,
  AdminUser,
  AdminUserUpdate,
  AuthTokens,
  ForumComment,
  ForumCommentModerationUpdate,
  ForumSentimentSummary,
  ForumThread,
  ForumThreadDetail,
  ForumThreadModerationUpdate,
  MapHeatmap,
  MapNote,
  MapNotePayload,
  MapNoteStatus,
  Survey,
  SurveyResponsePayload,
  SurveyResults,
  User,
} from "./types";

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8902/api`;
  }

  return "http://10.191.221.67:8902/api";
}

export class ApiRequestError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("vox_access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${getApiUrl()}${path}`, { ...options, headers });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // response had no JSON body
    }
    const message =
      (body as { detail?: string } | null)?.detail ??
      `Żądanie nie powiodło się (${res.status})`;
    throw new ApiRequestError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// --- Auth -------------------------------------------------------------

export function login(username: string, password: string) {
  return request<AuthTokens>("/accounts/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(
  username: string,
  email: string,
  password: string,
  extra: { imie?: string; nazwisko?: string; pesel?: string } = {}
) {
  return request<{ message: string; user: User }>("/accounts/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password, ...extra }),
  });
}

export function fetchCurrentUser() {
  return request<User>("/accounts/me/");
}

// --- Surveys ------------------------------------------------------------

export function fetchSurveys() {
  return request<Survey[]>("/surveys/ankiety/");
}

export function fetchSurvey(id: string | number) {
  return request<Survey>(`/surveys/ankiety/${id}/`);
}

export function createSurvey(payload: Partial<Survey>) {
  return request<Survey>("/surveys/ankiety/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitSurveyResponse(
  id: string | number,
  payload: SurveyResponsePayload
) {
  return request<{ id: number }>(`/surveys/ankiety/${id}/odpowiedzi/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchSurveyResults(id: string | number) {
  return request<SurveyResults>(`/surveys/ankiety/${id}/wyniki/`);
}

// --- AI summarization (Bielik) ------------------------------------------

export function summarizeSurvey(id: string | number) {
  return request<AiSummaryResponse>(`/surveys/${id}/ai-summary/`, {
    method: "POST",
  });
}

// --- Forum ---------------------------------------------------------------

export function fetchForumThreads() {
  return request<ForumThread[]>("/forum/watki/");
}

export function createForumThread(payload: { tytul: string }) {
  return request<ForumThread>("/forum/watki/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchForumThread(id: string | number) {
  return request<ForumThreadDetail>(`/forum/watki/${id}/`);
}

export function createForumComment(
  threadId: string | number,
  payload: { tresc: string }
) {
  return request<ForumComment>(`/forum/watki/${threadId}/komentarze/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchForumSentimentSummary(threadId: string | number) {
  return request<ForumSentimentSummary>(`/forum/watki/${threadId}/sentyment/`);
}

export function analyzeForumSentiment(threadId: string | number) {
  return request<ForumSentimentSummary>(`/forum/watki/${threadId}/sentyment/`, {
    method: "POST",
  });
}

export function fetchModerationComments() {
  return request<ForumComment[]>("/forum/moderacja/komentarze/");
}

export function updateForumCommentModeration(
  commentId: string | number,
  payload: ForumCommentModerationUpdate
) {
  return request<ForumComment>(`/forum/komentarze/${commentId}/moderacja/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateForumThreadModeration(
  threadId: string | number,
  payload: ForumThreadModerationUpdate
) {
  return request<ForumThread>(`/forum/watki/${threadId}/moderacja/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// --- Admin ---------------------------------------------------------------

export function fetchAdminUsers() {
  return request<AdminUser[]>("/accounts/admin/users/");
}

export function createAdminOfficial(payload: AdminOfficialPayload) {
  return request<AdminUser>("/accounts/admin/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminUser(userId: string | number, payload: AdminUserUpdate) {
  return request<AdminUser>(`/accounts/admin/users/${userId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// --- Contact -------------------------------------------------------------

export function sendContactMessage(payload: {
  imie: string;
  email: string;
  temat: string;
  tresc: string;
}) {
  return request<{ id?: number; message?: string }>("/contact/submit/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Map notes -----------------------------------------------------------

export function fetchMapNotes() {
  return request<MapNote[]>("/maps/uwagi/");
}

export function createMapNote(payload: MapNotePayload) {
  return request<MapNote>("/maps/uwagi/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMapHeatmap() {
  return request<MapHeatmap>("/maps/heatmap/");
}

export function updateMapNoteStatus(id: string | number, status: MapNoteStatus) {
  return request<MapNote>(`/maps/uwagi/${id}/moderacja/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
