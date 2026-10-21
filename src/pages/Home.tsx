import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Photo } from '../components/Photo';
import { Icon } from '../components/Icon';
import { useReveal } from '../components/useReveal';
import { photos } from '../data/images';
import { products, formatPrice, productById, rooms } from '../data/catalog';
import { ruleTiles, clearances } from '../data/rules';
import { HeroSequence } from '../home/HeroSequence';
import { SiteHeader } from '../home/SiteHeader';
import { RoomsGallery } from '../home/RoomsGallery';
import { CountUp, Parallax, RevealImage, RevealText } from '../motion/Reveal';
import { ScrollProgress } from '../motion/ScrollProgress';
import { useSmoothScroll } from '../motion/smoothScroll';
import s from './Home.module.css';

/* The split stage: the photograph on the right stays put and changes as each reading block arrives. */
const stagePhotos = [
  { id: photos.livingSectional, alt: 'A light living room with a sectional sofa facing a round coffee table', caption: 'Sofa to table, 45 cm', meta: 'Clearance checked' },
  { id: photos.livingYellowChair, alt: 'A mustard lounge chair beside a graphite floor lamp', caption: 'Otto lounge chair', meta: '76 × 82 cm · €540' },
  { id: photos.bedroomBlack, alt: 'A bedroom with a black headboard lit by a brass wall light', caption: 'Bedroom at 2700 K', meta: 'Evening light' },
];

