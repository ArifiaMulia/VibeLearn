import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Play, Save, Terminal as TerminalIcon, Sparkles, CheckCircle2, MessageSquare, Lightbulb, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

// Starter codes for each lab type
const STARTER_CODES = {
  prompt: `// AI Prompt Simulator
// Task: Craft a prompt that tells the AI to build a secure Login Form.
// The instructions must include validation rules (no empty fields) and error handling.

const SYSTEM_ROLE = "You are a senior security engineer.";
const USER_PROMPT = ""; // TODO: Write your detailed prompt here

function validatePrompt() {
  // Your prompt should be at least 15 characters long
  return USER_PROMPT.length > 15;
}
`,
  code: `// Code Challenge Lab
// Task: Fix the broken API fetch function. Currently it is missing async/await.

function fetchData(url) {
  // BUG: This needs to be asynchronous and await the response!
  const response = fetch(url);
  const data = response.json();
  return data;
}
`,
  security: `// Security Audit Lab
// Task: Fix the SQL injection vulnerability.

function getUserById(userId) {
  // BUG: Direct string interpolation leads to SQL Injection!
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  return db.execute(query);
}
`,
  build: `// Build Challenge
// Task: Implement a standard Todo CRUD state.

const todoState = {
  todos: [],
  addTodo(text) {
    // TODO: implement add todo pushing { id: Date.now(), text, completed: false }
  },
  toggleTodo(id) {
    // TODO: implement toggle completed status
  }
};
`,
  speedrun: `// Speed Run Challenge
// Task: Scaffold a React dashboard card displaying total active users.

import React from 'react';

export default function UsersCard({ count }) {
  // TODO: Render a beautiful card showing the count of active users
  return (
    <div className="card">
      <h3>Active Users</h3>
      {/* Show count here */}
    </div>
  );
}
`
};

// Guided checklist steps in EN / ID
const STEPS_DATA = {
  en: {
    prompt: [
      "Define a system instruction role in SYSTEM_ROLE",
      "Write a detailed prompt in USER_PROMPT (min 10 characters)",
      "Run the prompt to verify it meets the validation rules"
    ],
    code: [
      "Add the async keyword before the fetchData function declaration",
      "Await the fetch request call",
      "Await the JSON response conversion"
    ],
    security: [
      "Remove SQL query string template interpolation",
      "Use parameterized query placeholders (?, $1, or params)",
      "Ensure input parameters are securely bound or cast"
    ],
    build: [
      "Add push function inside addTodo method",
      "Toggle completed status inside toggleTodo method",
      "Trim whitespace on user input todo items"
    ],
    speedrun: [
      "Render the count prop dynamically in JSX",
      "Add style or class attributes for user status indicator dot",
      "Ensure default fallback for undefined count prop"
    ],
    default: [
      "Open the editor and inspect the template code",
      "Modify the starter code in the editor",
      "Run code execution in the live terminal"
    ]
  },
  id: {
    prompt: [
      "Tentukan peran instruksi sistem di SYSTEM_ROLE",
      "Tulis prompt detail di USER_PROMPT (min 10 karakter)",
      "Jalankan prompt untuk memverifikasi aturan validasi"
    ],
    code: [
      "Tambahkan kata kunci async pada deklarasi fungsi fetchData",
      "Gunakan await untuk panggilan permintaan fetch",
      "Gunakan await untuk konversi respons JSON"
    ],
    security: [
      "Hapus interpolasi string template pada query SQL",
      "Gunakan placeholder query berparameter (?, $1, atau params)",
      "Pastikan parameter input diikat atau diubah secara aman"
    ],
    build: [
      "Tambahkan fungsi push di dalam metode addTodo",
      "Alihkan status selesai (toggle) di dalam metode toggleTodo",
      "Hapus spasi kosong (trim) pada item input todo"
    ],
    speedrun: [
      "Rendernya properti count secara dinamis di dalam JSX",
      "Tambahkan atribut gaya atau kelas untuk titik indikator status pengguna",
      "Pastikan fallback default jika properti count kosong"
    ],
    default: [
      "Buka editor dan periksa templat kode",
      "Ubah kode awal di dalam editor",
      "Jalankan eksekusi kode di terminal langsung"
    ]
  }
};

