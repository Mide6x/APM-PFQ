import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy and your data | APM Study",
  description: "How APM Study handles information, cookies and requests to access, correct or delete your data.",
};

const contact = "adewoleolumide05@gmail.com";
const requests = [
  {
    label: "Request access and a copy",
    subject: "Subject access request",
    body: "I would like to know whether APM Study holds personal information about me and request a copy. Please explain the purposes, recipients and retention. I can provide information reasonably needed to verify my identity.",
  },
  {
    label: "Correct or change my details",
    subject: "Personal data correction request",
    body: "I would like APM Study to correct personal information about me. I will describe the information and the correction needed in this email.",
  },
  {
    label: "Request deletion",
    subject: "Personal data deletion request",
    body: "I would like APM Study to delete personal information about me. Please explain any information that must be retained and why.",
  },
  {
    label: "Request a portable copy",
    subject: "Data portability request",
    body: "I would like a portable copy of my personal information where the right to data portability applies.",
  },
  {
    label: "Restrict processing or object",
    subject: "Restriction or objection request",
    body: "I would like to restrict or object to processing of my personal information. I will explain the processing concerned in this email.",
  },
  {
    label: "Ask a question or withdraw consent",
    subject: "Privacy question or consent withdrawal",
    body: "I have a privacy question or would like to withdraw consent for processing based on consent. I will explain my request in this email.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-brand"><BookOpen size={24} aria-hidden="true" /><strong>APM PFQ <span>Study Hub</span></strong></Link>
        <Link href="/" className="detail-back"><ArrowLeft size={16} aria-hidden="true" /> Back to roadmap</Link>
      </header>
      <article className={`detail-content ${styles.article}`}>
        <h1>Privacy and your data</h1>
        <p className={styles.updated}>Last updated: 14 November 2026</p>
        <p><strong>APM Study</strong> is responsible for how this website uses your information. Contact us at <a href={`mailto:${contact}`}>{contact}</a>. This is an independent study companion, not an official APM service.</p>
        <nav className={styles.contents} aria-label="Privacy page sections">
          <a href="#information">Your information</a>
          <a href="#cookies">Cookies and storage</a>
          <a href="#requests">Make a data request</a>
          <a href="#account-changes">Change your details</a>
        </nav>

        <section id="information">
          <h2>What this version collects</h2>
          <p>You can browse without an account. Magic-link sign-in stores your email and a private account identifier with Supabase. If you choose Save my place, we store your selected topic and when it was saved so you can resume on another device. We do not ask for a name or public username. Lesson completion and saved quiz attempts are not available yet.</p>
          <dl className={styles.dataList}>
            <div><dt>Browsing the study hub</dt><dd>Your browser sends your IP address, browser information and requested page to the web server. The hosting provider may keep operational and security logs. The app server reads the public study catalogue from Supabase; the browser does not query Supabase directly for it.</dd></div>
            <div><dt>Searching topics</dt><dd>Your search stays in the page’s memory. It is not submitted to our server or saved to persistent browser storage. A full page navigation resets it.</dd></div>
            <div><dt>Signing in</dt><dd>Your email is sent to Supabase through our server to request a one-time sign-in link. Opening that link in the same browser exchanges it for a verified session. Authentication credentials and email addresses are not added to our application logs or analytics. Supabase may maintain its own security and delivery logs. When configured, Cloudflare Turnstile checks the sign-in request for abuse and processes technical information such as IP and browser details.</dd></div>
            <div><dt>Contacting us</dt><dd>If you email us, we receive your email address, any name you provide, your message and its attachments in our Gmail inbox. Share only what is needed for your request.</dd></div>
          </dl>
          <h3>Why we use information</h3>
          <p>We use your account information to provide the sign-in and saved-place service you request. Our legitimate interests are to deliver public study pages, prevent abuse and reply to ordinary correspondence. We handle legal data-rights requests to meet our legal obligations. We do not sell personal information, run advertising or analytics, or make automated decisions with legal or similarly significant effects about you.</p>
        </section>

        <section id="cookies">
          <h2>Cookies and storage settings</h2>
          <p>Sign-in uses strictly necessary cookies to keep your session and limit repeated sign-in requests. No optional analytics or marketing is installed, and no cookie-choice record is stored. Public topics remain browsable without signing in, and all features work without optional tracking.</p>
          <table className={styles.storageTable}>
            <caption>Storage used by this release</caption>
            <thead><tr><th scope="col">Category</th><th scope="col">Current use</th></tr></thead>
            <tbody>
              <tr><th scope="row">Essential session</th><td><code>apm-auth</code> and numbered chunks such as <code>apm-auth.0</code> hold the session. Maximum browser lifetime is seven days, renewed when the session is refreshed; the provider also checks token expiry. These are HttpOnly, SameSite=Lax and Secure on production HTTPS. Signing out removes this device’s session cookies.</td></tr>
              <tr><th scope="row">Essential sign-in flow</th><td><code>apm-auth-code-verifier</code>, <code>apm-auth-flows-code-verifier</code> and per-request <code>apm-auth-flow-…-code-verifier</code> cookies support the authentication exchange for up to ten minutes. <code>apm-sign-in-retry-at</code> limits resends for up to 60 seconds and contains a retry timestamp, not your email or code. Signing out removes these app cookies too.</td></tr>
              <tr><th scope="row">Essential abuse prevention</th><td>Cloudflare Turnstile loads only on sign-in when configured. Its challenge response stays in page memory until submitted or expired. This app does not enable Turnstile pre-clearance cookies. See <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare’s privacy notice</a> for its processing.</td></tr>
              <tr><th scope="row">Functional and preferences</th><td>No preference cookies, local storage or session storage. Search uses temporary page memory; your explicitly saved place is held in the private database instead.</td></tr>
              <tr><th scope="row">Analytics</th><td>Not installed. No analytics cookies, identifiers or engagement events.</td></tr>
              <tr><th scope="row">Marketing</th><td>Not installed. No advertising cookies or tracking pixels.</td></tr>
              <tr><th scope="row">Local development only</th><td>Next.js may set the session cookie <code>__next_hmr_refresh_hash__</code> for hot reload. It is not a production learner-tracking cookie.</td></tr>
            </tbody>
          </table>
          <p>Fonts are served by this website; your browser does not contact Google Fonts to display them. External APM links and email links leave this website when you choose them. Other services have their own privacy and storage practices.</p>
          <p>There is no optional cookie setting to turn on today. If optional tracking is introduced, it will stay off until you choose it and you will be able to withdraw that choice. See the <a href="https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/">ICO’s storage and cookie guidance</a>.</p>
        </section>

        <section id="providers">
          <h2>Providers and retention</h2>
          <p>We use <a href="https://supabase.com/privacy">Supabase</a> for authentication, the study database and the project’s sign-in email delivery, <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare</a> for sign-in security verification when configured, and <a href="https://policies.google.com/privacy">Google’s Gmail</a> for correspondence. Information is shared only as needed to operate these services, handle your request or meet legal requirements.</p>
          <p>Account details and your saved place are retained while your account remains open. You can request deletion; after identity verification, deleting the Supabase account also removes its saved-place record. Provider backup and log retention must be confirmed for the deployment. Our retention policy for privacy-request correspondence is up to 12 months after a request is closed, unless a legal dispute or legal obligation requires longer retention.</p>
          <p>The production hosting provider, deployment region and access-log retention have not yet been confirmed. These details, processor arrangements and any safeguards for transfers outside the UK or EEA must be documented before public account registration opens. We do not claim that all provider processing stays in the UK or EEA.</p>
        </section>

        <section id="requests">
          <h2>Access, correct or delete your data</h2>
          <p>You can ask whether we hold information about you, request a copy, correct it or request its deletion. You can also request restriction, object to processing, request portability where applicable, or withdraw consent where consent is used. Some rights have legal limits; we will explain these when they apply.</p>
          <p>No sign-in is needed to make a request. The links below open your email app with a draft. <strong>Nothing is sent by this website.</strong> If you do not have an email app configured, write directly to <a href={`mailto:${contact}`}>{contact}</a>.</p>
          <ul className={styles.requestList}>
            {requests.map((request) => (
              <li key={request.subject}>
                <a href={`mailto:${contact}?subject=${encodeURIComponent(request.subject)}&body=${encodeURIComponent(request.body)}`}>
                  {request.label}<ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p>We may ask for information reasonably needed to verify your identity before disclosing or changing personal information. Do not email passwords, one-time codes or unsolicited identity-document scans.</p>
          <p>We normally respond within one calendar month. If a lawful extension is needed, we will tell you why and when to expect a response. You can read more about <a href="https://ico.org.uk/for-the-public/getting-copies-of-your-information-subject-access-request/">requesting a copy of your information from the ICO</a>.</p>
        </section>

        <section id="account-changes">
          <h2>Changing account details</h2>
          <p>Open <Link href="/account">Your account</Link> to request an email change. A recent magic-link sign-in is required, and the change is not complete until the email confirmation process succeeds. No display name is collected. To correct other information you have shared with APM Study, use <a href="#requests">Correct or change my details</a> above.</p>
          <p>Export and deletion requests are handled through the privacy contact after proportionate identity verification. Signing out clears this device’s session but does not delete your account or saved place.</p>
        </section>

        <section id="complaints">
          <h2>Questions and complaints</h2>
          <p>Contact <a href={`mailto:${contact}`}>{contact}</a> if something is unclear or you are unhappy with how a request was handled. You can also <a href="https://ico.org.uk/make-a-complaint/">complain to the UK Information Commissioner’s Office</a>, or contact your local EEA supervisory authority where applicable.</p>
        </section>
        <Link href="/" className="detail-action"><ArrowLeft size={17} aria-hidden="true" /> Back to roadmap</Link>
      </article>
      <SiteFooter />
    </main>
  );
}
