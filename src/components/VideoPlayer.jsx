import { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';

export default function VideoPlayer({ src, poster, checkpoints = [] }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCheck, setShowCheck] = useState(null);
  const [answered, setAnswered] = useState({});
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(p);

    // Check for checkpoints
    const currentTime = videoRef.current.currentTime;
    const activeCheck = checkpoints.find(c => 
      Math.abs(c.time - currentTime) < 0.5 && !answered[c.id]
    );

    if (activeCheck && !showCheck) {
      videoRef.current.pause();
      setPlaying(false);
      setShowCheck(activeCheck);
    }
  };

  const handleAnswer = (correct) => {
    setAnswered(prev => ({ ...prev, [showCheck.id]: true }));
    if (correct) {
      setShowCheck(null);
      videoRef.current.play();
      setPlaying(true);
    } else {
      alert("Try again! Watch the previous section carefully.");
      videoRef.current.currentTime -= 10;
      setShowCheck(null);
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="video-container">
      {/* Fake Video Element for simulation */}
      <div 
        onClick={togglePlay}
        style={{ 
          width: '100%', height: '100%', background: `url(${poster}) center/cover`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}
      >
        {!playing && !showCheck && <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '50%', boxShadow: 'var(--shadow-glow)' }}><Play size={48} color="white" fill="white" /></div>}
        <video 
          ref={videoRef} src={src} style={{ display: 'none' }} 
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* Overlay Question */}
      {showCheck && (
        <div className="video-overlay">
          <HelpCircle size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Knowledge Check</h3>
          <p style={{ margin: '1rem 0 2rem' }}>{showCheck.question}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {showCheck.options.map((opt, i) => (
              <button 
                key={i} className="btn btn-ghost" 
                onClick={() => handleAnswer(opt.correct)}
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0, 
        padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 5
      }}>
        <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, position: 'relative' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
          {checkpoints.map(c => (
            <div 
              key={c.id} 
              style={{ 
                position: 'absolute', left: `${(c.time / 100) * 100}%`, top: -2, 
                width: 8, height: 8, borderRadius: '50%', background: answered[c.id] ? 'var(--success)' : 'var(--warning)',
                border: '2px solid black'
              }} 
            />
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'white', fontFamily: 'var(--font-mono)' }}>10:00</span>
      </div>
    </div>
  );
}
