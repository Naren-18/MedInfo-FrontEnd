import { Link } from "react-router-dom"
import { Eye } from "lucide-react"

/**
 * Reminds the user, where they enter or share data, that the emergency page is
 * public to anyone with the QR code or link — the key fact of the Privacy Policy.
 */
export function PublicVisibilityNotice({ about = "profile" }: { about?: "profile" | "contacts" }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="leading-relaxed text-muted-foreground">
        {about === "contacts" ? (
          <>
            <span className="font-medium text-foreground">Contacts appear on your public emergency page.</span> Their
            names, relationships and phone numbers are visible to anyone with your QR code or link, so only add people
            who have agreed to that.
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">Anyone with your QR code or link can see this, without logging in:</span>{" "}
            your name, age, gender, blood group, organ donor status, allergies, conditions, medications, AI summary,
            medical timeline and emergency contacts. Height, weight and your uploaded files stay private.
          </>
        )}{" "}
        <Link to="/privacy#public-page" className="font-medium text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
