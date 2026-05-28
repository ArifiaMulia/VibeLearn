import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { 
  Trophy, Download, Search, Users, Award, Eye, 
  Upload, Trash2, Plus, RefreshCw, Type, Image as ImageIcon, 
  Sparkles, Check, ChevronRight, Settings, AlignCenter, 
  AlignLeft, AlignRight, Bold, Italic 
} from 'lucide-react';

// ── Default Base Element Configuration ──────────────────────────────────────────
const DEFAULT_ELEMENTS = [
  { id: 'academy_name', type: 'text', label: 'Academy Name', text: '✦ PROMPTARA · AI CODING ACADEMY ✦', top: 15, left: 50, fontSize: 10, fontFamily: 'sans-serif', color: '#d4af37', fontWeight: '800', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'cert_title', type: 'text', label: 'Certificate Title', text: 'CERTIFICATE OF COMPLETION', top: 22, left: 50, fontSize: 24, fontFamily: 'Georgia', color: '#d4af37', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'present_text', type: 'text', label: 'Presentation Subtitle', text: 'This is proudly presented to', top: 34, left: 50, fontSize: 11, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'normal', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'recipient_name', type: 'text', label: 'Recipient Name', text: 'Student Name', top: 44, left: 50, fontSize: 32, fontFamily: 'Georgia', color: '#ffffff', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'completion_text', type: 'text', label: 'Completion Wording', text: 'for successfully completing all lessons and assessments in', top: 54, left: 50, fontSize: 11, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'normal', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'course_name', type: 'text', label: 'Course Name', text: 'Course Title', top: 62, left: 50, fontSize: 18, fontFamily: 'sans-serif', color: '#7dd3fc', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'badge_text', type: 'text', label: 'Certified Badge Text', text: 'Certified Digital Builder · Vibe Coding Graduate', top: 72, left: 50, fontSize: 10, fontFamily: 'sans-serif', color: '#d4af37', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },
  
  { id: 'date_label', type: 'text', label: 'Date Label', text: 'Date of Completion', top: 80, left: 20, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'date_val', type: 'text', label: 'Date Value', text: 'May 28, 2026', top: 84, left: 20, fontSize: 11, fontFamily: 'sans-serif', color: '#e2e8f0', fontWeight: '600', fontStyle: 'normal', align: 'center', visible: true },
  
  { id: 'cred_label', type: 'text', label: 'Credential Label', text: 'Credential ID', top: 80, left: 80, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },
  { id: 'cred_val', type: 'text', label: 'Credential Value', text: 'VL-000-0000-00000', top: 84, left: 80, fontSize: 10, fontFamily: 'monospace', color: '#d4af37', fontWeight: 'bold', fontStyle: 'normal', align: 'center', visible: true },

  { id: 'sig1_name', type: 'text', label: 'Signatory 1 Name', text: 'Arifia Mulia', top: 90, left: 40, fontSize: 13, fontFamily: 'Georgia', color: '#d4af37', fontWeight: 'normal', fontStyle: 'italic', align: 'center', visible: true },
  { id: 'sig1_role', type: 'text', label: 'Signatory 1 Role', text: 'Academy Director', top: 94, left: 40, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', fontStyle: 'normal', align: 'center', visible: true },
  
  { id: 'sig2_name', type: 'text', label: 'Signatory 2 Name', text: 'Prasetia Dwidharma', top: 90, left: 60, fontSize: 13, fontFamily: 'Georgia', color: '#d4af37', fontWeight: 'normal', fontStyle: 'italic', align: 'center', visible: true },
  { id: 'sig2_role', type: 'text', label: 'Signatory 2 Role', text: 'Lead Instructor', top: 94, left: 60, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', fontStyle: 'normal', align: 'center', visible: true },

  // Draggable image containers
  { id: 'logo', type: 'image', label: 'Academy Logo', src: '/logo.png', top: 6, left: 50, width: 45, height: 45, visible: true },
  { id: 'sig1_img', type: 'image', label: 'Signatory 1 Signature', src: '', top: 83, left: 40, width: 80, height: 35, visible: false },
  { id: 'sig2_img', type: 'image', label: 'Signatory 2 Signature', src: '', top: 83, left: 60, width: 80, height: 35, visible: false },
];

const PRESETS = {
  aurora: {
    name: 'Aurora Glow (Dark)',
    background: 'linear-gradient(145deg, #07071a 0%, #0d0d2b 40%, #0a1628 70%, #070718 100%)',
    border: '2px solid rgba(212,175,55,0.35)',
    innerBorder: '1px dashed rgba(212,175,55,0.15)',
    textColor: '#ffffff',
    accentColor: '#d4af37',
    subColor: '#a0aec0',
    fontSerif: 'Georgia',
    fontSans: 'sans-serif',
    glow: '0 0 30px rgba(212,175,55,0.15)',
  },
  navy: {
    name: 'Royal Navy & Classic Gold',
    background: 'linear-gradient(135deg, #060b19 0%, #111a36 100%)',
    border: '6px double #d4af37',
    innerBorder: '1px solid rgba(212,175,55,0.2)',
    textColor: '#f7fafc',
    accentColor: '#d4af37',
    subColor: '#cbd5e0',
    fontSerif: 'Georgia',
    fontSans: 'Georgia',
    glow: 'none',
  },
  cyber: {
    name: 'Cyberpunk Tech (Monospace)',
    background: '#0a0b10',
    border: '2px solid #00ffcc',
    innerBorder: '1px solid rgba(57,255,20,0.2)',
    textColor: '#39ff14',
    accentColor: '#00ffcc',
    subColor: '#8892b0',
    fontSerif: 'monospace',
    fontSans: 'monospace',
    glow: '0 0 15px rgba(0,255,204,0.25)',
  },
  minimalist: {
    name: 'Modern Minimalist (Light)',
    background: '#fdfcf7',
    border: '1px solid #dcdad5',
    innerBorder: 'none',
    textColor: '#1a1a1a',
    accentColor: '#2b2b2b',
    subColor: '#718096',
    fontSerif: 'Georgia',
    fontSans: 'sans-serif',
    glow: 'none',
  }
};

export default function CertificateBuilderPage() {
  const { authFetch } = useAuth();
  const { success, error } = useAlert();
  const canvasRef = useRef(null);

  // States
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Builder States
  const [template, setTemplate] = useState('aurora');
  const [customBg, setCustomBg] = useState(null); // base64/dataURL for custom uploaded templates
  const [customBgName, setCustomBgName] = useState('');
  const [activeTab, setActiveTab] = useState('presets'); // presets | elements | assets
  
  const [elements, setElements] = useState(() => {
    const saved = localStorage.getItem('vb_cert_elements');
    return saved ? JSON.parse(saved) : DEFAULT_ELEMENTS;
  });

  const [selectedElementId, setSelectedElementId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [docLoading, setDocLoading] = useState(false);

  // Script libraries loaded verification
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Inject CDN Scripts for PDF/DOCX Parsing & Client rendering
  useEffect(() => {
    const injectScript = (id, src) => {
      if (document.getElementById(id)) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      injectScript('pdfjs-lib', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js'),
      injectScript('docx-preview-lib', 'https://unpkg.com/docx-preview@0.1.15/dist/docx-preview.js'),
      injectScript('html2canvas-lib', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
    ]).then(() => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }
      setScriptsLoaded(true);
    }).catch(err => {
      console.error("CDN dependencies failed to load", err);
    });
  }, []);

  // Save changes to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('vb_cert_elements', JSON.stringify(elements));
  }, [elements]);

  // Load initial courses and users
  useEffect(() => {
    Promise.all([
      authFetch('/courses').catch(() => []),
      authFetch('/users').catch(() => []),
    ]).then(([c, u]) => {
      const allCourses = Array.isArray(c) ? c : c.courses || [];
      const allUsers = Array.isArray(u) ? u : u.users || [];
      setCourses(allCourses);
      setUsers(allUsers);
      
      // Auto select first items if available
      if (allCourses.length > 0) setSelectedCourse(allCourses[0]);
      if (allUsers.length > 0) setSelectedUser(allUsers[0]);
    }).catch(err => error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Update dynamic elements in real-time when user or course selections change
  useEffect(() => {
    if (!selectedUser && !selectedCourse) return;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    setElements(prev => prev.map(el => {
      if (el.id === 'recipient_name' && selectedUser) {
        return { ...el, text: selectedUser.name };
      }
      if (el.id === 'course_name' && selectedCourse) {
        return { ...el, text: selectedCourse.title };
      }
      if (el.id === 'date_val') {
        return { ...el, text: dateStr };
      }
      if (el.id === 'cred_val' && selectedUser && selectedCourse) {
        const makeCertId = (cId, uId) =>
          `VL-${String(cId).padStart(3, '0')}-${String(uId).padStart(4, '0')}-${Math.abs((cId * 183 + uId * 761) % 100000).toString().padStart(5, '0')}`;
        return { ...el, text: makeCertId(selectedCourse.id, selectedUser.id) };
      }
      return el;
    }));
  }, [selectedUser, selectedCourse]);

  // Handle preset theme changes
  const applyPresetTheme = (themeKey) => {
    setTemplate(themeKey);
    setCustomBg(null);
    setCustomBgName('');
    const preset = PRESETS[themeKey];

    setElements(prev => prev.map(el => {
      if (el.isCustom) {
        return { 
          ...el, 
          color: preset.textColor,
          fontFamily: preset.fontSans 
        };
      }

      // Default positioning and design configuration per theme
      let styles = {};
      switch (themeKey) {
        case 'navy':
          styles = {
            color: el.id.includes('title') || el.id.includes('name') || el.id.includes('val') ? preset.accentColor : preset.textColor,
            fontFamily: preset.fontSerif,
          };
          break;
        case 'cyber':
          styles = {
            color: el.id === 'recipient_name' ? preset.accentColor : (el.id.includes('val') ? '#ffffff' : preset.textColor),
            fontFamily: preset.fontSans,
          };
          break;
        case 'minimalist':
          styles = {
            color: el.id.includes('title') || el.id.includes('name') ? preset.accentColor : preset.subColor,
            fontFamily: el.id.includes('name') || el.id.includes('title') ? preset.fontSerif : preset.fontSans,
          };
          break;
        default: // aurora
          styles = {
            color: el.id === 'recipient_name' ? '#ffffff' : (el.id.includes('title') || el.id.includes('name') || el.id.includes('val') ? preset.accentColor : preset.subColor),
            fontFamily: el.id.includes('name') || el.id.includes('title') ? preset.fontSerif : preset.fontSans,
          };
      }
      return { ...el, ...styles };
    }));
    success(`Applied ${preset.name} theme preset!`);
  };

  // Drag and Drop implementation
  const handleDragStart = (e, id) => {
    e.preventDefault();
    setSelectedElementId(id);
    setDraggingId(id);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementDom = e.currentTarget;
    const elementRect = elementDom.getBoundingClientRect();

    // Mathematically offset drag pointer to prevent snapping/shifting
    const clickX = e.clientX - elementRect.left;
    const clickY = e.clientY - elementRect.top;

    const currentEl = elements.find(el => el.id === id);
    const align = currentEl?.align || 'center';

    let offsetX = clickX;
    let offsetY = clickY;

    if (align === 'center') {
      offsetX = clickX - elementRect.width / 2;
      offsetY = clickY - elementRect.height / 2;
    } else if (align === 'right') {
      offsetX = clickX - elementRect.width;
    }

    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragMove = (e) => {
    if (!draggingId) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const xPx = e.clientX - canvasRect.left - dragOffset.x;
    const yPx = e.clientY - canvasRect.top - dragOffset.y;

    const leftPct = Math.max(0, Math.min(100, (xPx / canvasRect.width) * 100));
    const topPct = Math.max(0, Math.min(100, (yPx / canvasRect.height) * 100));

    setElements(prev => prev.map(el => {
      if (el.id === draggingId) {
        return { ...el, left: parseFloat(leftPct.toFixed(2)), top: parseFloat(topPct.toFixed(2)) };
      }
      return el;
    }));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  // Custom asset/logo/signature uploads
  const handleAssetUpload = (e, elementId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setElements(prev => prev.map(el => {
        if (el.id === elementId) {
          return { ...el, src: event.target.result, visible: true };
        }
        return el;
      }));
      success(`Uploaded image for ${elementId === 'logo' ? 'Logo' : 'Signature'}!`);
    };
    reader.readAsDataURL(file);
  };

  // Custom template background uploads (Image, PDF, DOCX)
  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocLoading(true);
    setCustomBgName(file.name);

    const fileType = file.name.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'webp'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBg(event.target.result);
        setTemplate('custom');
        setDocLoading(false);
        success('Custom image background loaded successfully!');
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'pdf') {
      if (!window.pdfjsLib) {
        error("PDF engine not loaded yet. Please wait a moment and try again.");
        setDocLoading(false);
        return;
      }
      try {
        const fileReader = new FileReader();
        fileReader.onload = function() {
          const typedarray = new Uint8Array(this.result);
          window.pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            pdf.getPage(1).then(page => {
              const viewport = page.getViewport({ scale: 2.0 }); // High-DPI render
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                setCustomBg(canvas.toDataURL('image/png'));
                setTemplate('custom');
                setDocLoading(false);
                success('PDF template converted & loaded successfully!');
              });
            });
          }).catch(err => {
            console.error(err);
            error("Failed to parse PDF document");
            setDocLoading(false);
          });
        };
        fileReader.readAsArrayBuffer(file);
      } catch (err) {
        error("Error processing PDF template");
        setDocLoading(false);
      }
    } else if (fileType === 'docx') {
      if (!window.docx || !window.html2canvas) {
        error("Document rendering engines not fully loaded yet. Please wait.");
        setDocLoading(false);
        return;
      }
      try {
        const fileReader = new FileReader();
        fileReader.onload = async function(event) {
          const arrayBuffer = event.target.result;
          
          // Render DOCX inside a temporary offscreen sandbox container
          const sandbox = document.createElement('div');
          sandbox.style.position = 'fixed';
          sandbox.style.left = '-9999px';
          sandbox.style.top = '-9999px';
          sandbox.style.width = '1000px'; // clean landscape scale width
          sandbox.style.padding = '40px';
          sandbox.style.background = '#ffffff';
          document.body.appendChild(sandbox);

          try {
            await window.docx.renderAsync(arrayBuffer, sandbox);
            
            // Wait slightly for fonts and styles to draw
            setTimeout(async () => {
              const canvas = await window.html2canvas(sandbox, {
                useCORS: true,
                scale: 1.5,
                logging: false,
                backgroundColor: '#ffffff'
              });
              setCustomBg(canvas.toDataURL('image/png'));
              setTemplate('custom');
              document.body.removeChild(sandbox);
              setDocLoading(false);
              success('DOCX template preview rendered & loaded successfully!');
            }, 600);
          } catch (docxErr) {
            console.error(docxErr);
            error("Failed to render DOCX. Standard formats PNG/JPG are recommended.");
            if (sandbox.parentNode) document.body.removeChild(sandbox);
            setDocLoading(false);
          }
        };
        fileReader.readAsArrayBuffer(file);
      } catch (err) {
        error("Error processing DOCX template");
        setDocLoading(false);
      }
    } else {
      error("Unsupported file format. Please upload JPG, PNG, PDF, or DOCX");
      setDocLoading(false);
    }
  };

  // Add a new custom label element
  const handleAddCustomText = () => {
    const id = `custom_text_${Date.now()}`;
    const newEl = {
      id,
      type: 'text',
      label: `Custom Label (${elements.filter(e => e.id.includes('custom_text')).length + 1})`,
      text: 'New Label Style',
      top: 50,
      left: 50,
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: template === 'minimalist' ? '#1a1a1a' : '#d4af37',
      fontWeight: 'normal',
      fontStyle: 'normal',
      align: 'center',
      visible: true,
      isCustom: true
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(id);
    success('Added custom text label! Drag it on the canvas.');
  };

  // Delete element
  const handleDeleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    success('Element deleted.');
  };

  // Update specific style/property of selected element
  const updateSelectedStyle = (key, value) => {
    setElements(prev => prev.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, [key]: value };
      }
      return el;
    }));
  };

  // Reset to default presets
  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all positions and texts to defaults? All custom labels will be removed.")) {
      setElements(DEFAULT_ELEMENTS);
      setCustomBg(null);
      setCustomBgName('');
      setTemplate('aurora');
      setSelectedElementId(null);
      localStorage.removeItem('vb_cert_elements');
      success("Builder state reset to original settings.");
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElementId);
  const activePreset = PRESETS[template] || {};

  // Table filtering for quick student actions
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Dynamic Printing CSS Override */}
      <style>{`
        @media print {
          body, html {
            background: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 9999999 !important;
            background: #000 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .print-canvas {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 100% !important;
            max-height: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} color="#d4af37" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Drag & Drop Certificate Builder</h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Create bespoke certificates. Drag elements around, upload templates, logos, and signatures.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleResetToDefaults}
            style={{
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            <RefreshCw size={14} /> Reset Canvas
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(212,175,55,1), rgba(180,140,20,1))', color: '#07071a',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(212,175,55,0.25)'
            }}
          >
            <Download size={14} /> Export / Print PDF
          </button>
        </div>
      </div>

      {/* Editor & Canvas Split Section */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Customize Control Panel */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 520 }}>
          
          {/* Tab Selection */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 8, gap: '0.25rem' }}>
            {['presets', 'elements', 'assets'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '0.45rem', border: 'none', borderRadius: 6, fontSize: '0.78rem',
                  fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer',
                  background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab === 'presets' ? 'Themes' : tab === 'elements' ? 'Elements' : 'Assets'}
              </button>
            ))}
          </div>

          {/* TAB 1: THEMES & BACKGROUNDS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Select Preset Themes
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(PRESETS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => applyPresetTheme(key)}
                      style={{
                        padding: '0.65rem 0.75rem', borderRadius: 8, border: template === key && !customBg ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                        background: template === key && !customBg ? 'rgba(124,58,237,0.06)' : 'var(--bg-surface)',
                        color: template === key && !customBg ? 'var(--primary)' : 'var(--text-primary)',
                        textAlign: 'left', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <span>{value.name}</span>
                      {template === key && !customBg && <Check size={14} color="var(--primary)" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Template Uploader */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Upload Custom Template
                </label>
                <div style={{ position: 'relative', border: '2px dashed var(--border-light)', borderRadius: 10, padding: '1rem', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,.docx"
                    onChange={handleTemplateUpload}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  <Upload size={20} color="var(--text-muted)" style={{ margin: '0 auto 0.4rem' }} />
                  <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700 }}>Upload template background</span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Supports JPG, PNG, PDF, or DOCX</span>
                </div>
                {docLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    <RefreshCw size={12} className="spin" /> Parsing & rendering file template...
                  </div>
                )}
                {customBg && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      📄 {customBgName || 'Custom Template Loaded'}
                    </span>
                    <button
                      onClick={() => { setCustomBg(null); setCustomBgName(''); applyPresetTheme('aurora'); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Remove custom template"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDIT CANVAS ELEMENTS */}
          {activeTab === 'elements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Canvas Elements List
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 220, overflowY: 'auto', paddingRight: '0.2rem' }}>
                  {elements.map(el => (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.6rem',
                        borderRadius: 6, cursor: 'pointer', border: selectedElementId === el.id ? '1px solid var(--primary)' : '1px solid transparent',
                        background: selectedElementId === el.id ? 'rgba(124,58,237,0.05)' : 'var(--bg-surface)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '80%' }}>
                        <input
                          type="checkbox"
                          checked={el.visible}
                          onChange={(e) => {
                            setElements(prev => prev.map(item => item.id === el.id ? { ...item, visible: e.target.checked } : item));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.78rem', color: el.visible ? 'var(--text-primary)' : 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {el.label}
                        </span>
                      </div>
                      {el.isCustom && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Text Button */}
              <button
                onClick={handleAddCustomText}
                style={{
                  padding: '0.5rem', borderRadius: 8, border: '1px dashed var(--primary)', background: 'transparent',
                  color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                }}
              >
                <Plus size={14} /> Add Custom Text Label
              </button>

              {/* Selected Element Style Editor */}
              {selectedEl && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                    🎨 Customizing: {selectedEl.label}
                  </span>
                  
                  {selectedEl.type === 'text' ? (
                    <>
                      {/* Edit Content */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Text Value</label>
                        <input
                          type="text"
                          value={selectedEl.text}
                          onChange={(e) => updateSelectedStyle('text', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {/* Font Size */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Font Size (px)</label>
                          <input
                            type="number"
                            min="6"
                            max="72"
                            value={selectedEl.fontSize}
                            onChange={(e) => updateSelectedStyle('fontSize', parseInt(e.target.value) || 12)}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                          />
                        </div>
                        {/* Color Picker */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Text Color</label>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <input
                              type="color"
                              value={selectedEl.color.startsWith('#') ? selectedEl.color : '#ffffff'}
                              onChange={(e) => updateSelectedStyle('color', e.target.value)}
                              style={{ width: '32px', height: '32px', padding: 0, border: '1px solid var(--border-light)', borderRadius: 6, cursor: 'pointer', background: 'none' }}
                            />
                            <input
                              type="text"
                              value={selectedEl.color}
                              onChange={(e) => updateSelectedStyle('color', e.target.value)}
                              style={{ width: 'calc(100% - 36px)', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.75rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Font Family Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Font Family</label>
                        <select
                          value={selectedEl.fontFamily}
                          onChange={(e) => updateSelectedStyle('fontFamily', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                        >
                          <option value="sans-serif">Modern Sans-Serif</option>
                          <option value="Georgia">Elegant Serif (Georgia)</option>
                          <option value="monospace">Coding Monospace</option>
                          <option value="'Times New Roman', serif">Classic Serif (Times)</option>
                          <option value="Arial, sans-serif">Standard Arial</option>
                        </select>
                      </div>

                      {/* Text Style Controls */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Formatting</label>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => updateSelectedStyle('fontWeight', selectedEl.fontWeight === 'bold' ? 'normal' : 'bold')}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-light)', borderRadius: 6, background: selectedEl.fontWeight === 'bold' ? 'var(--border-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                            title="Toggle Bold"
                          >
                            <Bold size={13} style={{ margin: '0 auto' }} />
                          </button>
                          <button
                            onClick={() => updateSelectedStyle('fontStyle', selectedEl.fontStyle === 'italic' ? 'normal' : 'italic')}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-light)', borderRadius: 6, background: selectedEl.fontStyle === 'italic' ? 'var(--border-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                            title="Toggle Italic"
                          >
                            <Italic size={13} style={{ margin: '0 auto' }} />
                          </button>
                          {['left', 'center', 'right'].map(align => (
                            <button
                              key={align}
                              onClick={() => updateSelectedStyle('align', align)}
                              style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-light)', borderRadius: 6, background: selectedEl.align === align ? 'var(--border-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                              title={`Align ${align}`}
                            >
                              {align === 'left' ? <AlignLeft size={13} style={{ margin: '0 auto' }} /> : align === 'center' ? <AlignCenter size={13} style={{ margin: '0 auto' }} /> : <AlignRight size={13} style={{ margin: '0 auto' }} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Image resizing controls
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Width (px)</label>
                        <input
                          type="number"
                          min="20"
                          max="300"
                          value={selectedEl.width}
                          onChange={(e) => updateSelectedStyle('width', parseInt(e.target.value) || 50)}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Height (px)</label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          value={selectedEl.height}
                          onChange={(e) => updateSelectedStyle('height', parseInt(e.target.value) || 20)}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM ASSETS (LOGOS & SIGNATURES) */}
          {activeTab === 'assets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Academy Logo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Academy Logo
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedElementId('logo')}
                    style={{
                      flex: 1, padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.78rem',
                      fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-light)',
                      background: 'var(--bg-surface)', color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem'
                    }}
                  >
                    <Settings size={12} /> Edit Logo Config
                  </button>
                  <label style={{ cursor: 'pointer', padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, background: 'var(--border-light)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Upload size={12} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e, 'logo')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Signatory 1 Signature */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Signatory 1 Signature
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedElementId('sig1_img')}
                    style={{
                      flex: 1, padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.78rem',
                      fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-light)',
                      background: 'var(--bg-surface)', color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem'
                    }}
                  >
                    <Settings size={12} /> Edit Signature 1
                  </button>
                  <label style={{ cursor: 'pointer', padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, background: 'var(--border-light)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Upload size={12} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e, 'sig1_img')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Signatory 2 Signature */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Signatory 2 Signature
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedElementId('sig2_img')}
                    style={{
                      flex: 1, padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.78rem',
                      fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-light)',
                      background: 'var(--bg-surface)', color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem'
                    }}
                  >
                    <Settings size={12} /> Edit Signature 2
                  </button>
                  <label style={{ cursor: 'pointer', padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, background: 'var(--border-light)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Upload size={12} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e, 'sig2_img')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Quick Sandbox Selector */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Student Data Context Binding
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <select
                value={selectedUser?.id || ''}
                onChange={e => setSelectedUser(users.find(u => u.id === parseInt(e.target.value)) || null)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.78rem' }}
              >
                <option value="">— Select Student Data —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <select
                value={selectedCourse?.id || ''}
                onChange={e => setSelectedCourse(courses.find(c => c.id === parseInt(e.target.value)) || null)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.78rem' }}
              >
                <option value="">— Select Course Data —</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Right Side: The Certificate Canvas Wrapper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>🖱️ Click & drag any element on the certificate canvas below to move it</span>
            <span>Selected element highlighted in <strong style={{ color: '#d4af37' }}>gold dash</strong></span>
          </div>

          <div
            className="print-area"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#07070e',
              padding: '1.5rem',
              borderRadius: 16,
              border: '1px solid var(--border-light)',
            }}
          >
            {/* The Certificate Canvas */}
            <div
              ref={canvasRef}
              className="print-canvas"
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{
                width: '100%',
                aspectRatio: '297/210', // exact A4 Landscape aspect ratio
                position: 'relative',
                background: customBg ? `url(${customBg}) no-repeat center/cover` : activePreset.background,
                border: customBg ? 'none' : activePreset.border,
                borderRadius: customBg ? 0 : 12,
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                userSelect: 'none',
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {/* Preset Border overlays */}
              {!customBg && activePreset.innerBorder && activePreset.innerBorder !== 'none' && (
                <div style={{ position: 'absolute', inset: 8, border: activePreset.innerBorder, borderRadius: 8, pointerEvents: 'none' }} />
              )}

              {/* Aurora background graphics */}
              {!customBg && template === 'aurora' && (
                <>
                  <div style={{ position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                  <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }} width="100%" height="100%">
                    <defs>
                      <pattern id="cert-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#d4af37" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cert-dots)" />
                  </svg>
                </>
              )}

              {/* Cyberpunk background grid */}
              {!customBg && template === 'cyber' && (
                <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'linear-gradient(rgba(0, 255, 204, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
              )}

              {/* Render Draggable Canvas Elements */}
              {elements.map((el) => {
                if (!el.visible) return null;

                const isSelected = selectedElementId === el.id;

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleDragStart(e, el.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                    style={{
                      position: 'absolute',
                      top: `${el.top}%`,
                      left: `${el.left}%`,
                      transform: el.align === 'center' ? 'translate(-50%, -50%)' : el.align === 'right' ? 'translate(-100%, -50%)' : 'translateY(-50%)',
                      cursor: draggingId === el.id ? 'grabbing' : 'grab',
                      outline: isSelected ? '1px dashed #d4af37' : 'none',
                      outlineOffset: '3px',
                      padding: '2px 4px',
                      zIndex: isSelected ? 100 : 10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {el.type === 'text' ? (
                      <span
                        style={{
                          fontSize: `${el.fontSize}px`,
                          fontFamily: el.fontFamily,
                          color: el.color,
                          fontWeight: el.fontWeight,
                          fontStyle: el.fontStyle,
                          textAlign: el.align,
                          display: 'block',
                          textShadow: !customBg && template === 'cyber' ? '0 0 8px rgba(0,255,204,0.4)' : (!customBg && template === 'aurora' && el.id === 'cert_title' ? activePreset.glow : 'none'),
                        }}
                      >
                        {el.text}
                      </span>
                    ) : (
                      // Image Elements (Logo, Signatures)
                      <div style={{ width: el.width, height: el.height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {el.src ? (
                          <img
                            src={el.src}
                            alt={el.label}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                          />
                        ) : (
                          // Placeholder
                          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.06)', border: '1px dashed var(--border-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--text-muted)' }}>
                            No {el.label.split(' ').pop()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

        </div>

      </div>

      {/* Student List quick cert table */}
      <div className="card no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Users size={16} color="var(--primary)" /> Students List
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.82rem', width: 220 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Student', 'Email', 'Role', 'Plan', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{u.role?.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: u.plan === 'enterprise' ? 'var(--accent)' : u.plan === 'pro' ? 'var(--warning)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{u.plan}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <button
                      onClick={() => { setSelectedUser(u); success(`Bound canvas to ${u.name}`); }}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-light)',
                        background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.72rem',
                        fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    >
                      Bind student data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
