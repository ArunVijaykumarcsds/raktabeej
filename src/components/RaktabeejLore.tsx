export function RaktabeejLore() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blood-950/10 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto">

        {/* Ornamental header */}
        <div className="ornament mb-10">
          <span className="font-serif italic text-blood-700 text-sm tracking-widest whitespace-nowrap">
            — The Legend —
          </span>
        </div>

        {/* Sanskrit nameplate */}
        <div className="text-center mb-10">
          <p className="font-serif text-5xl text-blood-800/50 mb-2 tracking-widest" style={{ fontStyle: 'italic' }}>
            रक्तबीज
          </p>
          <p className="font-serif text-2xl text-stone-300 tracking-widest uppercase">Raktabeej</p>
          <p className="text-xs text-stone-600 font-mono mt-2 tracking-widest">
            Sanskrit: रक्त (blood) + बीज (seed)
          </p>
        </div>

        {/* Lore content */}
        <div className="space-y-8 text-stone-400 font-sans leading-relaxed">

          <div className="space-y-4">
            <h3 className="font-serif text-lg text-stone-200 font-semibold">Who Was Raktabeej?</h3>
            <p>
              In the ancient Sanskrit scripture <span className="text-stone-300 italic">Devi Mahatmya</span> — composed within the Markandeya Purana — Raktabeej (रक्तबीज) stands as one of the most formidable generals in the army of the asura kings Shumbha and Nishumbha. His name translates directly from Sanskrit as <span className="text-stone-300">"blood-seed"</span> or <span className="text-stone-300">"he whose seeds are drops of blood."</span>
            </p>
            <p>
              Raktabeej possessed a divine boon — a terrible gift — granted by Lord Brahma himself: for every drop of his blood that fell upon the earth, an exact duplicate of Raktabeej would instantly arise, fully formed and equally powerful. In battle, this made him not merely difficult to defeat, but paradoxically <span className="text-stone-300 italic">impossible</span> — for every wound dealt to him only multiplied his strength. The armies of the gods struck him again and again, each blow summoning thousands of new warriors from the falling blood, until the battlefield was overrun with his countless forms.
            </p>
          </div>

          <div className="border-l-2 border-blood-900/60 pl-5">
            <p className="text-stone-500 italic font-serif text-base">
              "As each drop of blood fell from Raktabeej's body, another Raktabeej equal in valour and prowess arose. The gods were filled with great fear at this sight."
            </p>
            <p className="text-xs text-stone-600 font-mono mt-2">— Devi Mahatmya, Markandeya Purana</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg text-stone-200 font-semibold">Why Was His Boon Unbreakable?</h3>
            <p>
              The boon was not merely a form of regeneration — it was a <span className="text-stone-300">multiplication principle</span>. Each new instance was not a weakened copy but a complete, full-strength duplicate. Conventional combat could not defeat him because the act of resistance itself became the mechanism of his proliferation. Victory through force was structurally impossible.
            </p>
            <p>
              It was the goddess <span className="text-stone-300">Kali</span> — the fierce, boundless, time-embodying manifestation of the Divine Mother — who finally resolved the paradox. She consumed each drop of blood before it could reach the ground, drinking from Raktabeej's wounds as Durga slew him, preventing the multiplication at its source. The solution was not to fight harder, but to intercept the seed before it could propagate.
            </p>
          </div>

          {/* Divider */}
          <div className="ornament my-4">
            <span className="text-blood-900 text-xs font-mono tracking-widest">✦</span>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg text-stone-200 font-semibold">The Philosophy Behind This Project</h3>
            <p>
              Raktabeej's boon is a precise metaphor for what this engine does. A single video file — like a single drop of blood — contains within it the seed of an entire dataset. Left alone, it is one file. But when processed through the right system, it <span className="text-stone-300">propagates</span>: splitting into segments, each segment yielding dozens of frames, each frame becoming a structured, named data sample suitable for AI training, computer vision annotation, remote sensing analysis, or surveillance research.
            </p>
            <p>
              One video becomes hundreds or thousands of precisely timestamped, semantically organized images — just as one drop of Raktabeej's blood became an army. The multiplication is not chaos; it is governed, structured, and purposeful. Every frame carries its lineage in its filename: which video it came from, which segment, which position within that segment.
            </p>
            <p>
              Where Kali's intervention <span className="text-stone-300 italic">stopped</span> the multiplication, this engine <span className="text-stone-300 italic">harnesses</span> it. The boon becomes a tool.
            </p>
          </div>

          <div className="panel p-5 space-y-3">
            <h4 className="font-serif text-sm text-stone-300 uppercase tracking-widest">Applications of the Generated Dataset</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Computer Vision Training',
                'Object Detection',
                'SAR Image Analysis',
                'Remote Sensing',
                'Surveillance Analytics',
                'Temporal Sequence Learning',
                'Scene Understanding',
                'Anomaly Detection',
                'Research & Academia',
              ].map(app => (
                <div key={app} className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                  <div className="w-1 h-1 rounded-full bg-blood-800 shrink-0" />
                  {app}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom ornament */}
        <div className="ornament mt-10">
          <span className="text-blood-900 text-xs font-mono tracking-widest">रक्तबीज</span>
        </div>
      </div>
    </section>
  )
}