const stylePills = [
  { id: 'japandi', label: 'Japandi' },
  { id: 'mid-century', label: 'Mid-century' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'minimal', label: 'Minimal' },
];
const budgetPills = [
  { id: '0-500', label: 'Under €500' },
  { id: '500-1500', label: '€500–1,500' },
  { id: '1500-', label: 'Over €1,500' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Home() {
  useReveal();
  useSmoothScroll();
  const [active, setActive] = useState(0);
  const blocks = useRef<(HTMLElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.stage));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    blocks.current.forEach((b) => b && io.observe(b));
    return () => io.disconnect();
  }, []);

  // The stage photo drifts slightly against the scroll while it is pinned.
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: stageProgress } = useScroll({ target: stageRef, offset: ['start start', 'end end'] });
  const photoY = useTransform(stageProgress, [0, 1], ['-4%', '4%']);

  return (
    <div className={s.page}>
      <a href="#content" className={s.skip}>Skip to content</a>
      <ScrollProgress />
      <SiteHeader heroEnd={() => (heroRef.current ? heroRef.current.offsetTop + heroRef.current.offsetHeight : 0)} />

      <div ref={heroRef}>
        <HeroSequence />
      </div>

      <section className={s.find} id="content" aria-labelledby="find-title">
        <RevealText as="h2" id="find-title" className={`display ${s.findTitle}`} lines={['Start with', 'what you need']} italic={[1]} />
        <IntentSearch />
      </section>

      <div className={s.stage} ref={stageRef}>
        <div className={s.reading}>
          <section className={s.block} ref={(el) => (blocks.current[0] = el)} data-stage={0} aria-labelledby="numbers-title">
            <RevealText id="numbers-title" className={`display ${s.blockTitle}`} lines={['Every room', 'has numbers']} italic={[1]} />
            <p className={s.blockLead} data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              Comfort is measurable. These three decide whether a living room works before you buy anything.
            </p>
            <dl className={s.figures}>
              {ruleTiles.slice(0, 3).map((r, i) => (
                <div key={r.id} className={s.figureRow} data-reveal style={{ '--i': i + 2 } as React.CSSProperties}>
                  <dt className={s.figure}><CountUp value={r.figure} /><span>{r.unit}</span></dt>
                  <dd><strong>{r.caption}.</strong> {r.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={s.block} ref={(el) => (blocks.current[1] = el)} data-stage={1} aria-labelledby="pieces-title">
            <RevealText id="pieces-title" className={`display ${s.blockTitle}`} lines={['Pieces measured', 'to fit']} italic={[1]} />
            <p className={s.blockLead} data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              Every piece in the catalog carries its footprint, so the planner can tell you where it fits.
            </p>
            <table className={s.table} data-reveal style={{ '--i': 2 } as React.CSSProperties}>
              <caption className="visually-hidden">Sample pieces with sizes and prices</caption>
              <thead>
                <tr><th scope="col">Piece</th><th scope="col" className={s.num}>W × D cm</th><th scope="col" className={s.num}>Price</th></tr>
              </thead>
              <tbody>
                {['otto-chair', 'hale-sofa', 'nest-tables', 'arc-lamp'].map((id) => {
                  const p = productById(id)!;
                  return (
                    <tr key={id}>
                      <td><Link to={`/catalog?p=${id}`}>{p.name}</Link></td>
                      <td className={s.num}>{p.w} × {p.d}</td>
                      <td className={s.num}>{formatPrice(p.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Link to="/catalog" className={s.textLink} data-reveal style={{ '--i': 3 } as React.CSSProperties}>
              See all {products.length} pieces <Icon name="chevron" size={16} />
            </Link>
          </section>

          <section className={`${s.block} ${s.blockDark}`} ref={(el) => (blocks.current[2] = el)} data-stage={2} aria-labelledby="light-title">
            <RevealText id="light-title" className={`display ${s.blockTitle}`} lines={['Light by', 'the hour']} italic={[1]} />
            <p className={s.blockLead} data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              Switch the plan between daylight and evening to see which corners go dark, and which lamps fill them.
            </p>
            <div className={s.lightPair} data-reveal style={{ '--i': 2 } as React.CSSProperties}>
              <div><span className={s.lightFigure}><CountUp value="4000" /> K</span><span>Daylight from the window</span></div>
              <div><span className={s.lightFigure}><CountUp value="2700" /> K</span><span>Warm lamps after dark</span></div>
            </div>
          </section>
        </div>

        <div className={s.photoCol} aria-live="polite">
          <RevealImage className={s.photoPanel}>
            <motion.div className={s.photoDrift} style={{ y: reduce ? 0 : photoY }}>
              {stagePhotos.map((p, i) => (
                <Photo
                  key={p.id}
                  id={p.id}
                  alt={i === active ? p.alt : ''}
                  w={900}
                  h={1300}
                  className={`${s.stagePhoto} ${i === active ? s.stagePhotoOn : ''}`}
                />
              ))}
            </motion.div>
            <div className={s.photoBar}>
              <motion.span key={`c${active}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>{stagePhotos[active].caption}</motion.span>
              <motion.span key={`m${active}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.06 }}>{stagePhotos[active].meta}</motion.span>
            </div>
          </RevealImage>
        </div>
      </div>

      <RoomCheck />
      <RuleWall />
      <RoomsGallery />
      <HowItWorks />
      <StartDialog />

      <footer className={s.footer}>
        <span className={s.footerSoft}>A planner for your own rooms</span>
        <nav aria-label="Footer" className={s.footerLinks}>
          <Link to="/planner">Planner</Link>
          <Link to="/catalog">Catalog</Link>
          <Link to="/knowledge">Knowledge base</Link>
        </nav>
        <span className={s.footerSoft}>2026 · Photos: Unsplash</span>
      </footer>
    </div>
  );
}

function IntentSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [room, setRoom] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);

  // Every combination of pills lands on the catalog with all its filters; the catalog links to the room's guide.
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (room) params.set('room', room);
    if (style) params.set('style', style);
    if (budget) params.set('price', budget);
    navigate(`/catalog?${params}`);
  };

  const group = (label: string, items: { id: string; label: string }[], value: string | null, set: (v: string | null) => void) => (
    <div className={s.pillGroup} role="group" aria-label={label}>
      <span className={s.pillLabel}>{label}</span>
      {items.map((it) => (
        <button
          type="button"
          key={it.id}
          className={s.filterPill}
          aria-pressed={value === it.id}
          onClick={() => set(value === it.id ? null : it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );

  return (
    <form className={s.intent} role="search" onSubmit={go}>
      <div className={s.intentField}>
        <Icon name="search" size={18} />
        <label htmlFor="intent-q" className="visually-hidden">What are you looking for?</label>
        <input id="intent-q" type="search" placeholder="A sofa for a small living room…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className={s.intentGo}>Search</button>
      </div>
      {group('Room', rooms, room, setRoom)}
      {group('Style', stylePills, style, setStyle)}
      {group('Budget', budgetPills, budget, setBudget)}
    </form>
  );
}

/* The live thing: describe a room, see it laid out and checked against the clearance rules. */
function RoomCheck() {
  const sofas = products.filter((p) => p.kind === 'sofa' && p.d < 120);
  const table = productById('nest-tables')!;
  const [roomW, setRoomW] = useState(420);
  const [roomD, setRoomD] = useState(360);
  const [sofaId, setSofaId] = useState('hale-sofa');
  const [gap, setGap] = useState(45);
  const sofa = productById(sofaId)!;

  const walkway = roomD - sofa.d - gap - table.d;
  const sideRoom = (roomW - sofa.w) / 2;
  const checks = useMemo(
    () => [
      { label: 'Sofa to coffee table', value: `${gap} cm`, target: '40–50 cm', ok: gap >= clearances.sofaToCoffeeMin && gap <= clearances.sofaToCoffeeMax },
      { label: 'Walkway in front', value: `${Math.max(walkway, 0)} cm`, target: '90 cm or more', ok: walkway >= clearances.walkway },
      { label: 'Space beside the sofa', value: `${Math.max(Math.floor(sideRoom), 0)} cm each`, target: '30 cm or more', ok: sideRoom >= 30 },
    ],
    [gap, walkway, sideRoom],
  );
  const passed = checks.filter((c) => c.ok).length;

  // Plan drawing, in centimetres.
  const pad = 30;
  const sofaX = (roomW - sofa.w) / 2;
  const sofaY = roomD - sofa.d;
  const tableX = (roomW - table.w) / 2;
  const tableY = sofaY - gap - table.d;

  return (
    <section className={s.check} aria-labelledby="check-title">
      <div className={s.checkInput}>
        <form className={s.checkForm} onSubmit={(e) => e.preventDefault()} aria-describedby="check-help">
          <p id="check-help" className={s.checkHelp}>Describe a living room. The plan redraws as you type.</p>
          <SizeField id="rw" label="Room width" value={roomW} onCommit={setRoomW} />
          <SizeField id="rd" label="Room depth" value={roomD} onCommit={setRoomD} />
          <div className={s.checkRow}>
            <label htmlFor="sofa">Sofa</label>
            <select id="sofa" value={sofaId} onChange={(e) => setSofaId(e.target.value)}>
              {sofas.map((p) => <option key={p.id} value={p.id}>{p.name}, {p.w} cm</option>)}
            </select>
          </div>
          <div className={s.checkRow}>
            <label htmlFor="gap">Gap to table</label>
            <input id="gap" type="range" min={20} max={90} step={5} value={gap} onChange={(e) => setGap(+e.target.value)} />
            <output htmlFor="gap">{gap} cm</output>
          </div>
        </form>
        <RevealText id="check-title" className={`display ${s.splitHeadLeft}`} lines={['Your room,']} />
      </div>

      <div className={s.checkOutput}>
        <div className={s.fragment} data-ui>
          <div className={s.fragmentHead}>
            <span>Living room · {roomW} × {roomD} cm</span>
            <span className={`pill ${passed === checks.length ? 'pill-pass' : 'pill-warn'}`}>{passed} of {checks.length} met</span>
          </div>
          <svg viewBox={`${-pad} ${-pad} ${roomW + pad * 2} ${roomD + pad * 2}`} className={s.fragmentPlan} role="img" aria-label={`Plan: ${sofa.name} with the coffee table ${gap} cm in front, walkway ${Math.max(walkway, 0)} cm`}>
            <rect x={0} y={0} width={roomW} height={roomD} fill="#f3f4f1" stroke="#1a1a1a" strokeWidth={6} />
            <rect x={roomW * 0.3} y={-3} width={roomW * 0.4} height={6} fill="#c9d2d8" />
            <rect x={sofaX} y={sofaY} width={sofa.w} height={sofa.d} fill="#1a1a1a" />
            <rect x={tableX} y={tableY} width={table.w} height={table.d} fill={checks[0].ok ? '#2f5d50' : '#a8321f'} />
            {/* gap dimension */}
            <line x1={roomW / 2 + table.w / 2 + 14} x2={roomW / 2 + table.w / 2 + 14} y1={tableY + table.d} y2={sofaY} stroke="#1a1a1a" strokeWidth={2} />
            <text x={roomW / 2 + table.w / 2 + 22} y={tableY + table.d + gap / 2 + 6} fontSize={18} fill="#1a1a1a">{gap}</text>
            {/* walkway band */}
            {walkway > 0 && (
              <>
                <rect x={0} y={0} width={roomW} height={walkway} fill={checks[1].ok ? 'rgba(47,93,80,0.10)' : 'rgba(168,50,31,0.10)'} />
                <text x={16} y={Math.min(walkway / 2 + 6, walkway - 6)} fontSize={18} fill="#1a1a1a">Walkway {walkway}</text>
              </>
            )}
          </svg>
          <ul className={s.checkList}>
            {checks.map((c) => (
              <li key={c.label}>
                <span className={c.ok ? s.ok : s.bad}><Icon name={c.ok ? 'check' : 'alert'} size={16} /></span>
                <span>{c.label}<small>{c.target}</small></span>
                <strong>{c.value}</strong>
              </li>
            ))}
          </ul>
        </div>
        <p className={`display ${s.splitHeadRight}`} aria-hidden="true"><em>checked</em></p>
      </div>
    </section>
  );
}

function RuleWall() {
  const tones = [s.tilePaper, s.tileInk, s.tileSage, s.tileSlate];
  const cells: React.ReactNode[] = [];
  cells.push(
    <div key="head" className={`${s.tile} ${s.tileInk}`}>
      <h2 className={`display ${s.tileHeading}`}>Room <em>rules</em></h2>
    </div>,
  );
  const photosIn = [
    { at: 3, id: photos.diningGreen, alt: 'Dining room with green velvet chairs around a white table' },
    { at: 7, id: photos.bedroomWhite, alt: 'White bedroom with an upholstered bed and two bedside lamps' },
  ];
  let ruleIdx = 0;
  for (let i = 1; i < 12; i++) {
    const ph = photosIn.find((p) => p.at === i);
    if (ph) {
      cells.push(
        <div key={`p${i}`} className={`${s.tile} ${s.tilePhoto}`}>
          <RevealImage className={s.tileReveal}>
            <Parallax amount={6} className={s.tileReveal}>
              <Photo id={ph.id} alt={ph.alt} w={600} h={700} className={s.tileImg} />
            </Parallax>
          </RevealImage>
        </div>,
      );
      continue;
    }
    const r = ruleTiles[ruleIdx++];
    if (!r) break;
    cells.push(
      <Link key={r.id} to="/knowledge?a=clearances" className={`${s.tile} ${tones[i % tones.length]}`} data-reveal style={{ '--i': i % 4 } as React.CSSProperties}>
        <span className={s.tileFigure}><CountUp value={r.figure} /><small>{r.unit}</small></span>
        <span className={s.tileCaption}>{r.caption}</span>
      </Link>,
    );
  }
  return <section className={s.wall} aria-label="Rules of a room">{cells}</section>;
}

const steps = [
  { title: 'Learn the rules.', line: 'Short guides for each room, style and kind of light, with the numbers that matter.' },
  { title: 'Then pick pieces that fit.', line: 'Filter the catalog by room, style and budget. Every piece lists its footprint.' },
  { title: 'Lay it out and check it.', line: 'Drag pieces onto your plan. The assistant flags any gap that breaks a rule.' },
];

function HowItWorks() {
  const [step, setStep] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.step))),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section className={s.how} aria-labelledby="how-title">
      <div className={s.howText}>
        <RevealText id="how-title" className={`display ${s.howTitle}`} lines={['How it works']} />
        {steps.map((st, i) => (
          <div key={st.title} className={`${s.howStep} ${step === i ? s.howStepOn : ''}`} data-step={i} ref={(el) => (refs.current[i] = el)}>
            <p className={s.howStatement}>{st.title}</p>
            <p className={s.howLine}>{st.line}</p>
          </div>
        ))}
      </div>
      <div className={s.howStageWrap}>
        <div className={s.howStage} data-ui aria-hidden="true">
          {step === 0 && (
            <div className={s.uiCard}>
              <p className={s.uiTitle}>Living room clearances</p>
              <dl className={s.uiRows}>
                <div><dt>Sofa to coffee table</dt><dd>40–50 cm</dd></div>
                <div><dt>Main walkway</dt><dd>90 cm</dd></div>
                <div><dt>Chair to chair</dt><dd>90–120 cm</dd></div>
                <div><dt>Screen to seat</dt><dd>1.5 × diagonal</dd></div>
              </dl>
            </div>
          )}
          {step === 1 && (
            <div className={s.uiCard}>
              <p className={s.uiTitle}>Catalog · Japandi · under €1,500</p>
              <ul className={s.uiList}>
                {['ardo-sofa', 'tove-stool', 'lune-table', 'float-shelves'].map((id, i) => {
                  const p = productById(id)!;
                  return (
                    <li key={id} className={i < 2 ? s.uiSelected : ''}>
                      <Photo id={p.photo} alt="" w={80} h={80} className={s.uiThumb} />
                      <span>{p.name}<small>{p.w} × {p.d} cm</small></span>
                      <strong>{formatPrice(p.price)}</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {step === 2 && (
            <div className={s.uiCard}>
              <p className={s.uiTitle}>Living room plan <span className="pill pill-pass">4 of 4 met</span></p>
              <svg viewBox="-20 -20 460 400" className={s.uiPlan}>
                <rect x={0} y={0} width={420} height={360} fill="#f3f4f1" stroke="#1a1a1a" strokeWidth={6} />
                <rect x={117} y={265} width={186} height={95} fill="#1a1a1a" />
                <rect x={165} y={160} width={90} height={60} fill="#2f5d50" />
                <rect x={330} y={40} width={76} height={82} fill="#5d6b7e" />
                <circle cx={60} cy={300} r={15} fill="#5d6b7e" />
                <text x={268} y={250} fontSize={18}>45</text>
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StartDialog() {
  const navigate = useNavigate();
  const [name, setName] = useState('Living room');
  const [mode, setMode] = useState<'blank' | 'template'>('template');
  return (
    <section className={s.cta} aria-labelledby="cta-title">
      <div className={s.ctaText}>
        <RevealText id="cta-title" className={`display ${s.ctaTitle}`} lines={['Start with', 'one room.']} italic={[1]} />
        <p>Name it, pick a starting point, and the planner opens with your room ready to arrange.</p>
      </div>
      <form
        className={s.dialog}
        data-ui
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/planner?name=${encodeURIComponent(name || 'My room')}&start=${mode}`);
        }}
      >
        <p className={s.dialogTitle}>Name your room</p>
        <label htmlFor="room-name" className={s.dialogLabel}>Room name</label>
        <input id="room-name" className={s.dialogInput} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        <div className={s.segment} role="radiogroup" aria-label="Starting point">
          <button type="button" role="radio" aria-checked={mode === 'template'} onClick={() => setMode('template')}>Furnished example</button>
          <button type="button" role="radio" aria-checked={mode === 'blank'} onClick={() => setMode('blank')}>Empty room</button>
        </div>
        <button type="submit" className={s.dialogGo}>Open the planner</button>
      </form>
    </section>
  );
}

/** Number field that lets you type freely and clamps to 250–800 cm when you leave it or press Enter. */
function SizeField({ id, label, value, onCommit }: { id: string; label: string; value: number; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = clamp(parseInt(draft, 10), 250, 800);
    onCommit(n);
    setDraft(String(n));
  };
  return (
    <div className={s.checkRow}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={250}
        max={800}
        step={10}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseInt(e.target.value, 10);
          if (n >= 250 && n <= 800) onCommit(n);
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
      <span>cm</span>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  if (Number.isNaN(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}
