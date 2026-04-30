import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Info } from 'lucide-react';

export default function CaseStudyLesson({ study }) {
  const [currentNode, setCurrentNode] = useState(study.startNode);
  const [history, setHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const node = study.nodes[currentNode];

  const handleChoice = (choice) => {
    setHistory([...history, { node: currentNode, choice }]);
    if (choice.nextNode) {
      setCurrentNode(choice.nextNode);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="card animate-glow" style={{ textAlign: 'center', padding: '3rem' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>Case Study Complete!</h2>
        <p className="mt-2 mb-6">You've successfully navigated the scenario. Here's your performance analysis:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400, margin: '0 auto' }}>
          {history.map((h, i) => (
            <div key={i} className="badge badge-primary" style={{ padding: '0.75rem', justifyContent: 'flex-start' }}>
              <ChevronRight size={14} /> {h.choice.text}
            </div>
          ))}
        </div>
        <button className="btn btn-primary mt-6" onClick={() => window.location.reload()}>Review Scenario</button>
      </div>
    );
  }

  return (
    <div className="flex-col gap-3">
      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Info color="var(--accent)" />
          <h3 style={{ fontSize: '1.25rem' }}>Scenario: {node.title}</h3>
        </div>
        <div className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          {node.description}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {node.choices.map((choice, i) => (
          <button 
            key={i} className="card btn-ghost" 
            onClick={() => handleChoice(choice)}
            style={{ 
              textAlign: 'left', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid var(--border-light)'
            }}
          >
            <span style={{ fontWeight: 600 }}>{choice.text}</span>
            <ArrowRight size={18} color="var(--primary)" />
          </button>
        ))}
      </div>

      {node.hint && (
        <div className="badge badge-warning" style={{ alignSelf: 'center', padding: '0.5rem 1rem' }}>
          <AlertCircle size={14} /> TIP: {node.hint}
        </div>
      )}
    </div>
  );
}
