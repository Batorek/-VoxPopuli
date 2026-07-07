// Types mirror the assumed Django REST Framework contract for the
// `accounts` and `surveys` apps. Field names come from typical DRF
// ModelSerializer defaults — adjust here (in one place) if your
// serializers differ, and every page below stays correct.

export interface User {
  id: number;
  username: string;
  email: string;
  rola?: UserRole;
  czy_zweryfikowany?: boolean;
  status_konta?: AccountStatus;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export type UserRole = "gosc" | "mieszkaniec" | "urzednik" | "admin";
export type AccountStatus = "aktywny" | "zablokowany" | "nieaktywny";

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export type QuestionType = "text" | "single_choice" | "multiple_choice" | "rating";

export interface SurveyQuestion {
  id: number;
  text: string;
  type: QuestionType;
  choices?: string[];
  required: boolean;
}

export type SurveyStatus = "draft" | "open" | "closed";

export interface Survey {
  id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  created_at: string;
  questions: SurveyQuestion[];
  responses_count?: number;
}

export interface SurveyAnswer {
  question: number;
  value: string | string[];
}

export interface SurveyResponsePayload {
  answers: SurveyAnswer[];
}

export interface QuestionResult {
  question_id: number;
  text: string;
  type: QuestionType;
  // For choice/rating questions: option -> count. For text: list of free responses.
  aggregate: Record<string, number> | string[];
}

export interface SurveyResults {
  survey: Survey;
  total_responses: number;
  results: QuestionResult[];
}

export interface AiSummaryResponse {
  summary: string;
}

export type Sentiment = "pozytywny" | "neutralny" | "negatywny";

export interface ForumComment {
  id: number;
  id_watku: number;
  id_usera: number | null;
  autor: string;
  tresc: string;
  data_dodania: string;
  sentyment?: Sentiment;
  wynik_sentymentu?: number | null;
  czy_oflagowany: boolean;
  czy_usuniety: boolean;
}

export interface ForumThread {
  id: number;
  tytul: string;
  id_usera: number | null;
  autor: string;
  id_ankiety: number | null;
  data_utworzenia: string;
  czy_zablokowany: boolean;
  liczba_komentarzy: number;
}

export interface ForumThreadDetail extends ForumThread {
  komentarze: ForumComment[];
}

export interface ForumSentimentSummary {
  summary: string;
  counts: Record<Sentiment, number>;
  average_score: number;
}

export interface AdminUser extends Required<User> {
  rola: UserRole;
  status_konta: AccountStatus;
}

export interface AdminUserUpdate {
  rola?: UserRole;
  status_konta?: AccountStatus;
  czy_zweryfikowany?: boolean;
  is_active?: boolean;
}

export interface AdminOfficialPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ForumThreadModerationUpdate {
  czy_zablokowany: boolean;
}

export interface ForumCommentModerationUpdate {
  czy_oflagowany?: boolean;
  czy_usuniety?: boolean;
}

export type MapNoteStatus = "oczekujaca" | "zatwierdzona" | "odrzucona";

export interface MapNote {
  id: number;
  id_usera: number | null;
  autor: string;
  id_ankiety: number | null;
  geometria: string;
  tytul: string;
  opis: string;
  kategoria: string;
  data_dodania: string;
  status: MapNoteStatus;
}

export interface MapHeatPoint {
  lat: number;
  lng: number;
  kategoria: string;
  status: MapNoteStatus;
}

export interface MapHeatmap {
  count: number;
  points: MapHeatPoint[];
}

export interface MapNotePayload {
  tytul: string;
  opis: string;
  kategoria: string;
  geometria: string;
  id_ankiety?: number | null;
}

export interface ApiError {
  detail?: string;
  [field: string]: unknown;
}
