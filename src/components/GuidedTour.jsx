import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Compass, HelpCircle } from 'lucide-react';

// ─── Tour definitions per route ───────────────────────────────────────────────
const TOURS = {
  '/': {
    id: 'dashboard',
    title: 'Dashboard Tour',
    steps: [
      { icon: '👋', title: 'Welcome to your Dashboard!', body: 'This is your home base. You can see your progress, recent activity, and quick links to everything on Promptara.' },
      { icon: '📚', title: 'Sidebar Navigation', body: 'Use the left sidebar to navigate between Courses, Labs, Leaderboard, and your Profile. Admins also see management panels.' },
      { icon: '⚡', title: 'Your XP Counter', body: 'Your XP (Experience Points) live in the top bar. Every lesson or lab you complete earns you XP and helps you level up!' },
      { icon: '🔔', title: 'Notifications Bell', body: 'Click the bell icon in the top bar to see your recent lesson completions and activity.' },
      { icon: '🚀', title: "You're all set!", body: 'Head to the Courses page and enroll in your first course to start earning XP. Good luck!' },
    ],
  },
  '/courses': {
    id: 'courses',
    title: 'Courses Tour',
    steps: [
      { icon: '🗂️', title: 'Browse Courses', body: 'Each card here is a full learning course. You can see the difficulty level, category, and total XP you can earn.' },
      { icon: '🔍', title: 'Filter & Search', body: 'Use the search bar or category filters at the top to find courses that match your interests and skill level.' },
      { icon: '🎯', title: 'Enroll in a Course', body: 'Click any course card to view the full details and click "Enroll Now — Free" to begin. You only need to enroll once per course.' },
      { icon: '📊', title: 'Track Your Progress', body: 'Enrolled courses show a progress bar so you can see how far along you are at a glance.' },
    ],
  },
  '/labs': {
    id: 'labs',
    title: 'Labs Tour',
    steps: [
      { icon: '🧪', title: 'Welcome to the Labs Hub!', body: 'Labs are hands-on coding challenges. You\'ll write real code, run it, and get AI feedback on your solution.' },
      { icon: '🏷️', title: 'Difficulty Levels', body: 'Labs are tagged Beginner, Intermediate, or Advanced. Start with Beginner labs to build confidence before tackling harder ones.' },
      { icon: '⭐', title: 'XP Rewards', body: 'Labs reward more XP than lessons — finishing a lab earns you 150 XP or more! Look for the XP badge on each lab card.' },
      { icon: '▶️', title: 'Start a Lab', body: 'Click any lab card to enter the Lab Session. You\'ll see a code editor and a terminal to run your code in real time.' },
    ],
  },
};

// Match dynamic routes like /lessons/:id and /labs/:id
function getTour(pathname) {
  if (TOURS[pathname]) return TOURS[pathname];
  if (pathname.startsWith('/lessons/')) return {
    id: 'lesson',
    title: 'Lesson Tour',
    steps: [
      { icon: '🎯', title: 'Lesson Overview', body: 'At the top of each lesson you\'ll see how long it takes, the format (Video/Reading/Quiz), and how much XP you\'ll earn.' },
      { icon: '📺', title: 'Video & Reading Content', body: 'Watch the video and read through the lesson content below it. Take your time — there\'s no timer!' },
      { icon: '✅', title: 'Complete the Lesson', body: 'Click "Complete Lesson" at the bottom when you\'re done. This saves your progress and awards your XP.' },
      { icon: '➡️', title: 'Navigate Between Lessons', body: 'Use the "Next →" button to go to the next lesson and mark this one complete at the same time.' },
      { icon: '😊', title: 'Rate the Lesson', body: 'After completing a lesson, a quick 1-click emoji rating appears. Your feedback helps us improve the content!' },
    ],
  };
  if (pathname.startsWith('/labs/')) return {
    id: 'lab_session',
    title: 'Lab Session Tour',
    steps: [
      { icon: '📋', title: 'Your Lab Mission', body: 'Read the lab title and description carefully at the top. It explains exactly what you need to build or fix.' },
      { icon: '⌨️', title: 'Code Editor (Left Panel)', body: 'Write your JavaScript solution in the editor on the left. It works just like a real code editor.' },
      { icon: '▶️', title: 'Run Your Code', body: 'Click "Run Code" to execute your code. Watch the Terminal panel on the right for output, errors, and test results.' },
      { icon: '🖥️', title: 'Terminal Output', body: 'The terminal shows real-time logs. Green = passing tests. Yellow = warnings. Read every line to debug issues.' },
      { icon: '💡', title: 'AI Hint System', body: 'Stuck? Click "Ask for Hint" in the AI Assistant panel. Hints are revealed one at a time so you still learn by doing.' },
      { icon: '📤', title: 'Submit Your Solution', body: 'When your code passes all tests, click "Submit Task". The AI will review your code and give detailed feedback.' },
    ],
  };
  return null;
}

export default function GuidedTour() {
  const location = useLocation();
  const tour = getTour(location.pathname);

  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Reset step when route changes; auto-open if first visit to this tour
  useEffect(() => {
    if (!tour) return;
    setStep(0);
    setDismissed(false);
    const autoOpened = localStorage.getItem(`vl_tour_seen_${tour.id}`);
    setExpanded(!autoOpened); // auto-open on first visit
  }, [location.pathname]);

  if (!tour || dismissed) return null;

  const current = tour.steps[step];
  const isLast = step === tour.steps.length - 1;

  const handleClose = () => {
    setExpanded(false);
    localStorage.setItem(`vl_tour_seen_${tour.id}`, '1');
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`vl_tour_seen_${tour.id}`, '1');
  };

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem',
    }}>
      {/* Expanded Panel */}
      {expanded && (
        <div style={{
          width: 300, background: 'var(--bg-surface)',
          border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 40px rgba(124,58,237,0.25)',
          animation: 'fadeInUp 0.25s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={15} color="white" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{tour.title}</span>
            </div>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>
              <X size={15} />
            </button>
          </div>

          {/* Step Progress dots */}
          <div style={{ display: 'flex', gap: '4px', padding: '0.6rem 1rem 0', justifyContent: 'center' }}>
            {tour.steps.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                height: 4, width: i === step ? 20 : 8, borderRadius: 2, cursor: 'pointer', transition: 'all 0.25s',
                background: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--border-light)',
              }} />
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>{current.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', textAlign: 'center' }}>{current.title}</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center', margin: 0 }}>{current.body}</p>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleDismiss} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Don't show again
            </button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                  <ChevronLeft size={14} />
                </button>
              )}
              <button
                onClick={isLast ? handleClose : () => setStep(s => s + 1)}
                className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
              >
                {isLast ? '✓ Done' : <>Next <ChevronRight size={13} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setExpanded(v => !v)}
        title="Open Guided Tour"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: expanded ? 'var(--primary)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          transition: 'all 0.2s', transform: expanded ? 'rotate(45deg)' : 'rotate(0)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = expanded ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = expanded ? 'rotate(45deg)' : 'scale(1)'}
      >
        {expanded ? <X size={20} color="white" /> : <Compass size={20} color="white" />}
      </button>
    </div>
  );
}
