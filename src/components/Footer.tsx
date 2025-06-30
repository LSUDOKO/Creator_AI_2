import { GitFork, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-between gap-4">
      <a
        href="https://github.com/Tavus-Engineering/tavus-vibecode-quickstart"
        target="_blank"
        className="hover:shadow-footer-btn relative flex items-center justify-center gap-2 rounded-3xl border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] px-2 py-3 text-sm text-white transition-all duration-200 hover:text-primary sm:p-4 h-[44px]"
      >
        <GitFork className="size-4" /> Fork the demo
      </a>

      <a
        href="https://docs.tavus.io/sections/conversational-video-interface/cvi-overview"
        target="_blank"
        className="relative flex items-center justify-center gap-2 rounded-3xl border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] px-2 py-3 text-sm text-white backdrop-blur-sm hover:bg-[rgba(255,255,255,0.15)] transition-colors duration-200 sm:p-4 h-[44px]"
      >
        How it works <ExternalLink className="size-4" />
      </a>
    </footer>
  );
};
