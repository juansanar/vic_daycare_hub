import { useState, useEffect } from "react";
import { useStore } from "../store";
import { submitFeedback, type FeedbackSubmission } from "../lib/feedback";

export default function FeedbackModal() {
  const isFeedbackOpen = useStore((s) => (s as any).isFeedbackOpen);
  const feedbackFacilityId = useStore((s) => (s as any).feedbackFacilityId);
  const feedbackFacilityName = useStore((s) => (s as any).feedbackFacilityName);
  const setFeedbackOpen = useStore((s) => (s as any).setFeedbackOpen);

  const [type, setType] = useState<FeedbackSubmission["type"]>("correction");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Pre-fill facility info when the modal opens with context
  useEffect(() => {
    if (isFeedbackOpen) {
      setFacilityName(feedbackFacilityName || "");
      setType(feedbackFacilityId ? "correction" : "suggestion");
      // Reset status
      setSubmitSuccess(false);
      setErrorMsg("");
      setFallbackUsed(false);
      setMessage("");
    }
  }, [isFeedbackOpen, feedbackFacilityId, feedbackFacilityName]);

  if (!isFeedbackOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Please enter your message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await submitFeedback({
        type,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        facilityId: feedbackFacilityId || undefined,
        facilityName: facilityName.trim() || undefined,
        message: message.trim(),
      });

      if (res.success) {
        setSubmitSuccess(true);
        if (res.fallbackUsed) {
          setFallbackUsed(true);
        } else {
          // Auto close after 2 seconds for a slick experience
          setTimeout(() => {
            handleClose();
          }, 2500);
        }
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedbackOpen(false);
    // Clear fields
    setName("");
    setEmail("");
    setFacilityName("");
    setMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300 dark:bg-black/75"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300 transform scale-100 dark:border-stone-800 dark:bg-stone-900">
        
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-emerald-600 dark:bg-emerald-700" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-stone-50">
              {submitSuccess ? "Thank you!" : "Suggest a Correction / Feedback"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-400 hover:bg-stone-155 hover:text-gray-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {submitSuccess ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 animate-bounce">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-stone-200">
                {fallbackUsed ? "Email Drafted Successfully" : "Feedback Submitted!"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-stone-400 max-w-xs">
                {fallbackUsed 
                  ? "We've opened your default email client with a pre-filled template. Please review and hit send to submit your feedback!" 
                  : "Thank you for helping improve the Victoria Childcare Hub. Community reports keep the data fresh for everyone."}
              </p>
              {fallbackUsed && (
                <button
                  onClick={handleClose}
                  className="mt-6 rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Done
                </button>
              )}
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Select */}
              <div>
                <label htmlFor="feedback-type" className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-1">
                  Submission Type
                </label>
                <select
                  id="feedback-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-850 dark:bg-stone-950 dark:text-stone-200 dark:focus:border-emerald-600 dark:focus:bg-stone-950"
                >
                  <option value="correction">Suggest a Correction (Facility data, fees, vacancy)</option>
                  <option value="bug">Report a Bug / Technical Issue</option>
                  <option value="suggestion">New Feature Idea / Suggestion</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              {/* Grid for Name and Email */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="feedback-name" className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-850 dark:bg-stone-950 dark:text-stone-205 dark:placeholder-stone-600 dark:focus:border-emerald-600 dark:focus:bg-stone-950"
                  />
                </div>
                <div>
                  <label htmlFor="feedback-email" className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-850 dark:bg-stone-950 dark:text-stone-205 dark:placeholder-stone-600 dark:focus:border-emerald-600 dark:focus:bg-stone-950"
                  />
                </div>
              </div>

              {/* Facility Name (if correction) */}
              {(type === "correction" || feedbackFacilityId) && (
                <div>
                  <label htmlFor="feedback-facility" className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-1">
                    Facility Name
                  </label>
                  <input
                    id="feedback-facility"
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="e.g., Happy Trails Daycare"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-850 dark:bg-stone-950 dark:text-stone-205 dark:placeholder-stone-600 dark:focus:border-emerald-600 dark:focus:bg-stone-950"
                  />
                  {feedbackFacilityId && (
                    <span className="mt-1 block text-[10px] text-gray-400 dark:text-stone-550">
                      Linking report to Facility ID: <code className="rounded-sm bg-stone-100 px-1 dark:bg-stone-800">{feedbackFacilityId}</code>
                    </span>
                  )}
                </div>
              )}

              {/* Message */}
              <div>
                <label htmlFor="feedback-message" className="block text-xs font-medium text-gray-500 dark:text-stone-400 mb-1">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "correction"
                      ? "Please describe the correct details (e.g. fee has changed to $800, vacancy is now full, contact phone number updated)."
                      : "Describe the suggestion, idea, or bug report..."
                  }
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-850 dark:bg-stone-950 dark:text-stone-205 dark:placeholder-stone-600 dark:focus:border-emerald-600 dark:focus:bg-stone-950"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-medium" role="alert">
                  {errorMsg}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-stone-250 px-4 py-2 text-xs font-medium text-gray-650 transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
