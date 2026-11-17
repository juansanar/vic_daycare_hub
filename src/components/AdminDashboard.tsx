import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/auth";
import { useStore } from "../store";
import {
  ADMIN_EMAIL,
  isAdminUser,
  fetchVacancySubmissions,
  approveVacancySubmission,
  rejectVacancySubmission,
  renewVacancySubmission,
  deleteVacancySubmission,
  fetchFeedbackItems,
  toggleFeedbackResolved,
  deleteFeedbackItem,
  type VacancySubmissionDoc,
  type FeedbackDoc,
} from "../lib/admin";
import {
  daysUntilExpiry,
  formatVacancyLastUpdated,
  getVacancySourceMeta,
  summarizeReportedAgeGroups,
} from "../lib/vacancy";
import type { Facility } from "../types";
import facilitiesData from "../../data/facilities.json";

const facilityEmailMap = new Map<string, string>(
  (facilitiesData as Facility[])
    .filter((f) => Boolean(f.email?.trim()))
    .map((f) => [f.id, f.email.trim()]),
);

type AdminTab = "vacancies" | "feedback";
type VacancyFilter = "pending" | "expiring" | "approved" | "rejected" | "all";
type FeedbackFilter = "open" | "resolved" | "all";

function isExpiringSoon(sub: VacancySubmissionDoc): boolean {
  if (sub.status !== "approved") return false;
  const days = daysUntilExpiry(sub.expiresAt);
  return days !== null && days <= 9;
}

function buildFollowUpMailto(
  sub: VacancySubmissionDoc,
  targetEmail: string,
): string {
  const reportedDate =
    formatVacancyLastUpdated(sub.updatedAt) ?? "recently";
  const subject = encodeURIComponent(
    `Checking in: Current childcare availability at ${sub.facilityName}`,
  );
  const greeting = sub.reporterName ? `Hi ${sub.reporterName},` : "Hi there,";
  const body = encodeURIComponent(
    `${greeting}\n\n` +
      `Thank you for sharing an availability update for ${sub.facilityName} on Victoria Childcare Hub (${reportedDate}).\n\n` +
      `Our community updates automatically expire after 30 days so families don't rely on outdated openings. Are spots still available at ${sub.facilityName}?\n\n` +
      `You can reply directly to this email (or update it anytime at https://victoriachildcarehub.ca/#/app/list) and I'll refresh the listing right away.\n\n` +
      `Best,\nVictoria Childcare Hub`,
  );
  return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
}

