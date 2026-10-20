import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minion Privacy Policy | Bryan Yung",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 leading-relaxed">
      <h1 className="mb-8 text-3xl font-semibold">Minion privacy policy</h1>
      <p className="mb-5">Last updated October 20, 2026.</p>
      <p className="mb-5">
        Minion is Bryan Yung&apos;s private personal assistant. Its Google connection
        accesses Gmail and Google Calendar only to answer Bryan&apos;s requests and run
        the personal workflows he has configured.
      </p>
      <p className="mb-5">
        Google account data is stored in private systems controlled by Bryan. It is
        not sold, used for advertising, or shared with third parties except service
        providers required to operate Minion. Access credentials are encrypted or
        stored in owner-only files and can be revoked from Google Account settings.
      </p>
      <p className="mb-5">
        Minion requests read-only Gmail access and Calendar access. Data is retained
        only as needed for the assistant&apos;s private history, tasks, and configured
        workflows. Bryan can delete that data or revoke access at any time.
      </p>
      <p>
        Questions or deletion requests: <a className="underline" href="mailto:byung806@gmail.com">byung806@gmail.com</a>.
      </p>
    </main>
  );
}
