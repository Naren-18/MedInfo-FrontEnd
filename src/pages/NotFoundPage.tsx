import { Link } from "react-router-dom"
import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Compass className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button asChild>
        <Link to="/">Back home</Link>
      </Button>
    </div>
  )
}
