import { Link } from "react-router-dom"

import { LegalPage, LegalSection } from "@/components/legal/LegalPage"
import {
  AUDIT_LOG_RETENTION_DAYS,
  BACKUP_RETENTION_DAYS,
  CONTACT_EMAIL,
  OPERATOR_NAME,
} from "@/lib/legal"

const mailto = `mailto:${CONTACT_EMAIL}`

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <>
          <p className="font-medium">The short version:</p>
          <ul className="mt-2 space-y-1.5 [&>li]:ml-5 [&>li]:list-disc">
            <li>
              Your <strong>emergency page is public by design</strong>: anyone who has your QR code or link can see it,
              without logging in.
            </li>
            <li>
              Medical reports you upload are <strong>sent to Google's Gemini AI</strong> to create your summary and
              timeline. MedInfo uses Gemini's free tier, so Google may use that content to improve its products.
            </li>
            <li>We don't sell your data, show ads, or use tracking or analytics tools.</li>
            <li>You can edit your information at any time, and delete your account and all of its data yourself.</li>
          </ul>
        </>
      }
    >
      <LegalSection title="1. Who we are">
        <p>
          MedInfo (<a href="https://www.medinfo.org.in" className="underline">medinfo.org.in</a>) is a personal project
          operated by {OPERATOR_NAME}, an individual based in India ("we", "us"). We decide how your data is used and are
          responsible for it. Contact:{" "}
          <a href={mailto} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          This policy applies to the MedInfo website and its services. By creating an account you confirm you have read
          it and agree to the processing described here, including of your health information.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <ul>
          <li>
            <strong>Account:</strong> your full name, email address, password (stored only as a one-way hash, never in
            readable form), whether your email is verified, and when you accepted these terms.
          </li>
          <li>
            <strong>Medical profile:</strong> age, gender, blood group, height, weight, allergies, medical conditions,
            current medications, and whether you are an organ donor.
          </li>
          <li>
            <strong>Emergency contacts:</strong> name, relationship and phone number of the people you add.
          </li>
          <li>
            <strong>Medical reports:</strong> the PDF files you upload, the text read from them, and the AI-generated
            summary and dated timeline created from them.
          </li>
          <li>
            <strong>Emergency page access logs:</strong> when someone opens your emergency page, we may record the time,
            their IP address and browser details, for security and misuse prevention.
          </li>
          <li>
            <strong>Technical logs:</strong> our servers keep short-lived logs of requests and errors to keep the service
            running.
          </li>
        </ul>
        <p>
          Your browser stores your login token and your emergency link (local storage) so you stay signed in. We don't
          use advertising, tracking or analytics cookies.
        </p>
      </LegalSection>

      <LegalSection id="public-page" title="3. Your public emergency page">
        <p>
          The point of MedInfo is that someone helping you in an emergency can see your critical information instantly.
          So <strong>anyone who has your QR code or emergency link can open your emergency page without logging in</strong>
          , and see:
        </p>
        <ul>
          <li>your full name, age and gender</li>
          <li>blood group and organ donor status</li>
          <li>allergies, medical conditions and current medications</li>
          <li>your AI medical summary and medical timeline</li>
          <li>your emergency contacts' names, relationships and phone numbers</li>
        </ul>
        <p>
          Emergency pages are not listed anywhere on MedInfo and ask search engines not to index them, but we can't
          control who you share the QR code or link with, or where it ends up. Treat it like your ID card: share it only
          where it's needed. Your height, weight, uploaded files and the full text of your reports are never shown there.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="4. AI processing with Google Gemini">
        <p>
          When you upload a medical report, its text and page images are sent to the <strong>Google Gemini API</strong>{" "}
          (Google LLC) to read the report and produce a summary and a dated timeline. The combined summary is updated
          with Gemini as well.
        </p>
        <p>
          <strong>MedInfo currently uses Gemini's free tier.</strong> Under Google's terms for the free tier, Google may
          use the content sent to it to provide, improve and develop its products, and people at Google may review it.
          Please don't upload a report unless you're comfortable with that. Google's practices are governed by{" "}
          <a href="https://ai.google.dev/gemini-api/terms" className="underline" target="_blank" rel="noreferrer">
            the Gemini API terms
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noreferrer">
            Google's Privacy Policy
          </a>
          .
        </p>
        <p>
          AI can make mistakes. We check each timeline entry against the report's own wording and drop entries we can't
          match, but summaries and timelines may still be incomplete or wrong. They are not medical advice.
        </p>
      </LegalSection>

      <LegalSection title="5. Why we use your data">
        <ul>
          <li>to run your account and verify your email address;</li>
          <li>to show your emergency page to the people you share it with;</li>
          <li>to create your AI summary and timeline from the reports you upload;</li>
          <li>to keep the service secure, prevent misuse and fix problems.</li>
        </ul>
        <p>
          We rely on your consent, given when you create your account and when you upload a report. We never sell your
          data, use it for advertising, or share it with anyone except the service providers below.
        </p>
      </LegalSection>

      <LegalSection title="6. Service providers and where your data is stored">
        <ul>
          <li>
            <strong>Contabo</strong>: our servers and database, located in the European Union.
          </li>
          <li>
            <strong>Vercel</strong>: hosts the website you load in your browser.
          </li>
          <li>
            <strong>Cloudflare</strong>: domain name and network services.
          </li>
          <li>
            <strong>Brevo</strong>: sends our emails (such as email verification).
          </li>
          <li>
            <strong>Google</strong>: the Gemini AI described in section 4.
          </li>
        </ul>
        <p>
          This means your data is processed outside India. These providers handle it only to provide their service to
          us.
        </p>
      </LegalSection>

      <LegalSection title="7. How long we keep it">
        <ul>
          <li>Your account, profile, contacts, reports and timeline: until you delete them or your account.</li>
          <li>Emergency page access logs: {AUDIT_LOG_RETENTION_DAYS} days, then deleted automatically.</li>
          <li>
            Database backups: kept for {BACKUP_RETENTION_DAYS} days, so deleted data can remain in a backup for up to{" "}
            {BACKUP_RETENTION_DAYS} days before it is gone for good.
          </li>
          <li>Server logs: short-lived and rotated automatically.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use HTTPS for all connections, store passwords only as one-way hashes, keep the database on a private network
          that isn't reachable from the internet, and require login for everything except your emergency page. No
          system is perfectly secure, though, and we can't guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="9. Your rights and choices">
        <ul>
          <li>
            <strong>See and correct</strong> your information at any time on your Profile and Contacts pages.
          </li>
          <li>
            <strong>Delete</strong> your medical profile (which also removes your reports and timeline) from the Profile
            page, or <strong>delete your whole account</strong> and everything in it from the Dashboard.
          </li>
          <li>
            <strong>Withdraw consent</strong> by deleting your account. This doesn't affect processing that already
            happened, such as reports already sent to Gemini.
          </li>
          <li>
            <strong>Ask questions, request a copy of your data, nominate someone to act for you, or raise a complaint</strong>{" "}
            by emailing{" "}
            <a href={mailto} className="underline">
              {CONTACT_EMAIL}
            </a>
            . We aim to reply within 30 days. If you're not satisfied, you may complain to the Data Protection Board of
            India.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="10. Other people's information">
        <p>
          Only add another person's information, such as a family member's reports or an emergency contact's phone
          number, if you have their permission or are legally entitled to act for them. Emergency contacts' details are
          shown on your public emergency page.
        </p>
      </LegalSection>

      <LegalSection title="11. Age">
        <p>MedInfo is for adults. You must be 18 or older to create an account.</p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          If we change this policy, we'll update the date at the top. For important changes we'll let you know on the
          website or by email before they take effect.
        </p>
      </LegalSection>

      <p>
        Please also read our <Link to="/terms" className="underline">Terms of Service</Link>.
      </p>
    </LegalPage>
  )
}
