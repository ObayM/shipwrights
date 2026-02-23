import Image from 'next/image'
import { ShipsBg } from '@/components/ships-bg'
import { FAQ, FAQItem } from './qna'

function FAQCard({ item }: { item: FAQItem }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-7 hover:border-cyan-500/30 transition-all backdrop-blur-sm">
      <h3 className="text-xl font-bold text-cyan-400 mb-4">{item.q}</h3>
      <div className="text-zinc-100 leading-relaxed text-base space-y-3">
        {item.a &&
          item.a.split('\n').map((line, j) => (
            <p key={j}>{line}</p>
          ))}

        {item.video && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${item.video.match(/vimeo\.com\/(\d+)/)?.[1] ?? ''}`}
              width="100%"
              height="400"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full rounded-lg"
            />
          </div>
        )}

        {item.bullets && (
          <ul className="list-disc list-inside space-y-1 text-zinc-300 ml-2">
            {item.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}

        {item.nestedBullets && (
          <div className="space-y-4 mt-2">
            {Object.entries(item.nestedBullets).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-semibold text-zinc-200 mb-2">
                  {category}
                </h4>
                <ul className="space-y-1 text-zinc-300 ml-4">
                  {items.map((b, i) => (
                    <li
                      key={i}
                      className={
                        b.startsWith('Yes')
                          ? 'text-green-400'
                          : b.startsWith('No')
                            ? 'text-red-400'
                            : ''
                      }
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {item.link && (
          <p className="mt-3">
            <a
              href={item.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium underline decoration-cyan-400/30 hover:decoration-cyan-300/50"
            >
              {item.link.text}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="ocean-bg min-h-screen">
      <ShipsBg />
      <main className="relative z-10 p-4 md:p-8 max-w-[90vw] xl:max-w-[1200px] mx-auto">
        <header className="text-center mb-12 pt-12 md:pt-8 relative">
          <img
            src="/flag-orpheus-top.svg"
            alt=""
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] w-24 md:w-32"
          />
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_nobg_dark.png"
              alt="Shipwrights"
              width={160}
              height={160}
              className="w-40 h-40 md:w-48 md:h-48"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">FAQ</h1>
          <p className="text-zinc-500">got questions? we got answers!</p>
        </header>

        <div className="space-y-8">
          {Object.entries(FAQ).map(([category, items]) => (
            <div key={category} className="space-y-5">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                {category}
              </h2>
              {items.map((item, i) => (
                <FAQCard key={i} item={item} />
              ))}
            </div>
          ))}

          <div className="mt-10 pt-8 border-t border-zinc-700 text-center">
            <p className="text-zinc-400 text-base">
              Don't see your question?{' '}
              <a
                href="https://hackclub.enterprise.slack.com/archives/C099P9FQQ91"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium underline decoration-cyan-400/30 hover:decoration-cyan-300/50"
              >
                Message Shipwrights Team on Slack!
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
