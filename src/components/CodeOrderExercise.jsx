import { useState, useRef } from 'react';
import { CheckCircle, Shuffle, RotateCcw, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Fisher-Yates shuffle (deterministic with seed)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CodeLine({ line, index, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
        background: isDragOver ? 'rgba(124,58,237,0.12)' : isDragging ? 'rgba(124,58,237,0.05)' : 'var(--bg-surface)',
        border: `1px solid ${isDragOver ? 'var(--primary)' : isDragging ? 'rgba(124,58,237,0.3)' : 'var(--border-light)'}`,
        cursor: 'grab', transition: 'all 0.15s',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
        userSelect: 'none',
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0, opacity: 0.35 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 14, height: 2, background: 'var(--text-muted)', borderRadius: 1 }} />)}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#a8d8ea', flex: 1 }}>
        {line.content}
      </span>
    </div>
  );
}

export default function CodeOrderExercise({ lines: rawLines, onComplete }) {
  const { lang } = useLanguage();
  const [lines, setLines] = useState(() => shuffle(rawLines.map((content, i) => ({ content, id: i }))));
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const labels = {
    title:    lang === 'id' ? 'Susun Kode yang Benar' : 'Arrange the Code',
    subtitle: lang === 'id' ? 'Seret baris kode ke urutan yang benar' : 'Drag the lines into the correct order',
    check:    lang === 'id' ? 'Periksa Jawaban' : 'Check Answer',
    reset:    lang === 'id' ? 'Ulangi' : 'Reset',
    correct:  lang === 'id' ? '✅ Benar! Urutan kode sudah tepat.' : '✅ Correct! You got the right order.',
    wrong:    lang === 'id' ? '❌ Belum tepat. Coba lagi!' : '❌ Not quite right. Try again!',
    hint:     lang === 'id' ? '💡 Petunjuk: perhatikan logika alur dari atas ke bawah.' : '💡 Hint: think about the top-to-bottom execution flow.',
  };

  const handleDragStart = (e, index) => {
    setDraggingIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === dropIndex) return;
    const updated = [...lines];
    const [moved] = updated.splice(draggingIdx, 1);
    updated.splice(dropIndex, 0, moved);
    setLines(updated);
    setDraggingIdx(null);
    setOverIdx(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const handleDragEnd = () => { setDraggingIdx(null); setOverIdx(null); };

  const handleCheck = () => {
    const correct = lines.every((line, i) => line.id === i);
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct && onComplete) onComplete();
  };

  const handleReset = () => {
    setLines(shuffle(rawLines.map((content, i) => ({ content, id: i }))));
    setSubmitted(false);
    setIsCorrect(null);
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shuffle size={15} color="var(--primary)" /> {labels.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{labels.subtitle}</div>
        </div>
        <button onClick={handleReset} className="btn btn-ghost btn-sm" style={{ gap: '0.3rem' }}>
          <RotateCcw size={13} /> {labels.reset}
        </button>
      </div>

      {/* Code lines */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#07071a' }}>
        {lines.map((line, i) => (
          <CodeLine
            key={line.id}
            line={line}
            index={i}
            isDragging={draggingIdx === i}
            isDragOver={overIdx === i && draggingIdx !== i}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Feedback + Action */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {submitted && (
          <div style={{
            padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem',
            background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
            color: isCorrect ? 'var(--success)' : 'var(--danger)',
          }}>
            {isCorrect ? labels.correct : labels.wrong}
            {!isCorrect && <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{labels.hint}</div>}
          </div>
        )}
        {!isCorrect && (
          <button onClick={handleCheck} className="btn btn-primary" style={{ width: '100%' }}>
            {submitted ? <><RotateCcw size={15} /> {labels.reset}</> : <><CheckCircle size={15} /> {labels.check}</>}
          </button>
        )}
        {isCorrect && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.88rem' }}>
            <Trophy size={18} /> {lang === 'id' ? 'Tantangan selesai!' : 'Challenge complete!'}
          </div>
        )}
      </div>
    </div>
  );
}
