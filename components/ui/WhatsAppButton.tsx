"use client";

import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hola, vi su página y quiero más información sobre...")}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-0 overflow-hidden rounded-full bg-[#25D366] p-4 shadow-[0_10px_30px_-8px_rgba(192,133,82,0.4)] transition-all hover:gap-2 hover:pr-5 focus-visible:outline-rose-gold"
      aria-label="Chatea con nosotras por WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="white" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.462 3.484 1.34 5.001L2 22l5.116-1.343a9.958 9.958 0 0 0 4.888 1.246h.004c5.514 0 9.996-4.483 9.996-9.997 0-2.671-1.04-5.182-2.929-7.071a9.93 9.93 0 0 0-7.07-2.832zm0 18.187h-.003a8.16 8.16 0 0 1-4.166-1.14l-.299-.177-3.037.797.81-2.96-.194-.304a8.163 8.163 0 0 1-1.256-4.359c0-4.512 3.672-8.184 8.187-8.184a8.13 8.13 0 0 1 5.79 2.398 8.13 8.13 0 0 1 2.396 5.791c-.001 4.512-3.674 8.184-8.184 8.184z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-white opacity-0 transition-all group-hover:max-w-xs group-hover:opacity-100">
        Chatea con nosotras
      </span>
    </a>
  );
}
