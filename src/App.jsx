import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import confetti from 'canvas-confetti'
import * as D from './data'

const KEY = 'trust-game-v1'
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null } catch { return null } }
const save = (s) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)) } catch { /* 저장 못 해도 진행 */ } }
const blank = () => ({ screen: 'start', num: '', theme: 'sport', predict: null, results: {}, order: [], quiz: null, cleared: null, reflect: { hard: null, best: '', pledge: null, own: '' } })

const hasJong = (s) => { const c = s.charCodeAt(s.length - 1) - 0xac00; return c >= 0 && c % 28 !== 0 }
const nick = (f) => (hasJong(f.name) ? f.name + '이' : f.name) // 도윤 → 도윤이
const wa = (s) => s + (hasJong(s) ? '과' : '와')
const byId = (id) => D.FRIENDS.find((f) => f.id === id)

// 늘 함께를 골랐을 때가 우리 팀 최고 점수
const bestTeam = (f) => { const h = []; let t = 0; for (let i = 0; i < D.ROUNDS; i++) { const you = f.move(h, true); const [a, b] = D.PAY['C' + you]; t += a + b; h.push({ me: 'C', you }) } return t }
const MAX = D.FRIENDS.reduce((a, f) => a + bestTeam(f), 0)

const fireConfetti = (big) => {
  try {
    const colors = ['#FCD34D', '#34D399', '#A78BFA', '#F472B6', '#FFFFFF']
    confetti({ particleCount: big ? 160 : 70, spread: big ? 110 : 70, origin: { y: 0.6 }, colors, disableForReducedMotion: true })
    if (big) setTimeout(() => confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors }), 250)
    if (big) setTimeout(() => confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors }), 400)
  } catch { /* 무시 */ }
}

function CountUp({ to, dur = 1.1 }) {
  const [v, setV] = useState(0)
  useEffect(() => { const c = animate(0, to, { duration: dur, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop() }, [to, dur])
  return <>{v}</>
}

function Avatar({ f, size = 64, mood }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: `linear-gradient(135deg,${f.hue[0]},${f.hue[1]})`, fontSize: size * 0.38 }}>
      <span>{f.name[0]}</span>
      <i style={{ fontSize: size * 0.3 }}>{mood || f.icon}</i>
    </div>
  )
}

function Jersey({ num, size = 56 }) {
  return (
    <svg className="jersey" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="jg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6EE7B7" /><stop offset="1" stopColor="#059669" /></linearGradient></defs>
      <path d="M22 6 L12 10 L3 22 L12 29 L16 25 L16 58 L48 58 L48 25 L52 29 L61 22 L52 10 L42 6 Q32 14 22 6Z" fill="url(#jg)" stroke="#ECFDF5" strokeWidth="2.5" strokeLinejoin="round" />
      <text x="32" y="47" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">{num || '7'}</text>
    </svg>
  )
}

function Btn({ kind = 'mint', className = '', ...p }) {
  return <motion.button whileTap={{ scale: 0.95, y: 2 }} whileHover={{ y: -2 }} className={`btn ${kind} ${className}`} {...p} />
}

