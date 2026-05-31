import { Github, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative border-t border-stone-800/40 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Brand */}
        <div className="text-center sm:text-left space-y-1">
          <p className="font-serif text-sm text-stone-400 tracking-widest uppercase">Raktabeej</p>
          <p className="text-xs text-stone-600 font-sans">Dataset Generation Engine · All processing local, zero uploads</p>
        </div>

        {/* Developer */}
        <div className="flex flex-col items-center sm:items-end gap-3">
          <p className="text-xs text-stone-500 font-sans">
            Built by <span className="text-copper font-medium">Arun VK</span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:arunvk.tech@gmail.com"
              className="text-stone-600 hover:text-stone-400 transition-colors"
              title="Email"
            >
              <Mail size={15} />
            </a>
            <a
              href="https://www.linkedin.com/in/arunvk2004/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-400 transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={15} />
            </a>
            <a
              href="https://github.com/ArunVijaykumarcsds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-400 transition-colors"
              title="GitHub"
            >
              <Github size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
