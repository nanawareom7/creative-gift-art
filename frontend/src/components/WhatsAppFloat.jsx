import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/services/api";

export default function WhatsAppFloat() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <span className="absolute inset-0 rounded-full bg-primary/40 blur-xl group-hover:bg-primary/60 transition" />
      <span className="relative grid place-items-center h-14 w-14 rounded-full bg-[#25D366] text-white luxe-shadow hover:scale-110 transition-all">
        <MessageCircle className="h-6 w-6" />
      </span>
    </a>
  );
}