// ───────────────── 시작 화면
function Start({ s, set, openTeacher }) {
  const t = D.THEMES[s.theme]
  return (
    <motion.div className="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
      <motion.div className="ball" animate={{ y: [0, -18, 0], rotate: [0, 180, 360] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>{t.icon}</motion.div>
      <motion.p className="eyebrow" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>어울림 역량 · 신뢰와 협력</motion.p>
      <motion.h1 className="title" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.2 }}>
        신뢰 게임
      </motion.h1>
      <motion.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        {t.C}일까, {t.D}일까? 다섯 친구와 경기하며<br />믿음이 어떻게 생기고 깨지는지 알아봐요.
      </motion.p>

      <motion.div className="card start-card" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
        <div className="field">
          <label htmlFor="num">내 번호</label>
          <input id="num" inputMode="numeric" maxLength={2} placeholder="예: 12" value={s.num}
            onChange={(e) => set({ num: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
          <small>이름은 쓰지 않아요. 번호는 등번호로만 쓰고 어디에도 저장되지 않아요.</small>
        </div>
        <div className="field">
          <label>오늘의 장면</label>
          <div className="seg">
            {Object.values(D.THEMES).map((th) => (
              <button key={th.id} className={s.theme === th.id ? 'on' : ''} onClick={() => set({ theme: th.id })}>
                <b>{th.icon} {th.label}</b><small>{th.C} · {th.D}</small>
              </button>
            ))}
          </div>
        </div>
        <Btn className="big wide" onClick={() => set({ screen: 'rules' })}>경기장 입장하기 →</Btn>
      </motion.div>
      <button className="link" onClick={openTeacher}>선생님용 안내 보기</button>
    </motion.div>
  )
}

// ───────────────── 규칙 + 예측
function Rules({ s, set }) {
  const t = D.THEMES[s.theme]
  const [step, setStep] = useState(0)
  const cells = [
    { me: 'C', you: 'C', a: 3, b: 3, note: '둘 다 웃어요', tone: 'good' },
    { me: 'C', you: 'D', a: 0, b: 5, note: '나만 손해', tone: 'warn' },
    { me: 'D', you: 'C', a: 5, b: 0, note: '나만 이득', tone: 'flat' },
    { me: 'D', you: 'D', a: 1, b: 1, note: '둘 다 조금', tone: 'flat' },
  ]
  const lbl = (k) => (k === 'C' ? `${t.Cicon} ${t.C}` : `${t.Dicon} ${t.D}`)
  return (
    <motion.div className="stack" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      {step === 0 && (
        <div className="card stack">
          <p className="eyebrow">경기 규칙</p>
          <h2>나와 친구가 <em>동시에</em> 선택해요</h2>
          <p className="sub">서로의 선택은 카드를 뒤집을 때 한꺼번에 공개돼요. 선택에 따라 점수가 이렇게 나뉘어요.</p>
          <div className="pay">
            {cells.map((c, i) => (
              <motion.div key={i} className={`paycell ${c.tone}`} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.35, type: 'spring', stiffness: 120 }}>
                <div className="pc-row"><span>나</span><b>{lbl(c.me)}</b></div>
                <div className="pc-row"><span>친구</span><b>{lbl(c.you)}</b></div>
                <div className="pc-score"><b className="me">+{c.a}</b><i>/</i><b>+{c.b}</b></div>
                <small>{c.note}</small>
              </motion.div>
            ))}
          </div>
          <p className="sub tc">앞 숫자가 <b className="me">내 점수</b>, 뒤 숫자가 친구 점수예요. 둘을 더한 것이 <b className="gold">우리 팀 점수</b>예요.</p>
          <div className="goal"><span>🏆</span><p>목표는 내 점수가 아니라 <b>우리 팀 점수</b>를 가장 많이 모으는 거예요. 친구 다섯 명과 각각 {D.ROUNDS}라운드씩 경기하고, 중간에 {t.talkName}도 있어요. 마지막 STAGE 6은 우리 반 상황 퀴즈예요.</p></div>
          <Btn className="wide" onClick={() => setStep(1)}>알겠어요, 다음 →</Btn>
        </div>
      )}
      {step === 1 && (
        <motion.div className="card stack" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">경기 전 예측</p>
          <h2>어떻게 해야 우리 팀 점수가 가장 높을까요?</h2>
          <p className="sub">정답은 없어요. 지금 생각을 골라 두면 경기가 끝난 뒤 다시 비교해 볼 거예요.</p>
          <div className="choices3">
            {D.PREDICT.map((p) => (
              <motion.button key={p.id} whileTap={{ scale: 0.96 }} className={`opt ${s.predict === p.id ? 'on' : ''}`} onClick={() => set({ predict: p.id })}>
                <span className="opt-ic">{p.icon}</span><b>{p.label}</b>
              </motion.button>
            ))}
          </div>
          <Btn className="wide big" disabled={!s.predict} onClick={() => set({ screen: 'map' })}>경기장 지도 열기 →</Btn>
        </motion.div>
      )}
    </motion.div>
  )
}

// ───────────────── 경기장 지도 (친구 5명 + 상황 퀴즈 + 시상대)
const NF = D.FRIENDS.length // 5
const QI = NF // 퀴즈 스테이지 칸
const PI = NF + 1 // 시상대 칸
const PTS = [[10, 82], [30, 68], [19, 40], [42, 22], [63, 44], [79, 72], [90, 24]] // % 좌표
// 곡선 경로를 구간별로 만들어 두고, 지나온 구간만 이어 그린다
function segments(pts) {
  const p = pts.map(([x, y]) => [x * 10, y * 6.2])
  const segs = []
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    segs.push(` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`)
  }
  return { start: `M${p[0][0]},${p[0][1]}`, segs }
}
const SEG = segments(PTS)
const curve = (k) => SEG.start + SEG.segs.slice(0, k).join('')
const progress = (s) => s.order.filter((id) => s.results[id]).length + (s.quiz ? 1 : 0)