function formatDateTime(ms: number, fallbackIso?: string): string {
  const date = ms ? new Date(ms) : fallbackIso ? new Date(fallbackIso) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const isAdmin = isAdminUser(user);

  const [tab, setTab] = useState<AdminTab>("vacancies");
  const [vacancyFilter, setVacancyFilter] = useState<VacancyFilter>("pending");
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>("open");

  const [submissions, setSubmissions] = useState<VacancySubmissionDoc[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackDoc[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingData(true);
    setErrorMsg("");
    try {
      const [subs, fbs] = await Promise.all([
        fetchVacancySubmissions(),
        fetchFeedbackItems(),
      ]);
      setSubmissions(subs);
      setFeedbacks(fbs);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setErrorMsg(
        "Could not load Firestore data. Make sure the updated firestore.rules are published in Firebase Console.",
      );
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAll();
    }
  }, [isAdmin, loadAll]);

  const handleApprove = async (sub: VacancySubmissionDoc) => {
    setBusyId(sub.docId);
    setErrorMsg("");
    try {
      await approveVacancySubmission(sub);
      setSubmissions((prev) =>
        prev.map((item) =>
          item.docId === sub.docId ? { ...item, status: "approved" } : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to approve submission. Check Firestore rules.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (docId: string) => {
    setBusyId(docId);
    setErrorMsg("");
    try {
      await rejectVacancySubmission(docId);
      setSubmissions((prev) =>
        prev.map((item) =>
          item.docId === docId ? { ...item, status: "rejected" } : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to reject submission.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteSubmission = async (docId: string) => {
    setBusyId(docId);
    setErrorMsg("");
    try {
      await deleteVacancySubmission(docId);
      setSubmissions((prev) => prev.filter((item) => item.docId !== docId));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete submission.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRenew = async (sub: VacancySubmissionDoc) => {
    setBusyId(sub.docId);
    setErrorMsg("");
    try {
      const { updatedAt, expiresAt } = await renewVacancySubmission(sub);
      setSubmissions((prev) =>
        prev.map((item) =>
          item.docId === sub.docId
            ? { ...item, status: "approved", updatedAt, expiresAt }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to renew submission.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFeedback = async (fb: FeedbackDoc) => {
    setBusyId(fb.docId);
    setErrorMsg("");
    const nextResolved = !fb.resolved;
    try {
      await toggleFeedbackResolved(fb.docId, nextResolved);
      setFeedbacks((prev) =>
        prev.map((item) =>
          item.docId === fb.docId ? { ...item, resolved: nextResolved } : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update feedback status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteFeedback = async (docId: string) => {
    setBusyId(docId);
    setErrorMsg("");
    try {
      await deleteFeedbackItem(docId);
      setFeedbacks((prev) => prev.filter((item) => item.docId !== docId));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete feedback.");
    } finally {
      setBusyId(null);
    }
  };

  const openFacilityInApp = (facilityId: string) => {
    setSelectedFacility(facilityId);
    setActiveTab("list");
    window.location.hash = "#/app/list";
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const expiringCount = submissions.filter(isExpiringSoon).length;
  const openFeedbackCount = feedbacks.filter((f) => !f.resolved).length;

  const filteredSubmissions = submissions.filter((s) => {
    if (vacancyFilter === "all") return true;
    if (vacancyFilter === "expiring") return isExpiringSoon(s);
    return s.status === vacancyFilter;
  });
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackFilter === "open") return !f.resolved;
    if (feedbackFilter === "resolved") return Boolean(f.resolved);
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg text-sm text-stone-500 dark:text-stone-400">
        Checking authentication...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 theme-bg">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-lg dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl dark:bg-emerald-950/50">
            🔐
          </div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Admin Review Queue
          </h1>
          {user ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Signed in as <strong>{user.email}</strong>, which does not have admin access. Please sign in with <strong>{ADMIN_EMAIL}</strong>.
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full rounded-lg border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Sign in with your Google admin account to review pending availability reports and community feedback.
              </p>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
              >
                Sign in with Google
              </button>
            </div>
          )}
          <div className="pt-2">
            <a
              href="#/app/list"
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              ← Back to Victoria Childcare Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg text-stone-900 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="#/app/list"
              className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              ← Back to App
            </a>
            <div>
              <h1 className="text-base font-bold">Admin Review Queue</h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Signed in as {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAll}
            disabled={loadingData}
            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 disabled:opacity-50 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 cursor-pointer"
          >
            {loadingData ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Primary Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setTab("vacancies")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              tab === "vacancies"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            <span>Availability Reports</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {pendingCount} pending
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("feedback")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              tab === "feedback"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            <span>Feedback &amp; Corrections</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {openFeedbackCount} open
            </span>
          </button>
        </div>

        {tab === "vacancies" ? (
          <div className="space-y-4">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: "pending", label: "Pending", count: pendingCount },
                  { key: "expiring", label: "Expiring Soon", count: expiringCount },
                  {
                    key: "approved",
                    label: "Approved",
                    count: submissions.filter((s) => s.status === "approved").length,
                  },
                  {
                    key: "rejected",
                    label: "Rejected",
                    count: submissions.filter((s) => s.status === "rejected").length,
                  },
                  { key: "all", label: "All", count: submissions.length },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setVacancyFilter(f.key)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    vacancyFilter === f.key
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {loadingData && submissions.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">
                Loading availability submissions...
              </p>
            ) : filteredSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                No {vacancyFilter === "all" ? "" : vacancyFilter} availability submissions found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((sub) => {
                  const meta = getVacancySourceMeta(sub);
                  const groups = summarizeReportedAgeGroups(sub);
                  const isBusy = busyId === sub.docId;
                  const daysLeft = daysUntilExpiry(sub.expiresAt);
                  const followUpEmail =
                    sub.reporterEmail?.trim() ||
                    facilityEmailMap.get(sub.facilityId) ||
                    "";

                  return (
                    <div
                      key={sub.docId}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3 dark:border-stone-800 dark:bg-stone-900"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openFacilityInApp(sub.facilityId)}
                              className="text-sm font-bold text-stone-900 hover:text-emerald-600 hover:underline dark:text-stone-100 cursor-pointer text-left"
                            >
                              {sub.facilityName}
                            </button>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                sub.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : sub.status === "rejected"
                                    ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              }`}
                            >
                              {sub.status}
                            </span>
                            {sub.status === "approved" && daysLeft !== null && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  daysLeft <= 0
                                    ? "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                                    : daysLeft <= 9
                                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300"
                                      : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                                }`}
                              >
                                {daysLeft <= 0
                                  ? "Expired"
                                  : `${daysLeft}d left`}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {meta.emoji} {meta.fullLabel} &middot;{" "}
                            {formatDateTime(sub.createdAtMs, sub.updatedAt)}
                            {(sub.reporterName || sub.reporterEmail) && (
                              <>
                                {" "}
                                &middot; Reporter:{" "}
                                {sub.reporterName || "Anonymous"}
                                {sub.reporterEmail
                                  ? ` (${sub.reporterEmail})`
                                  : ""}
                              </>
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {sub.status !== "approved" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleApprove(sub)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                            >
                              ✓ Approve &amp; Publish
                            </button>
                          )}
                          {sub.status === "approved" && (
                            <>
                              {followUpEmail && (
                                <a
                                  href={buildFollowUpMailto(sub, followUpEmail)}
                                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                                  title={`Email ${followUpEmail} to check if spots are still open`}
                                >
                                  ✉️ Follow up
                                </a>
                              )}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRenew(sub)}
                                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30 cursor-pointer"
                                title="Reset 30-day expiration from today"
                              >
                                ↻ +30d Renew
                              </button>
                            </>
                          )}
                          {sub.status === "pending" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleReject(sub.docId)}
                              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteSubmission(sub.docId)}
                            className="rounded-lg px-2 py-1.5 text-xs text-stone-400 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                            title="Delete submission record"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {groups.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {groups.map((g) => (
                            <span
                              key={g.key}
                              className={
                                g.status === "available"
                                  ? "rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "rounded-md bg-amber-100/70 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                              }
                            >
                              {g.label}:{" "}
                              {g.status === "available"
                                ? "Spaces available"
                                : "Waitlist"}
                            </span>
                          ))}
                        </div>
                      )}

                      {sub.note && (
                        <p className="rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700 italic dark:bg-stone-950 dark:text-stone-300">
                          &ldquo;{sub.note}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Feedback Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(["open", "resolved", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFeedbackFilter(f)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition cursor-pointer ${
                    feedbackFilter === f
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400"
                  }`}
                >
                  {f} (
                  {f === "all"
                    ? feedbacks.length
                    : f === "open"
                      ? feedbacks.filter((x) => !x.resolved).length
                      : feedbacks.filter((x) => x.resolved).length}
                  )
                </button>
              ))}
            </div>

            {loadingData && feedbacks.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">
                Loading feedback...
              </p>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                No {feedbackFilter === "all" ? "" : feedbackFilter} feedback items found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedbacks.map((fb) => {
                  const isBusy = busyId === fb.docId;
                  return (
                    <div
                      key={fb.docId}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2.5 dark:border-stone-800 dark:bg-stone-900"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                              {fb.type}
                            </span>
                            {fb.facilityName && (
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                {fb.facilityId ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFacilityInApp(fb.facilityId!)
                                    }
                                    className="hover:text-emerald-600 hover:underline cursor-pointer"
                                  >
                                    {fb.facilityName}
                                  </button>
                                ) : (
                                  fb.facilityName
                                )}
                              </span>
                            )}
                            {fb.resolved && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Resolved
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {formatDateTime(fb.createdAtMs)} &middot;{" "}
                            {fb.name || "Anonymous"}
                            {fb.email ? ` (${fb.email})` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleFeedback(fb)}
                            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer"
                          >
                            {fb.resolved ? "Reopen" : "✓ Mark Resolved"}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteFeedback(fb.docId)}
                            className="rounded-lg px-2 py-1.5 text-xs text-stone-400 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                            title="Delete feedback"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <p className="rounded-xl bg-stone-50 p-3 text-xs leading-relaxed text-stone-700 whitespace-pre-wrap dark:bg-stone-950 dark:text-stone-200">
                        {fb.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
