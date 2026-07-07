"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  analyzeForumSentiment,
  createAdminOfficial,
  fetchAdminUsers,
  fetchCurrentUser,
  fetchForumThreads,
  fetchMapNotes,
  fetchModerationComments,
  updateAdminUser,
  updateForumCommentModeration,
  updateForumThreadModeration,
  updateMapNoteStatus,
} from "@/lib/api";
import type { AccountStatus, AdminUser, ForumComment, ForumThread, MapNote, User, UserRole } from "@/lib/types";

const roleLabels: Record<UserRole, string> = {
  gosc: "Gosc",
  mieszkaniec: "Mieszkaniec",
  urzednik: "Urzednik",
  admin: "Administrator",
};

const statusLabels: Record<AccountStatus, string> = {
  aktywny: "Aktywny",
  zablokowany: "Zablokowany",
  nieaktywny: "Nieaktywny",
};

export default function AdminPage() {
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [mapNotes, setMapNotes] = useState<MapNote[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "forum" | "map">("forum");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [officialForm, setOfficialForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const isAdmin = me?.rola === "admin" || me?.is_superuser;
  const isOfficial = me?.rola === "urzednik" || isAdmin;

  const loadForum = async () => {
    const [threadData, commentData, noteData] = await Promise.all([
      fetchForumThreads(),
      fetchModerationComments(),
      fetchMapNotes(),
    ]);
    setThreads(threadData);
    setComments(commentData);
    setMapNotes(noteData);
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    const data = await fetchAdminUsers();
    setUsers(data);
  };

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await fetchCurrentUser();
        setMe(currentUser);

        if (currentUser.rola === "admin" || currentUser.is_superuser) {
          const [userData, threadData, commentData, noteData] = await Promise.all([
            fetchAdminUsers(),
            fetchForumThreads(),
            fetchModerationComments(),
            fetchMapNotes(),
          ]);
          setUsers(userData);
          setThreads(threadData);
          setComments(commentData);
          setMapNotes(noteData);
        } else if (currentUser.rola === "urzednik") {
          const [threadData, commentData, noteData] = await Promise.all([
            fetchForumThreads(),
            fetchModerationComments(),
            fetchMapNotes(),
          ]);
          setThreads(threadData);
          setComments(commentData);
          setMapNotes(noteData);
        }
      } catch {
        setMessage("Brak dostepu do panelu administracyjnego.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = useMemo(() => {
    return {
      users: users.length,
      threads: threads.length,
      flagged: comments.filter((comment) => comment.czy_oflagowany).length,
      removed: comments.filter((comment) => comment.czy_usuniety).length,
      mapPending: mapNotes.filter((note) => note.status === "oczekujaca").length,
    };
  }, [comments, mapNotes, threads.length, users.length]);

  const changeUser = async (user: AdminUser, payload: Partial<AdminUser>) => {
    setMessage("");
    const updated = await updateAdminUser(user.id, payload);
    setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  };

  const createOfficial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      const created = await createAdminOfficial(officialForm);
      setUsers((items) => [...items, created].sort((a, b) => a.id - b.id));
      setOfficialForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      });
      setMessage("Utworzono konto urzednika.");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setMessage(error.message);
        return;
      }
      setMessage("Nie mozna utworzyc urzednika.");
    }
  };

  const toggleThread = async (thread: ForumThread) => {
    const updated = await updateForumThreadModeration(thread.id, {
      czy_zablokowany: !thread.czy_zablokowany,
    });
    setThreads((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  };

  const analyzeThread = async (thread: ForumThread) => {
    setMessage("");
    try {
      await analyzeForumSentiment(thread.id);
      await loadForum();
      setMessage(`Przeanalizowano komentarze w watku: ${thread.tytul}`);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setMessage(error.message);
        return;
      }
      setMessage("Nie mozna wykonac analizy AI dla watku.");
    }
  };

  const toggleCommentRemoved = async (comment: ForumComment) => {
    const updated = await updateForumCommentModeration(comment.id, {
      czy_usuniety: !comment.czy_usuniety,
    });
    setComments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  };

  const toggleCommentFlagged = async (comment: ForumComment) => {
    const updated = await updateForumCommentModeration(comment.id, {
      czy_oflagowany: !comment.czy_oflagowany,
    });
    setComments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  };

  const changeMapNoteStatus = async (note: MapNote, status: "zatwierdzona" | "odrzucona") => {
    const updated = await updateMapNoteStatus(note.id, status);
    setMapNotes((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  };

  if (loading) {
    return <main className="min-h-screen bg-gray-100 p-8 text-black">Ladowanie...</main>;
  }

  if (!isOfficial) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 text-black">
        <div className="mx-auto max-w-5xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">Panel administracyjny</h1>
          <p className="mt-2 text-gray-600">{message || "Brak uprawnien."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Panel administracyjny</h1>
            <p className="text-sm text-gray-600">
              Zalogowano jako {me?.username} ({me?.rola})
            </p>
          </div>
          <button
            onClick={async () => {
              await Promise.all([loadForum(), loadUsers()]);
              setMessage("Dane odswiezone.");
            }}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Odswiez
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Uzytkownicy" value={stats.users} />
          <Metric label="Watki" value={stats.threads} />
          <Metric label="Oflagowane" value={stats.flagged} />
          <Metric label="Uwagi mapy" value={stats.mapPending} />
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab("forum")}
            className={`rounded px-4 py-2 text-sm font-semibold ${activeTab === "forum" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Moderacja forum
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`rounded px-4 py-2 text-sm font-semibold ${activeTab === "map" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Uwagi mapowe
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`rounded px-4 py-2 text-sm font-semibold ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            >
              Konta uzytkownikow
            </button>
          )}
        </div>

        {message && <p className="mb-4 text-sm font-semibold text-blue-700">{message}</p>}

        {activeTab === "forum" && (
          <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-white p-4 shadow">
              <h2 className="mb-3 text-lg font-bold">Watki</h2>
              <div className="flex flex-col gap-3">
                {threads.map((thread) => (
                  <div key={thread.id} className="border border-gray-200 p-3">
                    <p className="font-semibold">{thread.tytul}</p>
                    <p className="text-sm text-gray-500">
                      {thread.liczba_komentarzy} komentarzy · {thread.czy_zablokowany ? "zablokowany" : "aktywny"}
                    </p>
                    <button
                      onClick={() => toggleThread(thread)}
                      className="mt-3 rounded bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      {thread.czy_zablokowany ? "Odblokuj" : "Zablokuj"}
                    </button>
                    <button
                      onClick={() => analyzeThread(thread)}
                      className="ml-2 mt-3 rounded border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-700"
                    >
                      Analizuj AI
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 shadow">
              <h2 className="mb-3 text-lg font-bold">Komentarze</h2>
              <div className="flex max-h-[640px] flex-col gap-3 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{comment.autor}</span>
                      <span>{comment.sentyment}</span>
                      {comment.czy_oflagowany && <span className="text-orange-700">oflagowany</span>}
                      {comment.czy_usuniety && <span className="text-red-700">usuniety</span>}
                    </div>
                    <p className="text-sm">{comment.tresc}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleCommentFlagged(comment)}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-semibold"
                      >
                        {comment.czy_oflagowany ? "Zdejmij flage" : "Oflaguj"}
                      </button>
                      <button
                        onClick={() => toggleCommentRemoved(comment)}
                        className="rounded bg-red-700 px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        {comment.czy_usuniety ? "Przywroc" : "Usun"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "map" && (
          <section className="bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-bold">Moderacja uwag mapowych</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {mapNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{note.autor}</span>
                    <span>{note.kategoria}</span>
                    <span>{note.status}</span>
                    <span>{note.geometria}</span>
                  </div>
                  <p className="font-semibold">{note.tytul}</p>
                  <p className="mt-1 text-sm text-gray-600">{note.opis}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => changeMapNoteStatus(note, "zatwierdzona")}
                      className="rounded bg-green-700 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Zatwierdz
                    </button>
                    <button
                      onClick={() => changeMapNoteStatus(note, "odrzucona")}
                      className="rounded bg-red-700 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Odrzuc
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "users" && isAdmin && (
          <section className="bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-bold">Konta uzytkownikow</h2>
            <form onSubmit={createOfficial} className="mb-6 grid gap-3 rounded border border-gray-200 p-4 md:grid-cols-2 xl:grid-cols-5">
              <input
                type="text"
                placeholder="Login urzednika"
                value={officialForm.username}
                onChange={(e) => setOfficialForm((form) => ({ ...form, username: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={officialForm.email}
                onChange={(e) => setOfficialForm((form) => ({ ...form, email: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2"
                required
              />
              <input
                type="password"
                placeholder="Haslo"
                value={officialForm.password}
                onChange={(e) => setOfficialForm((form) => ({ ...form, password: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Imie"
                value={officialForm.first_name}
                onChange={(e) => setOfficialForm((form) => ({ ...form, first_name: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2"
              />
              <div className="grid gap-3 md:grid-cols-[1fr_auto] xl:grid-cols-1">
                <input
                  type="text"
                  placeholder="Nazwisko"
                  value={officialForm.last_name}
                  onChange={(e) => setOfficialForm((form) => ({ ...form, last_name: e.target.value }))}
                  className="rounded border border-gray-300 px-3 py-2"
                />
                <button className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Dodaj urzednika
                </button>
              </div>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">ID</th>
                    <th>Nazwa</th>
                    <th>Email</th>
                    <th>Rola</th>
                    <th>Status</th>
                    <th>Weryfikacja</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-2">{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.rola}
                          onChange={(e) => changeUser(user, { rola: e.target.value as UserRole })}
                          className="rounded border border-gray-300 px-2 py-1"
                          disabled={user.is_superuser && user.id !== me?.id}
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={user.status_konta}
                          onChange={(e) => changeUser(user, { status_konta: e.target.value as AccountStatus })}
                          className="rounded border border-gray-300 px-2 py-1"
                          disabled={user.is_superuser && user.id !== me?.id}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={user.czy_zweryfikowany}
                            onChange={(e) => changeUser(user, { czy_zweryfikowany: e.target.checked })}
                            disabled={user.is_superuser && user.id !== me?.id}
                          />
                          Zweryfikowany
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
