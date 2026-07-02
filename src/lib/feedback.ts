import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface FeedbackSubmission {
  name?: string;
  email?: string;
  type: "correction" | "bug" | "suggestion" | "other";
  facilityId?: string;
  facilityName?: string;
  message: string;
}

/**
 * Submits feedback. If Firebase Firestore is enabled, writes directly to the
 * 'feedback' collection. If disabled or writing fails, opens the user's email client
 * with a pre-filled message template.
 */
export async function submitFeedback(feedback: FeedbackSubmission): Promise<{ success: boolean; fallbackUsed?: boolean }> {
  // If Firestore is not initialized/enabled, trigger mailto fallback
  if (!db) {
    triggerMailtoFallback(feedback);
    return { success: true, fallbackUsed: true };
  }

  try {
    const colRef = collection(db, "feedback");
    await addDoc(colRef, {
      name: feedback.name || "",
      email: feedback.email || "",
      type: feedback.type,
      facilityId: feedback.facilityId || "",
      facilityName: feedback.facilityName || "",
      message: feedback.message,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback to Firestore, using mailto fallback:", error);
    triggerMailtoFallback(feedback);
    return { success: true, fallbackUsed: true };
  }
}

function triggerMailtoFallback(feedback: FeedbackSubmission) {
  const subject = encodeURIComponent(`Victoria Childcare Hub - ${feedback.type.toUpperCase()}`);
  
  let facilityInfo = "";
  if (feedback.facilityName) {
    facilityInfo = `Facility: ${feedback.facilityName}${feedback.facilityId ? ` (ID: ${feedback.facilityId})` : ""}\n`;
  }

  const body = encodeURIComponent(
    `Type: ${feedback.type}\n` +
    `Name: ${feedback.name || "Not provided"}\n` +
    `Email: ${feedback.email || "Not provided"}\n` +
    facilityInfo +
    `\nMessage:\n${feedback.message}\n\n` +
    `---\n` +
    `Browser details: ${navigator.userAgent}\n`
  );
  
  const mailtoUrl = `mailto:juan@juansanar.com?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, "_blank");
}
