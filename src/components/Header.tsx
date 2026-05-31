import { Github } from 'lucide-react'

interface HeaderProps {
  onReset?: () => void
  showReset?: boolean
}

export function Header({ onReset, showReset }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-stone-800/60 bg-charcoal-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Title */}
          <button
            onClick={showReset ? onReset : undefined}
            className="flex items-center gap-3 group"
          >
            {/* Blood drop icon */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <path
                  d="M16 4 C16 4, 8 14, 8 20 C8 24.4 11.6 28 16 28 C20.4 28 24 24.4 24 20 C24 14 16 4 16 4Z"
                  className="fill-blood-700 group-hover:fill-blood-600 transition-colors"
                />
                <ellipse cx="12.5" cy="18" rx="2.5" ry="3.5"
                  fill="rgba(255,255,255,0.1)"
                  transform="rotate(-20 12.5 18)"
                />
              </svg>
              {showReset && (
                <>
                  <div className="ring-pulse" style={{ inset: '-6px', borderRadius: '50%' }} />
                </>
              )}
            </div>

            <div>
              <div className="font-serif font-bold text-lg tracking-widest text-stone-100 group-hover:text-blood-300 transition-colors uppercase leading-none">
                Raktabeej
              </div>
              <div className="text-xs text-stone-500 font-mono tracking-wider leading-none mt-0.5">
                Dataset Generation Engine
              </div>
            </div>
          </button>

          {/* Right: dev credit + github */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-stone-500 font-sans">Developer</div>
              <div className="text-sm text-copper font-sans font-medium">Arun VK</div>
            </div>
            <a
              href="https://github.com/ArunVijaykumarcsds"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-stone-500 hover:text-stone-300 hover:bg-stone-800/50 transition-colors"
              title="GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