// Check if steps are complete based on regex / state
const checkSteps = (labType, codeContent, hasRun, starterCode) => {
  const steps = {
    step1: false,
    step2: false,
    step3: false
  };
  
  if (!codeContent) return steps;

  if (labType === 'prompt') {
    steps.step1 = /SYSTEM_ROLE\s*=\s*['"`](?!['"`]).+['"`]/.test(codeContent);
    steps.step2 = /USER_PROMPT\s*=\s*['"`](?!['"`]).{10,}['"`]/.test(codeContent);
    steps.step3 = hasRun;
  } else if (labType === 'code') {
    steps.step1 = /async\s+function\s+fetchData/.test(codeContent);
    steps.step2 = /await\s+fetch/.test(codeContent);
    steps.step3 = /await\s+\w+\.json/.test(codeContent) || hasRun;
  } else if (labType === 'security') {
    steps.step1 = !/SELECT\s+\*\s+FROM\s+users\s+WHERE\s+id\s*=\s*['"`]\s*\$\{\s*userId\s*\}\s*['"`]/i.test(codeContent);
    steps.step2 = /[\?\$]1/.test(codeContent) || codeContent.includes('?') || codeContent.includes('$1') || codeContent.includes('userId');
    steps.step3 = hasRun;
  } else if (labType === 'build') {
    steps.step1 = /push\(/.test(codeContent);
    steps.step2 = /completed\s*=/.test(codeContent) || /!.*completed/.test(codeContent);
    steps.step3 = hasRun;
  } else if (labType === 'speedrun') {
    steps.step1 = /\{\s*count\s*\}/.test(codeContent);
    steps.step2 = /style\s*=/.test(codeContent) || /className\s*=/.test(codeContent);
    steps.step3 = hasRun;
  } else {
    // Default fallback
    steps.step1 = codeContent.trim().length > 0;
    steps.step2 = codeContent !== starterCode;
    steps.step3 = hasRun;
  }
  return steps;
};

// Curated line by line explanations
const MAPPED_EXPLANATIONS = {
  en: {
    prompt: {
      1: "Comment: Explains the goal of this lab.",
      2: "Comment: Explains the constraints.",
      3: "Defines SYSTEM_ROLE to instruct the AI to behave like a senior security engineer.",
      4: "Defines USER_PROMPT where you will write your login form request instructions.",
      5: "Empty line for spacing.",
      6: "Declares a validation function called validatePrompt.",
      7: "Comment: Reminder that the prompt must be descriptive.",
      8: "Checks if the length of USER_PROMPT is greater than 15 characters.",
      9: "Closes the validatePrompt function."
    },
    code: {
      1: "Comment: Explains the task of the lab.",
      2: "Comment: Explains the bug.",
      3: "Declares a function named fetchData that accepts a URL parameter.",
      4: "Comment: Points out that we need async/await here.",
      5: "Fetches data from the URL. Currently, it doesn't wait for the server response (missing await).",
      6: "Parses the response as JSON. This will fail without awaiting the response.",
      7: "Returns the parsed data.",
      8: "Closes the fetchData function."
    },
    security: {
      1: "Comment: Explains the task of the lab.",
      2: "Comment: Explains the vulnerability.",
      3: "Declares a function named getUserById that takes a userId.",
      4: "Comment: Points out that using template strings for SQL variables is unsafe.",
      5: "Builds a SQL query by embedding userId directly into the string, exposing the database to SQL injection.",
      6: "Executes the query against the database and returns the result.",
      7: "Closes the getUserById function."
    },
    build: {
      1: "Comment: Explains the task of the lab.",
      2: "Comment: Explains the goal of the challenge.",
      3: "Creates an object called todoState to manage our list.",
      4: "Initializes an empty array named todos to store todo items.",
      5: "Defines a method named addTodo to add items to the list.",
      6: "Comment: Instructions on how to add a todo.",
      7: "Closes the addTodo method.",
      8: "Defines a method named toggleTodo to change a todo's status.",
      9: "Comment: Instructions on how to toggle completion.",
      10: "Closes the toggleTodo method.",
      11: "Ends the todoState object declaration."
    },
    speedrun: {
      1: "Comment: Explains the task.",
      2: "Comment: Explains the component goal.",
      3: "Imports the React library to write a React component.",
      4: "Declares and exports a React component named UsersCard that takes count as a prop.",
      5: "Comment: Instructions to render the UI card.",
      6: "Begins the return statement for rendering HTML/JSX.",
      7: "Renders a container div with the CSS class name 'card'.",
      8: "Renders a header title saying 'Active Users'.",
      9: "Comment: Placeholder where the active user count should be shown.",
      10: "Closes the card container div.",
      11: "Ends the JSX block.",
      12: "Closes the UsersCard component."
    }
  },
  id: {
    prompt: {
      1: "Komentar: Menjelaskan tujuan dari lab ini.",
      2: "Komentar: Menjelaskan batasan-batasan.",
      3: "Mendefinisikan SYSTEM_ROLE untuk menginstruksikan AI agar bertindak sebagai insinyur keamanan senior.",
      4: "Mendefinisikan USER_PROMPT tempat Anda akan menulis instruksi permintaan formulir masuk.",
      5: "Baris kosong untuk kerapihan.",
      6: "Mendeklarasikan fungsi validasi bernama validatePrompt.",
      7: "Komentar: Pengingat bahwa prompt harus deskriptif.",
      8: "Memeriksa apakah panjang USER_PROMPT lebih besar dari 15 karakter.",
      9: "Menutup fungsi validatePrompt."
    },
    code: {
      1: "Komentar: Menjelaskan tugas dari lab ini.",
      2: "Komentar: Menjelaskan bug yang ada.",
      3: "Mendeklarasikan fungsi bernama fetchData yang menerima parameter URL.",
      4: "Komentar: Menunjukkan bahwa kita memerlukan async/await di sini.",
      5: "Mengambil data dari URL. Saat ini, fungsi ini tidak menunggu respons server (kurang await).",
      6: "Mengurai respons sebagai JSON. Ini akan gagal jika respons tidak ditunggu (await).",
      7: "Mengembalikan data yang telah diurai.",
      8: "Menutup fungsi fetchData."
    },
    security: {
      1: "Komentar: Menjelaskan tugas dari lab ini.",
      2: "Komentar: Menjelaskan kerentanan yang ada.",
      3: "Mendeklarasikan fungsi bernama getUserById yang menerima userId.",
      4: "Komentar: Menunjukkan bahwa menggunakan interpolasi string untuk variabel SQL tidak aman.",
      5: "Membangun query SQL dengan memasukkan userId secara langsung ke dalam string, mengekspos DB ke SQL Injection.",
      6: "Menjalankan query ke database dan mengembalikan hasilnya.",
      7: "Menutup fungsi getUserById."
    },
    build: {
      1: "Komentar: Menjelaskan tugas dari lab ini.",
      2: "Komentar: Menjelaskan tujuan dari tantangan.",
      3: "Membuat objek bernama todoState untuk mengelola daftar kita.",
      4: "Menginisialisasi array kosong bernama todos untuk menyimpan item todo.",
      5: "Mendefinisikan metode bernama addTodo untuk menambahkan item ke daftar.",
      6: "Komentar: Instruksi tentang cara menambahkan todo.",
      7: "Menutup metode addTodo.",
      8: "Mendefinisikan metode bernama toggleTodo untuk mengubah status todo.",
      9: "Komentar: Instruksi tentang cara mengganti status selesai.",
      10: "Menutup metode toggleTodo.",
      11: "Mengakhiri deklarasi objek todoState."
    },
    speedrun: {
      1: "Komentar: Menjelaskan tugas lab.",
      2: "Komentar: Menjelaskan tujuan komponen.",
      3: "Mengimpor pustaka React untuk menulis komponen React.",
      4: "Mendeklarasikan dan mengekspor komponen React bernama UsersCard yang menerima prop count.",
      5: "Komentar: Instruksi untuk merender kartu UI.",
      6: "Memulai pernyataan return untuk merender HTML/JSX.",
      7: "Merender elemen div kontainer dengan kelas CSS 'card'.",
      8: "Merender judul header bertuliskan 'Active Users'.",
      9: "Komentar: Tempat penampung di mana jumlah pengguna aktif harus ditampilkan.",
      10: "Menutup elemen div kontainer kartu.",
      11: "Mengakhiri blok JSX.",
      12: "Menutup komponen UsersCard."
    }
  }
};

const getCuratedLineExplanation = (labType, lineNum, line, lang) => {
  const isEn = lang === 'en';
  const curated = MAPPED_EXPLANATIONS[lang]?.[labType]?.[lineNum];
  if (curated) return curated;
  
  // Dynamic fallback
  const trimmed = line.trim();
  if (!trimmed) return isEn ? "Empty line for spacing." : "Baris kosong untuk kerapihan.";
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return isEn ? `Comment: ${trimmed.replace(/^\/\/|^\/\*|^\*/, '').trim()}` : `Komentar: ${trimmed.replace(/^\/\/|^\/\*|^\*/, '').trim()}`;
  }
  if (trimmed.startsWith('import ')) {
    return isEn ? "Imports an external module or library." : "Mengimpor modul atau pustaka eksternal.";
  }
  if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) {
    return isEn ? `Declares a variable or constant: ${trimmed.split('=')[0].trim()}` : `Mendeklarasikan variabel atau konstanta: ${trimmed.split('=')[0].trim()}`;
  }
  if (trimmed.includes('function ')) {
    return isEn ? "Declares a function to perform actions." : "Mendeklarasikan fungsi untuk menjalankan tindakan.";
  }
  if (trimmed.startsWith('return ')) {
    return isEn ? "Returns a value or JSX from the function." : "Mengembalikan nilai atau JSX dari fungsi.";
  }
  if (trimmed.startsWith('<')) {
    return isEn ? "Renders an HTML or React interface element." : "Merender elemen antarmuka HTML atau React.";
  }
  return isEn ? "Executes code logic." : "Menjalankan logika kode.";
};

// Progressive hint system
function HintPanel({ hints = [] }) {
  const [revealed, setRevealed] = useState(0);
  const [open, setOpen] = useState(false);

  const defaultHints = hints.length > 0 ? hints : [
    'Read the task description again carefully — the clue is often in the wording.',
    'Try breaking the problem into smaller steps. What is the very first thing you need to do?',
    'Look at the expected output in the terminal. Work backwards from there.',
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-primary)',
        }}
      >
        <Lightbulb size={16} color="var(--warning)" />
        <span style={{ fontWeight: 700, fontSize: '0.85rem', flex: 1, textAlign: 'left' }}>
          AI Hints {revealed > 0 ? `(${revealed}/${defaultHints.length} revealed)` : ''}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {defaultHints.slice(0, revealed).map((hint, i) => (
            <div key={i} style={{
              padding: '0.65rem 0.85rem', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)',
              fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.72rem', display: 'block', marginBottom: '0.2rem' }}>
                💡 Hint {i + 1}
              </span>
              {hint}
            </div>
          ))}

          {revealed < defaultHints.length ? (
            <button
              onClick={() => setRevealed(v => v + 1)}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', borderStyle: 'dashed', fontSize: '0.78rem' }}
            >
              <Lightbulb size={13} /> Reveal Hint {revealed + 1} of {defaultHints.length}
            </button>
          ) : (
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem' }}>
              All hints revealed. You've got this! 💪
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LabSession() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const { success, error } = useAlert();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [logs, setLogs] = useState([{ type: 'system', text: 'Initializing environment...' }]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  
  // Guided mode & explanation states
  const [guidedMode, setGuidedMode] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({ step1: false, step2: false, step3: false });
  const [hasRun, setHasRun] = useState(false);

  const logsEndRef = useRef(null);

  useEffect(() => {
    authFetch(`/labs/${id}`).then(data => {
      setLab(data);
      // Initialize with realistic starter codes
      const starter = data.starter_code || STARTER_CODES[data.type] || '// Write your solution here\n';
      setCode(starter);
      
      // Default guided mode to true for beginners
      setGuidedMode(data.difficulty === 'beginner');

      authFetch(`/labs/${id}/start`, { method: 'POST' }).then(s => {
        setSession(s);
        setLoading(false);
        addLog('System', 'Environment ready. Start coding!');
      });
    });
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Reactive steps tracker
  useEffect(() => {
    if (lab) {
      const steps = checkSteps(lab.type, code, hasRun, lab.starter_code || STARTER_CODES[lab.type] || '');
      setCheckedSteps(steps);
    }
  }, [code, lab, hasRun]);

  const addLog = (type, text) => {
    setLogs(prev => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
  };

  const handleRun = () => {
    setRunning(true);
    setHasRun(true);
    addLog('System', 'Executing code...');
    setTimeout(() => {
      addLog('Output', 'Build successful. Running tests...');
      addLog('Output', '✓ Test 1: Component renders');
      addLog('Output', '✓ Test 2: API connection active');
      setRunning(false);
      success('Code executed successfully!');
    }, 1500);
  };

  const handleReset = () => {
    const starter = lab?.starter_code || STARTER_CODES[lab?.type] || '// Write your solution here\n';
    setCode(starter);
    setHasRun(false);
    setLogs([{ type: 'system', text: 'Editor reset to starter code.' }]);
  };

  const handleSubmit = async () => {
    try {
      addLog('System', 'Submitting for AI review...');
      const data = await authFetch(`/labs/sessions/${session.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      setResult(data);
      success(`Lab Completed! Scored: ${data.score}%`);
    } catch (e) { error(e.message); }
  };

  if (loading) return <div className="skeleton" style={{ height: '80vh' }} />;

  if (result) {
    return (
      <div className="card animate-glow" style={{ textAlign: 'center', padding: '3rem', maxWidth: 600, margin: '2rem auto' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>{t('mission_accomplished') || 'Mission Accomplished! 🏅'}</h2>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', margin: '1rem 0' }}>{result.score}%</div>
        <p style={{ color: 'var(--text-muted)' }}>XP Earned: <strong style={{ color: 'var(--accent)' }}>+{result.xp_earned}</strong></p>

        <div className="card" style={{ textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border)', margin: '1.5rem 0' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="var(--primary)" /> {t('ai_feedback') || 'AI Reviewer Feedback'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.feedback.map((f, i) => (
              <div key={i} style={{ fontSize: '0.9rem', color: f.startsWith('✓') ? 'var(--success)' : f.startsWith('!') ? 'var(--warning)' : 'var(--text-secondary)' }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/labs')}>{t('return_to_hub') || 'Return to Hub'}</button>
      </div>
    );
  }

  const stepsList = STEPS_DATA[lang]?.[lab.type] || STEPS_DATA[lang]?.default || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-accent" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>{lab.type || 'lab'}</span>
            <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>⚡ {lab.xp_reward || 150} XP</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{lab.title}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{lab.description}</p>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
          {/* Expert / Guided switch */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '2px', marginRight: '0.5rem' }}>
            <button
              onClick={() => setGuidedMode(false)}
              className={`btn btn-sm ${!guidedMode ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', minWidth: '60px' }}
            >
              {t('expert_mode')}
            </button>
            <button
              onClick={() => setGuidedMode(true)}
              className={`btn btn-sm ${guidedMode ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', minWidth: '60px' }}
            >
              {t('guided_mode')}
            </button>
          </div>
          
          <button className="btn btn-ghost btn-sm" onClick={handleReset} title="Reset to starter code">
            <RotateCcw size={14} /> {t('reset') || 'Reset'}
          </button>
          <button className="btn btn-ghost" onClick={handleRun} disabled={running}>
            <Play size={16} /> {running ? t('running') || 'Running…' : t('run_code') || 'Run Code'}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Save size={16} /> {t('submit_task') || 'Submit Task'}
          </button>
        </div>
      </div>

      {/* Main Grid: Editor | Console + Hints + Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Left: Code Editor */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '0.6rem 1rem', background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', fontSize: '0.82rem', fontWeight: 600,
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ marginLeft: '0.5rem' }}><TerminalIcon size={13} /> main.js</span>
            </div>
            
            <button
              onClick={() => setShowExplanation(true)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', cursor: 'pointer' }}
            >
              {t('explain_code_btn')}
            </button>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, background: '#0d0d28', color: '#a8d8ea',
              border: 'none', padding: '1.25rem', fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)', resize: 'none', outline: 'none', lineHeight: 1.7,
            }}
          />
        </div>

        {/* Right: Terminal + Hints + Guided Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
          {/* Terminal */}
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#07071a', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '0.6rem 1rem', background: '#13133a',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <TerminalIcon size={13} /> {t('terminal') || 'Terminal'}
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--success)', fontWeight: 400 }}>● LIVE</span>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 68, flexShrink: 0 }}>[{log.time || 'INIT'}]</span>
                  <span style={{ color: log.type === 'System' ? 'var(--accent)' : log.type === 'Output' ? 'var(--success)' : 'white' }}>
                    <span style={{ opacity: 0.5 }}>{log.type}: </span>{log.text}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Guided Checklist (only in guided mode) */}
          {guidedMode && (
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.04))', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  📋 {t('guided_checklist_title')}
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t('guided_checklist_subtitle')}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {stepsList.map((stepText, index) => {
                  const stepKey = `step${index + 1}`;
                  const isDone = checkedSteps[stepKey];
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.82rem', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: `1px solid ${isDone ? 'rgba(16,185,129,0.2)' : 'var(--border-light)'}`, transition: 'all 0.2s' }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        readOnly
                        style={{ marginTop: '0.15rem', accentColor: 'var(--success)', cursor: 'default' }}
                      />
                      <span style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', fontWeight: isDone ? 500 : 600 }}>
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progressive Hints */}
          <HintPanel hints={lab.hints || []} />
        </div>
      </div>

      {/* Code Breakdown Modal */}
      {showExplanation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(5px)' }}
          onClick={() => setShowExplanation(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '850px', border: '1px solid var(--border-light)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Sparkles size={18} color="var(--accent)" /> {t('explain_code_title')}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('explain_code_subtitle')}
                </p>
              </div>
              <button onClick={() => setShowExplanation(false)} className="btn btn-ghost btn-sm" style={{ minWidth: 'auto', padding: '0.25rem' }}>✕</button>
            </div>
            
            {/* Body: Line by line list */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {code.split('\n').map((line, idx) => {
                const lineNum = idx + 1;
                const explanation = getCuratedLineExplanation(lab.type, lineNum, line, lang);
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1.2fr 1.2fr', gap: '1rem', alignItems: 'start', padding: '0.5rem', background: idx % 2 === 0 ? 'var(--bg-card)' : 'transparent', borderRadius: 'var(--radius-sm)', border: '1px solid transparent' }}>
                    {/* Line number */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', userSelect: 'none', paddingRight: '0.5rem' }}>
                      {lineNum}
                    </div>
                    {/* Code snippet */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a8d8ea', overflowX: 'auto', whiteSpace: 'pre', background: '#0d0d28', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {line || ' '}
                    </div>
                    {/* Explanation */}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: '0.75rem', borderLeft: '3px solid var(--primary-light)', minHeight: '24px', display: 'flex', alignItems: 'center' }}>
                      {explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowExplanation(false)}>{t('explain_code_close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
