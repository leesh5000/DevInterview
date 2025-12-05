import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <p>&copy; 2025 DevInterview. All rights reserved.</p>
          <a
            href="mailto:leesh5000@gmail.com"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            leesh5000@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
