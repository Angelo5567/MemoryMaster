import { useEffect, useMemo, useState } from "react";
import "./index.css";

const BANDS = [
  { id: 0, name: "Principiante", subtitle: "Risveglia la memoria", icon: "🌱", color: "sand" },
  { id: 1, name: "Intermedio", subtitle: "Allena la concentrazione", icon: "🧠", color: "gold" },
  { id: 2, name: "Avanzato", subtitle: "Metti alla prova la mente", icon: "⚡", color: "wine" },
  { id: 3, name: "Esperto", subtitle: "Sfida i tuoi limiti", icon: "👑", color: "dark" }
];

const GAME_TYPES = [
  { type: "pairs", name: "Coppie lampo", icon: "🃏", description: "Riconosci gli elementi uguali" },
  { type: "sequence", name: "Sequenza visiva", icon: "🔢", description: "Ricorda l'ordine degli elementi" },
  { type: "color", name: "Memoria cromatica", icon: "🎨", description: "Memorizza colori e combinazioni" },
  { type: "numbers", name: "Numeri in fuga", icon: "🔣", description: "Ricorda le sequenze numeriche" },
  { type: "words", name: "Parole nascoste", icon: "📖", description: "Allena la memoria verbale" },
  { type: "spatial", name: "Mappa mentale", icon: "🧩", description: "Ricorda posizioni e coordinate" },
  { type: "missing", name: "Elemento mancante", icon: "🔍", description: "Individua ciò che è scomparso" },
  { type: "order", name: "Ordine perfetto", icon: "📐", description: "Ricostruisci l'ordine corretto" },
  { type: "pattern", name: "Pattern segreto", icon: "🔮", description: "Scopri la regola nascosta" },
  { type: "symbols", name: "Simboli in codice", icon: "🔱", description: "Memorizza simboli e associazioni" }
];

const GAMES = BANDS.flatMap((band) =>
  GAME_TYPES.map((game, index) => ({
    ...game,
    id: `${game.type}-${band.id}`,
    band: band.id,
    number: band.id * 10 + index + 1
  }))
);

const DEFAULT_STATS = {
  xp: 0,
  completed: {},
  levels: {},
  best: {},
  played: 0,
  correct: 0,
  streak: 0,
  lastPlayed: "",
  daily: { date: "", count: 0 },
  history: []
};

const EMOJIS = ["🍎", "🍋", "🍇", "🍓", "🍒", "🥝", "🍉", "🍍", "🥑", "🍑", "🌙", "⭐", "🔥", "💎", "🌸", "🍀", "🦋", "🎯", "🎲", "🚀"];
const WORDS = ["Oceano", "Foresta", "Viaggio", "Memoria", "Coraggio", "Musica", "Pianeta", "Cristallo", "Orizzonte", "Silenzio", "Mistero", "Energia", "Libertà", "Sogno", "Avventura", "Equilibrio"];
const COLORS = ["Rosso", "Blu", "Verde", "Giallo", "Viola", "Arancio", "Rosa", "Turchese"];
const SYMBOLS = ["◆", "●", "▲", "■", "✦", "⬟", "✚", "◉", "◇", "✧", "⬢", "✿"];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function sample(array, count) {
  return shuffle(array).slice(0, count);
}