function MapScreen({ s, set }) {
  const t = D.THEMES[s.theme]
  const done = s.order.filter((id) => s.results[id])
  const n = progress(s)
  const [banner, setBanner] = useState(s.cleared)
  const from = banner != null ? Math.max(0, n - 1) : n
  const [pos, setPos] = useState(from)
  useEffect(() => {
    if (banner == null) return
    fireConfetti(false)
    const a = setTimeout(() => setBanner(null), 1900)
    const b = setTimeout(() => setPos(n), 2100)
    set({ cleared: null }, true)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, []) // eslint-disable-line
  const isQuizBanner = banner === 'quiz'
  const cleared = banner != null && !isQuizBanner ? byId(banner) : null
  const full = curve(PI)
  const partial = curve(Math.min(pos, PI))
  const go = (i) => {
    if (i !== n) return
    if (n < NF) set({ screen: 'draw' })
    else if (n === QI) set({ screen: 'quiz' })
    else if (n === PI) set({ screen: 'final' })
  }
  const head = n < NF ? `STAGE ${n + 1} · 다음 친구를 만나러 가요` : n === QI ? 'STAGE 6 · 마지막 관문, 우리 반 상황 퀴즈!' : '모든 스테이지를 마쳤어요! 시상대로 가요'
  const cta = n < NF ? `STAGE ${n + 1} 시작 · 친구 카드 뽑기 🃏` : n === QI ? 'STAGE 6 시작 · 상황 퀴즈 🧩' : '어울림 시상대로 🏆'

  return (
    <motion.div className="stack" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="maphead">
        <div><p className="eyebrow">{t.place} 투어</p><h2>{head}</h2></div>
      </div>
      <div className="map">
        <svg viewBox="0 0 1000 620" preserveAspectRatio="none" className="pitch" aria-hidden="true">
          <defs>
            <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0F5132" /><stop offset="1" stopColor="#0A3A26" /></linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width="1000" height="620" fill="url(#grass)" />
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 100} width="50" height="620" fill="#fff" opacity="0.025" />)}
          <g stroke="#fff" strokeOpacity="0.22" strokeWidth="3" fill="none">
            <rect x="30" y="30" width="940" height="560" rx="6" />
            <line x1="500" y1="30" x2="500" y2="590" /><circle cx="500" cy="310" r="80" />
            <rect x="30" y="180" width="130" height="260" /><rect x="840" y="180" width="130" height="260" />
          </g>
          <path d={full} stroke="#fff" strokeOpacity="0.25" strokeWidth="14" strokeDasharray="2 22" strokeLinecap="round" fill="none" />
          {pos > 0 && <motion.path key={pos} d={partial} stroke="#FCD34D" strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#glow)"
            initial={{ pathLength: (pos - 1) / pos }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeInOut' }} />}
        </svg>
        {PTS.map(([x, y], i) => {
          const podium = i === PI, quiz = i === QI
          const f = i < NF && done[i] ? byId(done[i]) : null
          const state = i < n ? 'done' : i === n ? 'current' : 'locked'
          const label = podium ? '어울림 시상대' : quiz ? (s.quiz ? '상황 퀴즈 완주' : 'STAGE 6 퀴즈') : f ? f.badge : `STAGE ${i + 1}`
          const disc = podium ? '🏆' : quiz ? (state === 'locked' ? '🔒' : '🧩') : f ? <Avatar f={f} size={50} /> : state === 'locked' ? '🔒' : i + 1
          return (
            <motion.button key={i} className={`node ${state} ${podium ? 'podium' : ''} ${quiz ? 'quiz' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => go(i)}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.08, type: 'spring' }} aria-label={label}>
              <span className="disc">{disc}</span>
              <span className="nlabel">{label}</span>
            </motion.button>
          )
        })}
        <motion.div className="token" initial={false}
          animate={{ left: `${PTS[Math.min(pos, PI)][0]}%`, top: `${PTS[Math.min(pos, PI)][1]}%` }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.9, repeat: Infinity }}><Jersey num={s.num} size={52} /></motion.div>
        </motion.div>
        <AnimatePresence>
          {(cleared || (isQuizBanner && banner != null)) && (
            <motion.div className="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.3, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="clear-in">
                <p>STAGE {n} CLEAR!</p>
                <div className="badge">{cleared ? <Avatar f={cleared} size={44} /> : <span className="bicon">🧩</span>}<b>{cleared ? cleared.badge : '상황 퀴즈 완주'}</b></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="center">
        <Btn className="big" onClick={() => go(n)}>{cta}</Btn>
      </div>
    </motion.div>
  )
}

// ───────────────── STAGE 6 우리 반 상황 퀴즈
function Quiz({ s, set }) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [tries, setTries] = useState(0)
  const [first, setFirst] = useState(0) // 한 번에 고른 문제 수(점수 아님, 결과 문장에만 사용)
  const q = D.QUIZ[i]
  const f = byId(q.from)
  const ok = pick === q.a
  const choose = (k) => {
    if (ok) return
    setPick(k)
    if (k === q.a) { if (tries === 0) setFirst((v) => v + 1); fireConfetti(false) } else setTries((v) => v + 1)
  }
  const next = () => {
    if (i < D.QUIZ.length - 1) { setI(i + 1); setPick(null); setTries(0); return }
    set({ screen: 'map', quiz: { first }, cleared: 'quiz' })
  }
  return (
    <motion.div className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="row between">
        <div><p className="eyebrow">STAGE 6 · 우리 반 상황 퀴즈</p><h2>오늘 만난 친구들에게 배운 것을 우리 반에 써 봐요</h2></div>
        <div className="dots">{D.QUIZ.map((_, k) => <span key={k} className={`dot ${k < i ? 'cc' : k === i ? 'now' : ''}`}>{k + 1}</span>)}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} className="card stack qcard" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.45 }}>
          <div className="qhead"><Avatar f={f} size={48} /><p className="qtext">{q.q}</p></div>
          <div className="qopts">
            {q.opts.map((o, k) => {
              const cls = pick === k ? (k === q.a ? 'right' : 'wrong') : ok && k === q.a ? 'right' : ''
              return (
                <motion.button key={k} className={`qopt ${cls}`} onClick={() => choose(k)} disabled={ok}
                  animate={pick === k && k !== q.a ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
                  <span className="qk">{'ABC'[k]}</span>{o}
                </motion.button>
              )
            })}
          </div>
          {pick != null && !ok && <motion.p className="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>음… 그렇게 하면 친구 마음이 어떨까요? 다른 답을 골라 보세요.</motion.p>}
          {ok && (
            <motion.div className="outcome good" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div><b>좋은 선택이에요!</b><p>{q.why}</p></div>
              <Btn onClick={next}>{i < D.QUIZ.length - 1 ? '다음 상황 →' : 'STAGE 6 CLEAR! 지도로 →'}</Btn>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ───────────────── 친구 카드 뽑기
function Draw({ s, set }) {
  const left = D.FRIENDS.filter((f) => !s.order.includes(f.id))
  const deck = useMemo(() => [...left].sort(() => Math.random() - 0.5), []) // eslint-disable-line
  const [pick, setPick] = useState(null)
  const [flip, setFlip] = useState(false)
  const choose = (f) => { if (pick) return; setPick(f); setTimeout(() => setFlip(true), 650); setTimeout(() => fireConfetti(false), 1100) }
  const k = deck.length
  return (
    <motion.div className="stack center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <p className="eyebrow">STAGE {s.order.length + 1}</p>
      <h2>{pick ? (flip ? `오늘의 상대는 ${pick.name}!` : '두근두근…') : '카드 한 장을 골라 오늘의 상대를 만나요'}</h2>
      <div className="deck">
        {deck.map((f, i) => {
          const mid = (k - 1) / 2
          const isPick = pick?.id === f.id
          const gone = pick && !isPick
          return (
            <motion.button key={f.id} className="fcard" onClick={() => choose(f)} disabled={!!pick}
              initial={{ y: 200, opacity: 0, rotate: 0 }}
              animate={isPick ? { x: (mid - i) * 120, y: -10, rotate: 0, scale: 1.3, opacity: 1, zIndex: 10 } : gone ? { y: 120, opacity: 0, scale: 0.8 } : { y: Math.abs(i - mid) * 14, rotate: (i - mid) * 8, opacity: 1, scale: 1 }}
              whileHover={!pick ? { y: -18, scale: 1.05 } : undefined}
              transition={{ type: 'spring', stiffness: 140, damping: 16, delay: pick ? 0 : i * 0.08 }}
              style={{ zIndex: isPick ? 10 : 1 }}>
              <motion.div className="flipper" animate={{ rotateY: isPick && flip ? 180 : 0 }} transition={{ duration: 0.7 }}>
                <div className="face back"><span className="q">?</span><span className="mini">신뢰 게임</span></div>
                <div className="face front">
                  <Avatar f={f} size={72} />
                  <b>{f.name}</b>
                  <span className="tag">{f.tag} 친구</span>
                  <p>{f.hint}</p>
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {flip && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stack center">
            <p className="sub">{nick(pick)}는 어떤 친구일까요? 경기하면서 친구의 마음을 읽어 보세요.</p>
            <Btn className="big" onClick={() => set({ screen: 'match', order: [...s.order, pick.id] })}>{wa(pick.name)} 경기 시작! ⚡</Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ───────────────── 경기
function ChoiceFace({ k, t, who }) {
  if (k === 'X') return <div className="cface x"><span>💨</span><b>실수!</b><small>{who}</small></div>
  return <div className={`cface ${k === 'C' ? 'c' : 'd'}`}><span>{k === 'C' ? t.Cicon : t.Dicon}</span><b>{k === 'C' ? t.C : t.D}</b><small>{who}</small></div>
}

function Match({ s, set }) {
  const t = D.THEMES[s.theme]
  const f = byId(s.order[s.order.length - 1])
  const [h, setH] = useState([])
  const [trust, setTrust] = useState(50)
  const [phase, setPhase] = useState('choose') // choose | count | reveal
  const [count, setCount] = useState(3)
  const [warned, setWarned] = useState(false)
  const [talk, setTalk] = useState(null) // 작전 타임에서 고른 말
  const card = useMemo(() => (h.length >= D.TALK_AT ? D.talkCard(f, h.slice(0, D.TALK_AT), t) : null), [h.length >= D.TALK_AT]) // eslint-disable-line
  const my = h.reduce((a, x) => a + x.a, 0), ur = h.reduce((a, x) => a + x.b, 0)
  const last = h[h.length - 1]
  const round = phase === 'choose' ? h.length : phase === 'talk' ? h.length - 1 : h.length - 1
  const sayTalk = (o) => { setTalk(o); setTrust((v) => Math.max(0, Math.min(100, v + o.d))); if (o.kind === 'good') fireConfetti(false) }

  const play = (me) => {
    if (phase !== 'choose') return
    const you = f.move(h, talk?.kind === 'good')
    const [a, b] = D.PAY[me + you]
    const nh = [...h, { me, you, a, b, say: D.bubble(f, me, you) }]
    setPhase('count'); setCount(3)
    setTimeout(() => setCount(2), 380)
    setTimeout(() => setCount(1), 760)
    setTimeout(() => {
      setH(nh); setPhase('reveal')
      setTrust((v) => Math.max(0, Math.min(100, v + D.trustDelta(me, you))))
      if (me === 'C' && you === 'C') fireConfetti(false)
    }, 1140)
  }
  const next = () => {
    if (h.length === D.TALK_AT && !talk) { setPhase('talk'); return }
    if (h.length < D.ROUNDS) { setPhase('choose'); return }
    const res = { my, ur, trust, moves: h.map((x) => x.me + x.you).join(' '), talk: talk?.kind || 'none' }
    set({ screen: 'stageEnd', results: { ...s.results, [f.id]: res } })
  }
  const o = last && phase === 'reveal' ? D.outcomeText(t, last.me, last.you) : null
  const mood = trust >= 70 ? '😊' : trust >= 40 ? '🙂' : trust >= 20 ? '😟' : '😢'
  const showKindNote = phase === 'reveal' && f.id === 'kind' && last?.me === 'D' && !warned

  return (
    <motion.div className="stack" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="scoreboard card">
        <div className="sb-side">
          <Jersey num={s.num} size={54} />
          <div><small>나</small><motion.b key={my} initial={{ scale: 1.6, color: '#FCD34D' }} animate={{ scale: 1, color: '#F1F5FF' }}>{my}</motion.b></div>
        </div>
        <div className="sb-mid">
          <div className="dots">
            {Array.from({ length: D.ROUNDS }, (_, i) => {
              const x = h[i]
              const cls = !x ? (i === round ? 'now' : '') : x.me === 'C' && x.you === 'C' ? 'cc' : x.you === 'X' ? 'xx' : x.me === 'D' && x.you === 'D' ? 'dd' : 'mix'
              return <span key={i} className={`dot ${cls}`}>{i + 1}</span>
            })}
          </div>
          <div className="teamscore">우리 팀 <b>{my + ur}</b>점</div>
        </div>
        <div className="sb-side right">
          <div><small>{f.name}</small><motion.b key={ur} initial={{ scale: 1.6, color: '#FCD34D' }} animate={{ scale: 1, color: '#F1F5FF' }}>{ur}</motion.b></div>
          <div className="rel">
            <Avatar f={f} size={54} mood={mood} />
            <AnimatePresence>
              {phase === 'talk' && talk && (
                <motion.div key="talk" className="speech" initial={{ opacity: 0, scale: 0.4, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring' }}>{talk.reply}</motion.div>
              )}
              {phase === 'reveal' && last && (
                <motion.div key={h.length} className="speech" initial={{ opacity: 0, scale: 0.4, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.5, type: 'spring' }}>{last.say}</motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="trust">
        <span>💞 우리 사이의 믿음</span>
        <div className="tbar"><motion.i animate={{ width: `${Math.max(3, trust)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 15 }} /></div>
        <b>{trust}%</b>
      </div>

      <AnimatePresence>
        {phase === 'talk' && card && (
          <motion.div className="talk card stack" initial={{ opacity: 0, scale: 0.85, rotateX: 30 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 14 }}>
            <motion.p className="talk-title" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>{t.talkIcon} {t.talkName}!</motion.p>
            <p className="tc"><b>{card.lead}</b></p>
            <div className="talk-opts">
              {card.opts.map((o, i) => (
                <motion.button key={i} whileTap={{ scale: 0.97 }} className={`talk-opt ${talk === o ? 'on ' + o.kind : ''}`} disabled={!!talk} onClick={() => sayTalk(o)}
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.12 }}>
                  <span>{o.kind === 'none' ? '🤐' : '💬'}</span>{o.kind === 'none' ? o.say : `"${o.say}"`}
                </motion.button>
              ))}
            </div>
            {talk && (
              <motion.div className={`outcome ${talk.kind === 'good' ? 'good' : talk.kind === 'bad' ? 'warn' : 'flat'}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div><b>{talk.kind === 'good' ? '믿음이 올라갔어요!' : talk.kind === 'bad' ? '믿음이 내려갔어요' : '아무 일도 일어나지 않았어요'}</b><p>{talk.fb} <span className="pts">(믿음 {talk.d > 0 ? '+' : ''}{talk.d})</span></p></div>
                <Btn onClick={() => setPhase('choose')}>{t.talkName} 끝! {D.TALK_AT + 1}라운드로 →</Btn>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'talk' && <div className="arena card">
        <p className="scene">ROUND {round + 1} · {t.scene[round]}</p>
        <div className="slots">
          {['me', 'you'].map((w) => {
            const k = last && phase === 'reveal' ? (w === 'me' ? last.me : last.you) : null
            return (
              <div key={w} className="slot">
                <motion.div className="flipper big" animate={{ rotateY: k ? 180 : 0, scale: phase === 'count' ? [1, 1.05, 1] : 1 }} transition={{ duration: phase === 'count' ? 0.38 : 0.6, repeat: phase === 'count' ? 3 : 0 }}>
                  <div className="face back"><span className="q">{w === 'me' ? '나' : f.name}</span><span className="mini">{phase === 'choose' ? (w === 'me' ? '선택하세요' : '고민 중…') : '공개!'}</span></div>
                  <div className="face front">{k && <ChoiceFace k={k} t={t} who={w === 'me' ? '나' : f.name} />}</div>
                </motion.div>
                {k && <motion.span className={`float ${w}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>+{w === 'me' ? last.a : last.b}</motion.span>}
              </div>
            )
          })}
          <AnimatePresence>
            {phase === 'count' && (
              <motion.div key={count} className="count" initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.25 }}>{count}</motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'choose' && (
            <motion.div key="ch" className="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <motion.button whileTap={{ scale: 0.94 }} whileHover={{ y: -4 }} className="choice c" onClick={() => play('C')}>
                <span>{t.Cicon}</span><b>{t.C}</b><small>{t.Cdesc}</small>
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} whileHover={{ y: -4 }} className="choice d" onClick={() => play('D')}>
                <span>{t.Dicon}</span><b>{t.D}</b><small>{t.Ddesc}</small>
              </motion.button>
            </motion.div>
          )}
          {phase === 'reveal' && o && (
            <motion.div key={'r' + h.length} className={`outcome ${o.tone}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div><b>{o.title}</b><p>{o.text} <span className="pts">(나 +{last.a} · {f.name} +{last.b})</span></p></div>
              {showKindNote && <p className="note">💭 {nick(f)}는 이번에도 나를 믿고 {t.C}를 골랐어요. 내 점수는 올랐지만 {nick(f)} 마음은 어떨까요?</p>}
              <Btn onClick={() => { if (showKindNote) setWarned(true); next() }}>{h.length === D.TALK_AT && !talk ? `${t.talkIcon} ${t.talkName}!` : h.length < D.ROUNDS ? '다음 라운드 →' : '경기 끝! 결과 보기'}</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>}
    </motion.div>
  )
}

// ───────────────── 스테이지 결과
function StageEnd({ s, set }) {
  const f = byId(s.order[s.order.length - 1])
  const r = s.results[f.id]
  const [guess, setGuess] = useState(r.mind || null)
  const [open, setOpen] = useState(!!r.mind)
  const real = r.trust >= 60 ? D.MINDS[0] : r.trust >= 40 ? D.MINDS[1] : r.trust >= 20 ? D.MINDS[2] : D.MINDS[3]
  const pick = (m) => { setGuess(m.id); set({ results: { ...s.results, [f.id]: { ...r, mind: m.id } } }, true); setTimeout(() => setOpen(true), 400) }
  const cc = r.moves.split(' ').filter((m) => m === 'CC').length
  const retry = () => { const res = { ...s.results }; delete res[f.id]; set({ screen: 'match', results: res }) }
  useEffect(() => { if (r.my + r.ur >= bestTeam(f) - 2) fireConfetti(true) }, []) // eslint-disable-line

  return (
    <motion.div className="stack" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="card center stack">
        <Avatar f={f} size={84} />
        <h2>{wa(f.name)}의 경기 끝!</h2>
        <div className="tiles">
          <div><b><CountUp to={r.my} /></b><span>내 점수</span></div>
          <div><b><CountUp to={r.ur} /></b><span>{f.name} 점수</span></div>
          <div className="hl"><b><CountUp to={r.my + r.ur} /></b><span>우리 팀 점수 (최대 {bestTeam(f)})</span></div>
        </div>
        <p className="sub">둘 다 함께를 고른 라운드 {cc} / {D.ROUNDS} · 남은 믿음 {r.trust}%</p>
      </div>

      <div className="card stack">
        <p className="eyebrow">마음 읽기</p>
        <h2>경기를 마친 {nick(f)}의 마음은 어떨까요?</h2>
        <div className="minds">
          {D.MINDS.map((m) => (
            <motion.button key={m.id} whileTap={{ scale: 0.9 }} className={`mind ${guess === m.id ? 'on' : ''}`} onClick={() => pick(m)} disabled={open}>
              <span>{m.icon}</span><b>{m.label}</b>
            </motion.button>
          ))}
        </div>
        {open && (
          <motion.p className="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            믿음 게이지로 보면 {nick(f)}는 지금 <b>{real.icon} '{real.label}'</b>에 가까워요. {guess === real.id ? '친구 마음을 잘 읽었어요!' : '내 생각과 조금 달랐나요? 친구 입장에서 한 번 더 떠올려 봐요.'}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="secret" initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 90 }}>
            <p className="eyebrow">🔓 {f.name}의 비밀 규칙</p>
            <p className="rule">{f.rule}</p>
            <p>{f.lesson}</p>
            {f.id === 'kind' && r.my > r.ur && <p className="note">친구의 믿음을 이용해서 얻은 점수예요. 교실에서 이런 일이 되풀이되면 그건 게임이 아니라 괴롭힘이 될 수 있어요.</p>}
            {f.id === 'oops' && <p className="note">2라운드에 {f.name}의 카드가 '실수!'였던 것, 기억나요? 그 뒤 나는 어떻게 했나요?</p>}
            <div className="row">
              <Btn kind="ghost" onClick={retry}>이 친구와 다시 해 보기</Btn>
              <Btn onClick={() => set({ screen: 'map', cleared: f.id })}>STAGE CLEAR! 지도로 →</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ───────────────── 시상대 + 성찰
function Final({ s, set, reset }) {
  const t = D.THEMES[s.theme]
  const rows = s.order.map((id) => ({ f: byId(id), r: s.results[id] })).filter((x) => x.r)
  const my = rows.reduce((a, x) => a + x.r.my, 0), ur = rows.reduce((a, x) => a + x.r.ur, 0), team = my + ur
  const allMoves = rows.flatMap((x) => x.r.moves.split(' '))
  const cCount = allMoves.filter((m) => m[0] === 'C').length
  const pct = team / MAX
  const rf = s.reflect
  const setR = (o) => set({ reflect: { ...rf, ...o } }, true)
  const [copied, setCopied] = useState(false)
  const [sure, setSure] = useState(false)
  useEffect(() => { fireConfetti(true) }, [])
  const pre = D.PREDICT.find((p) => p.id === s.predict)
  const preMsg = s.predict === 'D' ? '경기 전에는 "늘 나만 챙기기"가 이득이라고 생각했어요. 실제로는 어땠나요? 함께를 고른 경기일수록 우리 팀 점수가 높았어요.'
    : s.predict === 'C' ? '경기 전에 "늘 함께하기"를 골랐어요. 마음 닫은 친구에게는 손해를 보면서도 꾸준히 함께해야 마음이 열렸죠.'
    : '경기 전에 "상대를 봐 가며 정하기"를 골랐어요. 그런데 상대가 혼자를 골라도 내가 먼저 함께를 지킬 때 관계가 다시 이어졌어요.'
  const msg = pct >= 0.9 ? '거의 모든 라운드에서 함께를 지켰어요. 나도 친구도 가장 많이 얻는 길을 찾았어요!'
    : pct >= 0.7 ? '대체로 함께를 골랐어요. 마음 닫은 친구에게 한 번 더 손을 내밀면 우리 팀 점수가 더 올라가요.'
    : '나만 챙긴 라운드가 많았어요. 내 점수는 올라도 우리 팀 점수와 믿음은 내려가요. 다시 도전해 볼까요?'
  const pledge = [rf.pledge, rf.own.trim()].filter(Boolean).join(' / ')
  const text = [
    `[신뢰 게임 결과] ${s.num ? s.num + '번' : '번호 없음'} · ${t.label}`,
    `우리 팀 점수 ${team}/${MAX}점 (내 점수 ${my}) · 내가 함께를 고른 라운드 ${cCount}/${allMoves.length}`,
    `친구별: ${rows.map((x) => `${x.f.name} ${x.r.my + x.r.ur}점(믿음 ${x.r.trust}%)`).join(', ')}`,
    `${t.talkName}에 건넨 따뜻한 말: ${rows.filter((x) => x.r.talk === 'good').length}/${rows.length}번 · 상황 퀴즈 ${s.quiz ? D.QUIZ.length + '문항 완주' : '-'}`,
    `경기 전 예측: ${pre ? pre.label : '-'}`,
    `함께를 고르기 어려웠던 때: ${rf.hard || '-'}`,
    `내가 가장 잘한 선택: ${rf.best.trim() || '-'}`,
    `다음 시간에 실천할 '${t.C}': ${pledge || '-'}`,
  ].join('\n')
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') } catch { /* */ } ta.remove()
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  return (
    <motion.div className="stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="card podium-card center stack">
        <motion.div className="trophy" initial={{ y: -80, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 10 }}>🏆</motion.div>
        <p className="eyebrow">어울림 시상대</p>
        <div className="huge"><CountUp to={team} dur={1.8} /><small> / {MAX}</small></div>
        <p>우리 팀 점수 · 내 점수 {my} · 함께를 고른 라운드 {cCount}/{allMoves.length} · {t.talkName} 따뜻한 말 {rows.filter((x) => x.r.talk === 'good').length}/{rows.length}</p>
        <div className="bars">
          {rows.map(({ f, r }, i) => (
            <div key={f.id} className="barrow">
              <Avatar f={f} size={36} />
              <span className="bn">{f.name}</span>
              <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${((r.my + r.ur) / bestTeam(f)) * 100}%` }} transition={{ delay: 0.4 + i * 0.15, duration: 0.8 }} /></div>
              <b>{r.my + r.ur}</b>
            </div>
          ))}
        </div>
        <p className="outcome-line">{msg}</p>
      </div>

      <div className="card stack">
        <p className="eyebrow">예측과 비교</p>
        <p>{preMsg}</p>
        <div className="goal"><span>💡</span><p>한 번 보고 끝나는 사이라면 나만 챙기는 게 이득처럼 보여요. 하지만 우리 반은 1년 내내 함께 지내요. <b>이어지는 관계에서는 믿음이 가장 큰 점수</b>예요.</p></div>
        <div className="comps">{D.COMPS.map((c) => <div key={c.name}><b>{c.name}</b><span>{c.how}</span></div>)}</div>
      </div>

      <div className="card stack">
        <p className="eyebrow">나를 돌아보기</p>
        <h3>1. 함께를 고르기 가장 어려웠던 때는?</h3>
        <div className="chips">{D.HARD.map((x) => <button key={x} className={rf.hard === x ? 'on' : ''} onClick={() => setR({ hard: x })}>{x}</button>)}</div>
        <h3>2. 오늘 경기에서 내가 가장 잘한 선택은? 그 이유는?</h3>
        <textarea rows={2} maxLength={120} value={rf.best} onChange={(e) => setR({ best: e.target.value })} placeholder="예: 태민이가 혼자를 골라도 두 번 더 패스해서 마음을 열었다." />
        <h3>3. 다음 {t.label}에 실천할 '{t.C}' 한 가지</h3>
        <div className="chips">{D.PLEDGE[s.theme].map((x) => <button key={x} className={rf.pledge === x ? 'on' : ''} onClick={() => setR({ pledge: rf.pledge === x ? null : x })}>{x}</button>)}</div>
        <input value={rf.own} maxLength={60} onChange={(e) => setR({ own: e.target.value })} placeholder="직접 써도 좋아요" />
      </div>

      <div className="card stack">
        <p className="eyebrow">결과 제출</p>
        <pre className="result">{text}</pre>
        <div className="row">
          <Btn onClick={copy}>{copied ? '복사했어요! 패들렛에 붙여 넣으세요 ✓' : '결과 복사하기'}</Btn>
          <Btn kind="ghost" onClick={() => (sure ? reset() : setSure(true))}>{sure ? '정말 지울까요? 한 번 더 누르면 처음으로' : '처음부터 다시'}</Btn>
        </div>
        <small className="muted">결과는 서버에 저장되지 않고 이 탭을 닫으면 사라져요. 복사해서 학급 게시판(패들렛·클래스룸)에 올려 주세요.</small>
      </div>
    </motion.div>
  )
}

