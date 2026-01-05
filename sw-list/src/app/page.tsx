import Image from "next/image";
import { db } from "@/lib/db";
import { getProfiles } from "@/lib/slack";

const QUOTES = [
  "gotta ship em all",
  "if it floats, we review it",
  "certifying ships since... recently",
  "no ship left behind",
  "we dont sink ships, we certify em",
];

const ROLE_COLORS: Record<string, string> = {
  megawright: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  shipwright: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  trainee: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  retired: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function color(role: string) {
  return ROLE_COLORS[role.toLowerCase()] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

async function load() {
  const users = await db.user.findMany({
    where: { 
      isActive: true,
      role: { in: ['trainee', 'shipwright', 'megawright'] }
    },
    select: { slackId: true, username: true, avatar: true, role: true },
    orderBy: { username: "asc" },
  });
  
  const ids = users.map(u => u.slackId);
  const profiles = await getProfiles(ids);
  
  return users.map(u => {
    const s = profiles.get(u.slackId);
    return {
      slackId: u.slackId,
      name: s?.name || u.username,
      title: s?.title || null,
      avatar: s?.avatar || u.avatar,
      pronouns: s?.pronouns || null,
      role: u.role,
    };
  });
}

const IMGS = ["/anchor.webp", "/boat.webp", "/sailboat.webp", "/captain.webp", "/steering-wheel.webp"];

const POS_MOBILE = [
  { s: 35, t: 3, l: 2, r: -12 }, { s: 32, t: 3, l: 85, r: 10 },
  { s: 30, t: 12, l: 5, r: 8 }, { s: 34, t: 12, l: 80, r: -15 },
  { s: 32, t: 22, l: 3, r: -8 }, { s: 30, t: 22, l: 88, r: 12 },
  { s: 35, t: 32, l: 6, r: 15 }, { s: 32, t: 32, l: 82, r: -10 },
  { s: 30, t: 42, l: 2, r: -6 }, { s: 34, t: 42, l: 86, r: 8 },
  { s: 32, t: 52, l: 5, r: 10 }, { s: 30, t: 52, l: 84, r: -12 },
  { s: 35, t: 62, l: 3, r: -8 }, { s: 32, t: 62, l: 88, r: 15 },
  { s: 30, t: 72, l: 6, r: 6 }, { s: 34, t: 72, l: 82, r: -10 },
  { s: 32, t: 82, l: 2, r: -15 }, { s: 30, t: 82, l: 86, r: 8 },
  { s: 35, t: 92, l: 5, r: 12 }, { s: 32, t: 92, l: 84, r: -6 },
];

const POS_DESKTOP = [
  { s: 50, t: 2, l: 2, r: -15 }, { s: 45, t: 10, l: 6, r: -8 }, { s: 48, t: 20, l: 3, r: -20 },
  { s: 42, t: 30, l: 5, r: -12 }, { s: 55, t: 40, l: 2, r: -18 }, { s: 44, t: 50, l: 6, r: -6 },
  { s: 50, t: 60, l: 3, r: -10 }, { s: 46, t: 70, l: 5, r: -14 }, { s: 40, t: 80, l: 2, r: -8 },
  { s: 48, t: 90, l: 6, r: -16 },
  { s: 60, t: 4, l: 92, r: 12 }, { s: 52, t: 14, l: 89, r: 18 }, { s: 65, t: 24, l: 94, r: 8 },
  { s: 48, t: 34, l: 90, r: 15 }, { s: 54, t: 44, l: 93, r: 10 }, { s: 50, t: 54, l: 89, r: 14 },
  { s: 58, t: 64, l: 92, r: 6 }, { s: 44, t: 74, l: 90, r: 12 }, { s: 52, t: 84, l: 94, r: -8 },
  { s: 46, t: 94, l: 88, r: 10 },
  { s: 38, t: 6, l: 18, r: 5 }, { s: 35, t: 6, l: 35, r: -10 }, { s: 40, t: 6, l: 52, r: 8 },
  { s: 36, t: 6, l: 70, r: -6 }, { s: 42, t: 6, l: 82, r: 12 },
  { s: 34, t: 15, l: 25, r: -8 }, { s: 38, t: 15, l: 42, r: 6 }, { s: 36, t: 15, l: 60, r: -12 },
  { s: 40, t: 15, l: 76, r: 10 },
  { s: 35, t: 25, l: 20, r: 4 }, { s: 38, t: 25, l: 38, r: -8 }, { s: 42, t: 25, l: 55, r: 14 },
  { s: 36, t: 25, l: 72, r: -6 }, { s: 34, t: 25, l: 85, r: 8 },
  { s: 40, t: 35, l: 15, r: -10 }, { s: 36, t: 35, l: 32, r: 6 }, { s: 38, t: 35, l: 48, r: -4 },
  { s: 42, t: 35, l: 65, r: 12 }, { s: 35, t: 35, l: 80, r: -8 },
  { s: 38, t: 45, l: 22, r: 8 }, { s: 34, t: 45, l: 40, r: -6 }, { s: 40, t: 45, l: 58, r: 10 },
  { s: 36, t: 45, l: 75, r: -12 },
  { s: 42, t: 55, l: 18, r: -5 }, { s: 38, t: 55, l: 35, r: 8 }, { s: 35, t: 55, l: 52, r: -10 },
  { s: 40, t: 55, l: 68, r: 6 }, { s: 36, t: 55, l: 82, r: -8 },
  { s: 34, t: 65, l: 25, r: 12 }, { s: 40, t: 65, l: 42, r: -6 }, { s: 38, t: 65, l: 60, r: 8 },
  { s: 42, t: 65, l: 78, r: -10 },
  { s: 36, t: 75, l: 20, r: 6 }, { s: 35, t: 75, l: 38, r: -8 }, { s: 40, t: 75, l: 55, r: 10 },
  { s: 38, t: 75, l: 72, r: -6 }, { s: 34, t: 75, l: 85, r: 12 },
  { s: 42, t: 85, l: 15, r: -10 }, { s: 38, t: 85, l: 32, r: 8 }, { s: 36, t: 85, l: 50, r: -4 },
  { s: 40, t: 85, l: 68, r: 6 }, { s: 35, t: 85, l: 82, r: -12 },
  { s: 38, t: 95, l: 22, r: 10 }, { s: 34, t: 95, l: 42, r: -6 }, { s: 40, t: 95, l: 62, r: 8 },
  { s: 36, t: 95, l: 78, r: -10 },
];

function genPicks(len: number) {
  let prev = -1;
  const picks: number[] = [];
  for (let i = 0; i < len; i++) {
    let n = Math.floor(Math.random() * IMGS.length);
    while (n === prev) n = Math.floor(Math.random() * IMGS.length);
    picks.push(n);
    prev = n;
  }
  return picks;
}

function Bg() {
  const mPicks = genPicks(POS_MOBILE.length);
  const dPicks = genPicks(POS_DESKTOP.length);
  
  return (
    <>
      <div className="ships md:hidden">
        {POS_MOBILE.map((p, i) => (
          <div key={i} className="ship" style={{ width: p.s, height: p.s, top: `${p.t}%`, left: `${p.l}%`, transform: `rotate(${p.r}deg)` }}>
            <img src={IMGS[mPicks[i]]} alt="" />
          </div>
        ))}
      </div>
      <div className="ships hidden md:block">
        {POS_DESKTOP.map((p, i) => (
          <div key={i} className="ship" style={{ width: p.s, height: p.s, top: `${p.t}%`, left: `${p.l}%`, transform: `rotate(${p.r}deg)` }}>
            <img src={IMGS[dPicks[i]]} alt="" />
          </div>
        ))}
      </div>
    </>
  );
}

export default async function Page() {
  const crew = shuffle(await load());
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="ocean-bg min-h-screen">
      <Bg />
      
      <main className="relative z-10 p-4 md:p-8 max-w-[90vw] xl:max-w-[1500px] mx-auto">
        <header className="text-center mb-12 pt-12 md:pt-8 relative">
          <img src="/flag-orpheus-top.svg" alt="" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] w-24 md:w-32" />
          <div className="flex justify-center mb-4">
            <Image src="/logo_nobg_dark.png" alt="Shipso Certifico" width={160} height={160} className="w-40 h-40 md:w-48 md:h-48" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">The Shipwrights Crew</h1>
          <p className="text-zinc-500">{crew.length} people certifying your ships</p>
        </header>

        <div className="content-box rounded-2xl p-4 md:p-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {crew.map((m, i) => (
              <a key={i} href={`https://hackclub.slack.com/team/${m.slackId}`} target="_blank" rel="noopener noreferrer" className="crew-card flex items-start gap-4 p-5 rounded-xl break-inside-avoid hover:bg-zinc-800/50 transition-colors">
                {m.avatar ? (
                  <Image src={m.avatar} alt="" width={64} height={64} className="w-16 h-16 rounded-lg shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-400 shrink-0">
                    {m.name[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-lg">{m.name}</span>
                    {m.role && <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${color(m.role)}`}>{m.role}</span>}
                  </div>
                  {m.title && <div className="text-sm text-zinc-400 mt-1 leading-relaxed">{m.title}</div>}
                  {m.pronouns && <div className="text-xs text-zinc-600 mt-2">{m.pronouns}</div>}
                </div>
              </a>
            ))}
          </div>

          {crew.length === 0 && <p className="text-zinc-600 text-center py-12">crew went overboard</p>}

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-600 italic">"{quote}"</p>
          </div>
        </div>
      </main>
    </div>
  );
}
