import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4 text-center">
      <div>
        <div className="text-[11px] tracking-[0.3em] uppercase text-primary">404</div>
        <h1 className="font-serif text-5xl mt-3">Page not found</h1>
        <p className="text-muted-foreground mt-3">
          The page you're looking for has moved or no longer exists.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