// ───────────────── 선생님용 안내
function Teacher({ close, theme }) {
  const t = D.THEMES[theme]
  return (
    <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
      <motion.div className="card sheet stack" initial={{ y: 40 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="row between"><h2>선생님용 안내</h2><button className="x" onClick={close} aria-label="닫기">✕</button></div>
        <h3>수업 흐름 (약 40분, 1인 1태블릿)</h3>
        <ol className="flow">
          <li><b>도입 5분</b> 규칙 화면을 함께 보고, 학생마다 "어떻게 해야 팀 점수가 가장 높을까?"를 예측해요.</li>
          <li><b>전개 27분</b> 카드를 뽑아 다섯 친구와 {D.ROUNDS}라운드씩 경기해요. {D.TALK_AT}라운드가 끝나면 {t.talkName}에서 친구에게 건넬 한마디를 골라요(따뜻한 말은 믿음을 올리고, 마음 닫은 태민·서운한 민재의 마음을 더 빨리 열어요). 스테이지가 끝날 때마다 친구 마음을 짐작하고 비밀 규칙을 확인해요. 마지막 STAGE 6은 오늘 배운 것을 우리 반 상황에 적용하는 퀴즈 5문항이에요.</li>
          <li><b>정리 8분</b> 시상대 화면에서 예측과 결과를 비교하고, 성찰 세 문항을 쓴 뒤 결과를 복사해 패들렛에 올려요.</li>
        </ol>
        <h3>점수 규칙</h3>
        <table className="tpay"><thead><tr><th></th><th>친구 {t.C}</th><th>친구 {t.D}</th></tr></thead>
          <tbody><tr><th>나 {t.C}</th><td>3 / 3</td><td>0 / 5</td></tr><tr><th>나 {t.D}</th><td>5 / 0</td><td>1 / 1</td></tr></tbody></table>
        <p className="sub">한 판만 보면 '{t.D}' 쪽이 늘 내 점수에 유리해요(죄수의 딜레마). 하지만 다섯 판이 이어지고 목표가 '우리 팀 점수'이면 함께가 가장 좋아요. 다섯 친구 모두 늘 함께를 고르면 우리 팀 최고 점수 {MAX}점이에요.</p>
        <h3>친구별 비밀 규칙</h3>
        <ul className="frules">{D.FRIENDS.map((f) => <li key={f.id}><b>{f.name}({f.tag})</b> {f.rule}</li>)}</ul>
        <h3>함께 이야기할 질문</h3>
        <ul className="frules">
          <li>도윤이처럼 늘 믿어 주는 친구를 이용하면 어떤 일이 생길까요? 교실에서는 어떤 모습일까요?</li>
          <li>지후의 실수를 일부러 한 것으로 생각했다면, 그다음 라운드는 어땠나요? 실수와 일부러를 어떻게 구별할 수 있을까요?</li>
          <li>마음 닫은 태민이에게 손해를 보면서도 다가간 사람이 있나요? 그때 어떤 마음이었나요?</li>
          <li>{t.talkName}에 어떤 말을 골랐나요? 같은 상황에서 한 말 한마디가 친구의 선택을 어떻게 바꿨나요?</li>
          <li>우리 반에서 '{t.C}'가 필요한 순간은 언제일까요?</li>
        </ul>
        <p className="sub">개인정보와 저장: 이름은 받지 않고, 번호는 화면 표시에만 써요. 서버·데이터베이스가 없어 기록은 탭을 닫으면 사라져요. 제출은 결과 복사 → 패들렛으로 해요.</p>
      </motion.div>
    </motion.div>
  )
}

// ───────────────── 앱
export default function App() {
  const [s, setS] = useState(() => load() || blank())
  const [teacher, setTeacher] = useState(false)
  const top = useRef(null)
  const set = (o, quiet) => setS((p) => { const n = { ...p, ...o }; save(n); return n })
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [s.screen])
  const reset = () => { const b = blank(); b.num = s.num; b.theme = s.theme; save(b); setS(b) }
  const doneN = Object.keys(s.results).length
  const team = Object.values(s.results).reduce((a, r) => a + r.my + r.ur, 0)
  const views = { start: Start, rules: Rules, map: MapScreen, draw: Draw, match: Match, stageEnd: StageEnd, quiz: Quiz, final: Final }
  const View = views[s.screen] || Start
  return (
    <>
      <div className="sky" /><div className="lights"><i /><i /></div>
      <div className="wrap" ref={top}>
        {s.screen !== 'start' && (
          <header className="hud">
            <button className="brand" onClick={() => set({ screen: 'map' })} disabled={s.screen === 'rules' || s.screen === 'match'}><span className="logo">{D.THEMES[s.theme].icon}</span>신뢰 게임</button>
            <div className="pills">
              <span className="pill">스테이지 {progress(s)}/{PI}</span>
              {s.screen !== 'match' && <span className="pill gold">우리 팀 {team}점</span>}
              <button className="pill ghost" onClick={() => setTeacher(true)}>선생님용</button>
            </div>
          </header>
        )}
        <AnimatePresence mode="wait">
          <View key={s.screen + (s.screen === 'match' ? s.order.length + ':' + doneN : '')} s={s} set={set} reset={reset} openTeacher={() => setTeacher(true)} />
        </AnimatePresence>
        <footer className="foot">어울려 볼科(과) · 경북 학교폭력 예방 수업지원단 · 서버에 기록이 남지 않아요</footer>
      </div>
      <AnimatePresence>{teacher && <Teacher close={() => setTeacher(false)} theme={s.theme} />}</AnimatePresence>
    </>
  )
}