function makeTask(type, level, band) {
  const difficulty = band * 2 + Math.floor((level - 1) / 2);
  const count = Math.min(4 + difficulty, 10);
  let values = [];
  let answer;
  let options = [];
  let question = "";
  let display = "";

  if (type === "pairs") {
    const pool = sample(EMOJIS, Math.min(6 + difficulty, 12));
    const target = pool[Math.floor(Math.random() * pool.length)];
    const decoys = sample(EMOJIS.filter(x => x !== target), 3);
    answer = target;
    options = shuffle([target, target, ...decoys]);
    question = `Quale simbolo compare due volte?`;
    display = pool.join("   ");
  } else if (type === "sequence") {
    values = sample(EMOJIS, count);
    const index = Math.floor(Math.random() * values.length);
    answer = values[index];
    options = shuffle([answer, ...sample(EMOJIS.filter(x => !values.includes(x)), 3)]);
    question = `Quale elemento occupava la posizione ${index + 1}?`;
    display = values.join("   ");
  } else if (type === "color") {
    values = sample(COLORS, Math.min(4 + difficulty, 8));
    const index = Math.floor(Math.random() * values.length);
    answer = values[index];
    options = shuffle([answer, ...sample(COLORS.filter(x => !values.includes(x)), 3)]);
    question = `Quale colore era in posizione ${index + 1}?`;
    display = values.map((v) => ({
      Rosso: "🟥", Blu: "🟦", Verde: "🟩", Giallo: "🟨",
      Viola: "🟪", Arancio: "🟧", Rosa: "🌸", Turchese: "🟦"
    }[v])).join("   ");
  } else if (type === "numbers") {
    values = Array.from({ length: count }, () => Math.floor(Math.random() * 9) + 1);
    const index = Math.floor(Math.random() * values.length);
    answer = String(values[index]);
    options = shuffle([answer, ...sample(["1","2","3","4","5","6","7","8","9"].filter(x => !values.includes(Number(x))), 3)]);
    question = `Quale numero era in posizione ${index + 1}?`;
    display = values.join("   ");
  } else if (type === "words") {
    values = sample(WORDS, Math.min(3 + difficulty, WORDS.length));
    const index = Math.floor(Math.random() * values.length);
    answer = values[index];
    options = shuffle([answer, ...sample(WORDS.filter(x => !values.includes(x)), 3)]);
    question = `Quale parola hai visto in posizione ${index + 1}?`;
    display = values.join("  •  ");
  } else if (type === "spatial") {
    const cells = Array.from({ length: 9 }, (_, i) => i);
    const positions = sample(cells, Math.min(3 + difficulty, 8));
    const index = Math.floor(Math.random() * positions.length);
    answer = String(positions[index] + 1);
    options = shuffle([answer, ...sample(cells.filter(x => !positions.includes(x)).map(x => String(x + 1)), 3)]);
    question = `Quale casella era illuminata nella posizione ${index + 1}?`;
    display = positions.map(x => x + 1).join("   ");
  } else if (type === "missing") {
    values = sample(EMOJIS, count);
    const index = Math.floor(Math.random() * values.length);
    answer = values[index];
    const visible = values.filter((_, i) => i !== index);
    options = shuffle([answer, ...sample(EMOJIS.filter(x => !values.includes(x)), 3)]);
    question = "Quale elemento è stato eliminato?";
    display = visible.join("   ");
  } else if (type === "order") {
    values = sample(EMOJIS, Math.min(3 + difficulty, 7));
    answer = values[0];
    options = shuffle([answer, ...sample(EMOJIS.filter(x => !values.includes(x)), 3)]);
    question = "Qual era il primo elemento della sequenza?";
    display = values.join("   ");
  } else if (type === "pattern") {
    const symbols = ["🔴", "🔵", "🟡", "🟢"];
    const a = symbols[Math.floor(Math.random() * symbols.length)];
    const b = symbols.filter(x => x !== a)[Math.floor(Math.random() * 3)];
    const sequence = [a, b, a, b, a];
    answer = b;
    options = shuffle([b, ...sample(symbols.filter(x => x !== b), 3)]);
    question = "Quale simbolo completa il modello?";
    display = [...sequence, "❓"].join("   ");
  } else {
    values = sample(SYMBOLS, count);
    const index = Math.floor(Math.random() * values.length);
    answer = values[index];
    options = shuffle([answer, ...sample(SYMBOLS.filter(x => !values.includes(x)), 3)]);
    question = `Quale simbolo era in posizione ${index + 1}?`;
    display = values.join("   ");
  }

  return { question, display, answer, options };
}

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem("memorymaster-v3") || "{}");
    return {
      ...DEFAULT_STATS,
      ...saved,
      completed: saved.completed || {},
      levels: saved.levels || {},
      best: saved.best || {},
      daily: saved.daily || DEFAULT_STATS.daily,
      history: saved.history || []
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [stats, setStats] = useState(loadStats);
  const [view, setView] = useState("home");
  const [selectedBand, setSelectedBand] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [task, setTask] = useState(null);
  const [phase, setPhase] = useState("preview");
  const [preview, setPreview] = useState(3);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    localStorage.setItem("memorymaster-v3", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (view !== "game" || phase !== "preview") return;
    if (preview <= 0) {
      setPhase("question");
      return;
    }
    const timer = setTimeout(() => setPreview(v => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [view, phase, preview]);

  const today = todayKey();
  const dailyCount = stats.daily.date === today ? stats.daily.count : 0;
  const unlockedBands = useMemo(() => {
    let unlocked = 1;
    for (let band = 0; band < 3; band++) {
      const games = GAMES.filter(g => g.band === band);
      if (games.every(g => (stats.completed[g.id] || 0) > 0)) unlocked = band + 2;
      else break;
    }
    return unlocked;
  }, [stats.completed]);

  function startGame(game) {
    const nextLevel = Math.max(1, Math.min(10, stats.levels[game.id] || 1));
    setSelectedGame(game);
    setSelectedBand(game.band);
    setLevel(nextLevel);
    setRound(0);
    setLives(3);
    setScore(0);
    setPreview(3);
    setTask(makeTask(game.type, nextLevel, game.band));
    setPhase("preview");
    setFeedback("");
    setView("game");
  }

  function finishGame(won) {
    const game = selectedGame;
    const today = todayKey();
    const xpEarned = won ? 40 + level * 10 + game.band * 25 : Math.max(5, score * 5);
    setStats(prev => {
      const previousDay = prev.lastPlayed;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const streak = previousDay === today ? prev.streak : previousDay === yesterday ? prev.streak + 1 : 1;
      const daily = prev.daily.date === today
        ? { ...prev.daily, count: prev.daily.count + 1 }
        : { date: today, count: 1 };
      const completed = { ...prev.completed };
      const levels = { ...prev.levels };
      const best = { ...prev.best };
      if (won) {
        completed[game.id] = (completed[game.id] || 0) + 1;
        levels[game.id] = Math.min(10, level + 1);
        best[game.id] = Math.max(best[game.id] || 0, score + 1);
      }
      return {
        ...prev,
        xp: prev.xp + xpEarned,
        completed,
        levels,
        best,
        played: prev.played + 1,
        correct: prev.correct + score,
        streak,
        lastPlayed: today,
        daily,
        history: [{ game: game.name, won, xp: xpEarned, date: today }, ...prev.history].slice(0, 20)
      };
    });
    setFeedback(won ? "Hai completato la sfida!" : "Sfida terminata");
    setPhase(won ? "won" : "lost");
  }

  function answerQuestion(option) {
    if (phase !== "question") return;
    if (option === task.answer) {
      const newScore = score + 1;
      setScore(newScore);
      if (round >= 4) {
        finishGame(true);
      } else {
        setRound(r => r + 1);
        setFeedback("Risposta corretta!");
        setPhase("correct");
        setTimeout(() => {
          setTask(makeTask(selectedGame.type, level, selectedGame.band));
          setPreview(3);
          setPhase("preview");
          setFeedback("");
        }, 650);
      }
    } else {
      const remaining = lives - 1;
      setLives(remaining);
      if (remaining <= 0) {
        finishGame(false);
      } else {
        setFeedback("Non è corretto. Riprova!");
        setPhase("wrong");
        setTimeout(() => {
          setPhase("question");
          setFeedback("");
        }, 700);
      }
    }
  }

  function goHome() {
    setView("home");
    setSelectedGame(null);
    setPhase("preview");
  }

  const currentBand = BANDS[selectedBand];
  const gameProgress = selectedGame ? (stats.levels[selectedGame.id] || 1) : 1;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome}>
          <span className="brand-mark">M</span>
          <span>MEMORY<span className="brand-gold">MASTER</span><small>TRAIN YOUR MIND</small></span>
        </button>
        <nav className="top-actions">
          <button className="nav-button" onClick={() => setShowStats(true)}>Statistiche</button>
          <div className="xp-pill">✦ {stats.xp} XP</div>
        </nav>
      </header>

      {view === "home" && (
        <main className="main-content">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span></span> IL TUO ALLENAMENTO MENTALE</div>
              <h1>Una mente più forte.<br /><em>Una sfida alla volta.</em></h1>
              <p>Allena memoria, attenzione e concentrazione attraverso 40 giochi e 4 livelli di difficoltà.</p>
              <button className="primary-button" onClick={() => document.getElementById("game-library")?.scrollIntoView({ behavior: "smooth" })}>
                Inizia ad allenarti <span>↗</span>
              </button>
            </div>
            <div className="hero-art">
              <div className="orbit orbit-one"></div>
              <div className="orbit orbit-two"></div>
              <div className="brain-icon">🧠</div>
              <div className="floating-card card-one">✦ <span>MEMORIA</span></div>
              <div className="floating-card card-two">◆ <span>FOCUS</span></div>
              <div className="floating-card card-three">◉ <span>LOGICA</span></div>
            </div>
          </section>

          <section className="stats-strip">
            <div className="stat-item"><span className="stat-icon">✦</span><div><strong>{stats.xp}</strong><small>Punti esperienza</small></div></div>
            <div className="stat-item"><span className="stat-icon">🎮</span><div><strong>{stats.played}</strong><small>Partite giocate</small></div></div>
            <div className="stat-item"><span className="stat-icon">🔥</span><div><strong>{stats.streak}</strong><small>Giorni consecutivi</small></div></div>
            <div className="stat-item"><span className="stat-icon">🏆</span><div><strong>{Object.values(stats.completed).filter(v => v > 0).length}/40</strong><small>Giochi completati</small></div></div>
          </section>

          <section className="daily-panel">
            <div className="daily-icon">☀</div>
            <div className="daily-copy"><strong>La tua missione quotidiana</strong><span>Completa 3 allenamenti per mantenere attiva la tua routine.</span></div>
            <div className="daily-progress"><strong>{Math.min(dailyCount, 3)}/3</strong><div className="progress-track"><span style={{ width: `${Math.min(100, dailyCount / 3 * 100)}%` }}></span></div></div>
            {dailyCount >= 3 && <span className="daily-done">COMPLETATA ✓</span>}
          </section>

          <section id="game-library" className="library-section">
            <div className="section-heading">
              <div><div className="eyebrow">IL PERCORSO</div><h2>Scegli la tua <em>sfida</em></h2></div>
              <span className="section-count">40 GIOCHI · 4 FASCE</span>
            </div>

            <div className="band-tabs">
              {BANDS.map((band, index) => (
                <button key={band.id} className={`band-tab ${selectedBand === index ? "active" : ""} ${index >= unlockedBands ? "locked" : ""}`} onClick={() => setSelectedBand(index)} disabled={index >= unlockedBands}>
                  <span>{band.icon}</span><div><strong>{band.name}</strong><small>{index >= unlockedBands ? "🔒 Bloccata" : band.subtitle}</small></div>
                  {selectedBand === index && <i>●</i>}
                </button>
              ))}
            </div>

            <div className="band-intro">
              <div><span className="band-icon">{currentBand.icon}</span><div><h3>{currentBand.name}</h3><p>{currentBand.subtitle}</p></div></div>
              <span className="band-total">{GAMES.filter(g => g.band === selectedBand && (stats.completed[g.id] || 0) > 0).length} / 10 completati</span>
            </div>

            <div className="game-grid">
              {GAMES.filter(g => g.band === selectedBand).map(game => {
                const done = (stats.completed[game.id] || 0) > 0;
                const currentLevel = stats.levels[game.id] || 1;
                return (
                  <button className="game-card" key={game.id} onClick={() => startGame(game)}>
                    <div className="game-card-top"><span className="game-number">{String(game.number).padStart(2, "0")}</span><span className="game-status">{done ? "✓" : "↗"}</span></div>
                    <div className="game-emoji">{game.icon}</div>
                    <h4>{game.name}</h4>
                    <p>{game.description}</p>
                    <div className="game-card-bottom"><span>Livello {currentLevel}/10</span><span className="mini-progress"><i style={{ width: `${currentLevel * 10}%` }}></i></span></div>
                  </button>
                );
              })}
            </div>
          </section>
          <footer className="footer">MEMORYMASTER <span>·</span> ALLENA LA TUA MENTE, OGNI GIORNO.</footer>
        </main>
      )}

      {view === "game" && selectedGame && (
        <main className="game-screen">
          <div className="game-toolbar">
            <button className="back-button" onClick={goHome}>← Torna ai giochi</button>
            <div className="game-toolbar-meta"><span>{BANDS[selectedGame.band].name}</span><span>Livello {level}/10</span></div>
          </div>
          <div className="game-container">
            <div className="game-heading">
              <span className="large-game-icon">{selectedGame.icon}</span>
              <div><div className="eyebrow">SFIDA {String(selectedGame.number).padStart(2, "0")}</div><h1>{selectedGame.name}</h1><p>{selectedGame.description}</p></div>
            </div>
            <div className="game-info-row">
              <span>ROUND <strong>{Math.min(round + 1, 5)}/5</strong></span>
              <div className="round-dots">{Array.from({ length: 5 }, (_, i) => <i key={i} className={i < round ? "filled" : ""}></i>)}</div>
              <span className="lives">{"♥ ".repeat(lives)}</span>
            </div>
            <div className="challenge-card">
              {(phase === "preview" || phase === "question" || phase === "wrong" || phase === "correct") && (
                <>
                  <div className="challenge-label">{phase === "preview" ? "MEMORIZZA" : "METTI ALLA PROVA LA MEMORIA"}</div>
                  <h2>{phase === "preview" ? "Osserva attentamente" : task.question}</h2>
                  <div className={`memory-display ${phase === "preview" ? "preview-mode" : ""}`}>
                    {phase === "preview" ? <><div className="memory-values">{task.display}</div><div className="preview-count">{preview > 0 ? `Preparati... ${preview}` : "Via!"}</div></> : <div className="question-mark">?</div>}
                  </div>
                  {phase === "preview" && <p className="challenge-hint">Memorizza gli elementi. Tra poco dovrai rispondere.</p>}
                  {(phase === "question" || phase === "wrong") && <>
                    <div className="answer-options">{task.options.map((option, i) => <button key={`${option}-${i}`} className="answer-option" onClick={() => answerQuestion(option)}>{option}</button>)}</div>
                    {feedback && <p className="feedback">{feedback}</p>}
                  </>}
                  {phase === "correct" && <p className="feedback good">{feedback}</p>}
                </>
              )}
              {(phase === "won" || phase === "lost") && (
                <div className="result-panel">
                  <div className="result-icon">{phase === "won" ? "🏆" : "💪"}</div>
                  <div className="eyebrow">{phase === "won" ? "SFIDA COMPLETATA" : "NON MOLLARE"}</div>
                  <h2>{phase === "won" ? "Ottimo lavoro!" : "Ci riproviamo?"}</h2>
                  <p>{phase === "won" ? `Hai superato il livello ${level} di ${selectedGame.name}.` : "Ogni tentativo allena la tua memoria. Riprova e migliora il risultato."}</p>
                  <div className="result-score"><span>PUNTEGGIO</span><strong>{score}/5</strong></div>
                  <div className="result-actions">
                    <button className="primary-button" onClick={() => startGame(selectedGame)}>{phase === "won" ? "Ripeti la sfida" : "Riprova"} ↗</button>
                    <button className="secondary-button" onClick={goHome}>Torna ai giochi</button>
                  </div>
                  {phase === "won" && <p className="level-note">✦ +{40 + level * 10 + selectedGame.band * 25} XP · Prossimo livello: {Math.min(10, level + 1)}</p>}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {showStats && (
        <div className="modal-backdrop" onClick={() => setShowStats(false)}>
          <div className="stats-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowStats(false)}>×</button>
            <div className="eyebrow">IL TUO PERCORSO</div><h2>Le tue <em>statistiche</em></h2>
            <div className="modal-stats-grid">
              <div><strong>{stats.xp}</strong><span>XP TOTALI</span></div>
              <div><strong>{stats.played}</strong><span>PARTITE</span></div>
              <div><strong>{stats.correct}</strong><span>RISPOSTE CORRETTE</span></div>
              <div><strong>{stats.streak}</strong><span>SERIE GIORNALIERA</span></div>
            </div>
            <h3>Attività recente</h3>
            {stats.history.length === 0 ? <p className="empty-history">Non hai ancora completato allenamenti. La tua prima sfida ti aspetta!</p> : <div className="history-list">{stats.history.slice(0, 8).map((item, i) => <div key={i}><span>{item.won ? "🏆" : "🎯"}</span><strong>{item.game}</strong><small>{item.won ? "Completata" : "Tentativo"}</small><b>+{item.xp} XP</b></div>)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
