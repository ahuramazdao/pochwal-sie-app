import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { UploadCloud, Download, Copy, CheckCircle, Share2, MessageCircle, Users, Calendar, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

// Custom SVG Icons for brands (missing in current lucide-react version)
const Facebook = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Youtube = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

const CONFIG = {
  canvas: {
    width: 2048,
    height: 2048,
    backgroundImageUrl: "/assets/bg-program-klub.png",
    logoPosition: { x: 488, y: 1487, radius: 237 },
    textPosition: { x: 1304, y: 1480, fontSize: 320, fontFamily: '"Bebas Neue", sans-serif', color: "#FFFFFF" }
  },
  amounts: [12000, 17000],
  utmLinks: {
    footer: "https://programydlaklubow.pl/?utm_source=generator&utm_medium=organic&utm_campaign=program_klub"
  },
  socialLinks: {
    facebookGroup: "https://www.facebook.com/groups/programydlaklubow",
    whatsapp: "https://chat.whatsapp.com/G6eP31jY1Ou7XsFrMkINSE",
    facebook: "https://www.facebook.com/programydlaklubow",
    instagram: "https://www.instagram.com/programydlaklubow",
    youtube: "https://www.youtube.com/@programydlaklubow",
    calendar: "https://programydlaklubow.pl/kalendarz-dotacji-i-programow-dla-klubow-sportowych",
    apply: "https://programydlaklubow.pl/zgloszenia"
  },
  postTemplate: (clubName, amount) => 
    `Mamy to! 🎉 Nasz klub ${clubName || '[Nazwa Klubu]'} pozyskał ${amount.toLocaleString('pl-PL')} zł z Programu KLUB! 💪 Dziękujemy za wsparcie.`
};

export default function App() {
  const [clubName, setClubName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(CONFIG.amounts[0]);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [bgImage, setBgImage] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [counterValue, setCounterValue] = useState(127);

  const canvasRef = useRef(null);

  // Animated live counter - counts up to 140 on mount, then slowly increments
  useEffect(() => {
    const BASE = 127;
    const TARGET = 140;
    // Count up quickly from BASE to TARGET over ~1.5s
    let current = BASE;
    const interval = setInterval(() => {
      current += 1;
      setCounterValue(current);
      if (current >= TARGET) clearInterval(interval);
    }, 100);

    // After reaching target, slowly add 1 every 45-90 seconds to feel "live"
    const slowTick = setTimeout(() => {
      const slow = setInterval(() => {
        setCounterValue(v => v + 1);
      }, Math.random() * 45000 + 45000);
      return () => clearInterval(slow);
    }, 2000);

    return () => { clearInterval(interval); clearTimeout(slowTick); };
  }, []);

  // Load background image AND wait for fonts before first render
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = CONFIG.canvas.backgroundImageUrl;
    
    const onImageReady = (loadedImg) => {
      // Wait for Bebas Neue to be fully loaded before drawing
      document.fonts.ready.then(() => {
        setBgImage(loadedImg);
      });
    };
    
    img.onload = () => {
      onImageReady(img);
    };
    img.onerror = () => {
      console.warn("Background image not found. Using a fallback.");
      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = CONFIG.canvas.width;
      fallbackCanvas.height = CONFIG.canvas.height;
      const ctx = fallbackCanvas.getContext("2d");
      
      const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
      gradient.addColorStop(0, "#D90429");
      gradient.addColorStop(1, "#212C62");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
      
      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL();
      fallbackImg.onload = () => onImageReady(fallbackImg);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Plik jest za duży (max 5MB) lub ma nieprawidłowy format. Użyj JPG, PNG lub WEBP.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Plik jest za duży (max 5MB) lub ma nieprawidłowy format. Użyj JPG, PNG lub WEBP.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoDataUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !bgImage) return;

    const ctx = canvasRef.current.getContext("2d");
    const { width, height, logoPosition, textPosition } = CONFIG.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (logoDataUrl) {
      const logoImg = new Image();
      logoImg.src = logoDataUrl;
      logoImg.onload = () => {
        // Draw solid white circle behind the logo
        ctx.fillStyle = "white";
        ctx.beginPath();
        // Radius slightly larger than the hole, template will mask it perfectly
        ctx.arc(logoPosition.x, logoPosition.y, logoPosition.radius + 15, 0, Math.PI * 2, true);
        ctx.fill();

        // Calculate dimensions to fit inside the circle (object-fit: contain)
        const maxDim = logoPosition.radius * 2 * 0.85; 
        const aspect = logoImg.width / logoImg.height;
        let drawWidth, drawHeight;
        
        if (aspect > 1) {
            drawWidth = maxDim;
            drawHeight = maxDim / aspect;
        } else {
            drawHeight = maxDim;
            drawWidth = maxDim * aspect;
        }
        
        const dx = logoPosition.x - drawWidth / 2;
        const dy = logoPosition.y - drawHeight / 2;

        // Draw the logo itself
        ctx.drawImage(logoImg, dx, dy, drawWidth, drawHeight);
        
        // DRAW BACKGROUND TEMPLATE (OVERLAY)
        ctx.drawImage(bgImage, 0, 0, width, height);

        // Draw text
        drawAmount(ctx);
        setIsCanvasReady(true);
      };
    } else {
      // Draw solid white circle behind even if no logo is uploaded yet
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(logoPosition.x, logoPosition.y, logoPosition.radius + 15, 0, Math.PI * 2, true);
      ctx.fill();

      // DRAW BACKGROUND TEMPLATE (OVERLAY)
      ctx.drawImage(bgImage, 0, 0, width, height);

      drawAmount(ctx);
      setIsCanvasReady(true);
    }
  }, [bgImage, logoDataUrl, selectedAmount]);

  const drawAmount = async (ctx) => {
    const { textPosition } = CONFIG.canvas;
    const yOffset = 25;
    const fontSpec = `900 ${textPosition.fontSize}px "Bebas Neue"`;

    // Jawnie wymuszamy załadowanie fontu przez Canvas API przed rysowaniem
    await document.fonts.load(fontSpec);

    ctx.font = `${fontSpec}, sans-serif`;
    ctx.fillStyle = textPosition.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // add shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    const amountText = `${selectedAmount.toLocaleString('pl-PL')} ZŁ`;
    ctx.fillText(amountText, textPosition.x, textPosition.y + yOffset);
    
    // reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  useEffect(() => {
    if (bgImage) {
      drawCanvas();
    }
  }, [drawCanvas, bgImage, selectedAmount, logoDataUrl]);

  const slugify = (str) => {
    if (!str) return "klub";
    return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    const link = document.createElement('a');
    link.download = `sukces-${slugify(clubName)}.jpg`;
    link.href = dataUrl;
    link.click();
    
    // Uruchom konfetti z odpowiednimi kolorami po pobraniu
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: ['#D90429', '#212C62', '#FFFFFF', '#FFD700'] 
    });
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(async (blob) => {
      const file = new File([blob], `sukces-${slugify(clubName)}.jpg`, { type: 'image/jpeg' });
      const postText = CONFIG.postTemplate(clubName, selectedAmount);

      // Web Share API z plikiem (działa na mobile: Android Chrome, iOS Safari)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Pozyskaliśmy dotację z Programu KLUB!',
            text: postText,
            files: [file],
          });
        } catch (err) {
          if (err.name !== 'AbortError') toast.error('Nie udało się udostępnić.');
        }
      } else if (navigator.share) {
        // Fallback: udostępnij bez pliku (tekst + URL)
        try {
          await navigator.share({
            title: 'Pozyskaliśmy dotację z Programu KLUB!',
            text: postText,
            url: 'https://programydlaklubow.pl',
          });
        } catch (err) {
          if (err.name !== 'AbortError') toast.error('Nie udało się udostępnić.');
        }
      } else {
        // Fallback desktop: skopiuj tekst + poinformuj o pobraniu
        try {
          await navigator.clipboard.writeText(postText);
          toast.success('Tekst skopiowany! Na komputerze pobierz grafikę i wklej ją ręcznie do posta.');
        } catch {
          toast.error('Twoja przeglądarka nie obsługuje udostępniania.');
        }
      }
    }, 'image/jpeg', 0.85);
  };

  const handleCopyText = async () => {
    const text = CONFIG.postTemplate(clubName, selectedAmount);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Skopiowano do schowka!");
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      toast.error("Nie udało się skopiować");
    }
  };

  return (
    <div className="ds-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      
      <div className="ds-navbar" style={{ borderRadius: 0, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <a href="https://programydlaklubow.pl/" target="_blank" rel="noopener noreferrer" className="ds-navbar-brand">
            <img src="/assets/logo.svg" alt="Programy dla Klubów" style={{ height: '32px' }} />
          </a>
          <div className="ds-navbar-nav" style={{ display: 'none' }}>
            {/* Desktop Nav */}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <div className="ds-social-icons hide-mobile" style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <a href={CONFIG.socialLinks.facebookGroup} target="_blank" rel="noopener noreferrer" className="ds-nav-item" title="Społeczność Facebook"><Users size={18} /></a>
            <a href={CONFIG.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="ds-nav-item" title="WhatsApp"><MessageCircle size={18} /></a>
            <a href={CONFIG.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="ds-nav-item" title="Facebook"><Facebook size={18} /></a>
            <a href={CONFIG.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="ds-nav-item" title="Instagram"><Instagram size={18} /></a>
            <a href={CONFIG.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="ds-nav-item" title="YouTube"><Youtube size={18} /></a>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--gray-200)', margin: '0 4px' }} className="hide-mobile"></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <a href={CONFIG.socialLinks.calendar} target="_blank" rel="noopener noreferrer" className="ds-nav-item hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> Terminarz dotacji
            </a>
            <a href={CONFIG.socialLinks.apply} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Chcę dotacje <ExternalLink size={14} style={{ marginLeft: '4px' }} />
            </a>
          </div>
        </div>
      </div>

      <main className="ds-main" style={{ flex: 1, background: 'var(--gray-50)', padding: 'var(--space-8)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-8)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            <div style={{ paddingBottom: 'var(--space-2)' }}>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--navy-900)', marginBottom: 'var(--space-3)' }}>
                Generator Grafiki Sukcesu
              </h1>
              <p style={{ color: 'var(--navy-700)', fontSize: 'var(--font-size-base)', lineHeight: 1.5 }}>
                Pochwal się przyznaną dotacją. Wprowadź dane swojego klubu, aby wygenerować profesjonalną grafikę i gotowy tekst posta udowadniający pozyskanie środków z Programu KLUB.
              </p>
            </div>

            <div className="ds-card ds-card-elevated" style={{ height: 'fit-content' }}>
              <div className="ds-card-header">
                <h2 className="ds-card-title">Skonfiguruj grafikę</h2>
              </div>
              <div className="ds-card-body">
                
                <div className="ds-form-field" style={{ maxWidth: '100%' }}>
                  <label className="ds-label">Nazwa Klubu</label>
                  <input 
                    type="text" 
                    className="ds-input" 
                    placeholder="np. KS Sparta Warszawa" 
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                </div>

                <div className="ds-form-field" style={{ maxWidth: '100%', marginTop: 'var(--space-6)' }}>
                  <label className="ds-label">Herb Klubu</label>
                  <div style={{
                    border: '2px dashed var(--gray-300)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                    background: 'var(--gray-50)',
                    position: 'relative'
                  }}>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
                      }}
                    />
                    <UploadCloud size={32} color="var(--gray-400)" style={{ margin: '0 auto var(--space-2)' }} />
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--navy-700)' }}>
                      {logoFile ? logoFile.name : "Kliknij lub przeciągnij plik"}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>JPG, PNG, WEBP do 5MB</p>
                  </div>
                </div>

                <div className="ds-form-field" style={{ maxWidth: '100%', marginTop: 'var(--space-6)' }}>
                  <label className="ds-label">Kwota Dotacji</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    {CONFIG.amounts.map(amt => (
                      <button
                        key={amt}
                        className={`ds-btn ds-btn-lg ${selectedAmount === amt ? 'ds-btn-primary' : 'ds-btn-outline-primary'}`}
                        style={{ justifyContent: 'center', width: '100%' }}
                        onClick={() => setSelectedAmount(amt)}
                      >
                        {amt.toLocaleString('pl-PL')} zł
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            <div className="ds-card ds-card-elevated">
              <div className="ds-card-header">
                <h2 className="ds-card-title">Podgląd Grafiki</h2>
              </div>
              <div className="ds-card-body" style={{ background: 'var(--gray-100)', display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '500px', 
                  aspectRatio: '1/1', 
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}>
                  <canvas 
                    ref={canvasRef} 
                    width={CONFIG.canvas.width} 
                    height={CONFIG.canvas.height}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                  {!isCanvasReady && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
                      Ładowanie...
                    </div>
                  )}
                </div>
              </div>
              <div className="ds-card-footer" style={{ justifyContent: 'center', gap: 'var(--space-3)' }}>
                <button 
                  className={`ds-btn ds-btn-lg ds-btn-primary ${!isCanvasReady ? 'ds-btn-disabled' : ''}`} 
                  onClick={handleDownload}
                >
                  <Download size={18} /> Pobierz Grafikę
                </button>
                <button 
                  className={`ds-btn ds-btn-lg ds-btn-secondary ${!isCanvasReady ? 'ds-btn-disabled' : ''}`} 
                  onClick={handleShare}
                  title="Udostępnij grafikę bezpośrednio na Facebook lub Instagram"
                >
                  <Share2 size={18} /> Udostępnij
                </button>
              </div>
            </div>

            <div className="ds-card ds-card-elevated">
              <div className="ds-card-header">
                <h2 className="ds-card-title">Gotowy tekst posta</h2>
              </div>
              <div className="ds-card-body">
                <div style={{ 
                  background: 'var(--gray-100)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  color: 'var(--navy-800)'
                }}>
                  {CONFIG.postTemplate(clubName, selectedAmount)}
                </div>
              </div>
              <div className="ds-card-footer" style={{ justifyContent: 'flex-end' }}>
                <button 
                  className={`ds-btn ds-btn-lg ds-btn-secondary`} 
                  onClick={handleCopyText}
                >
                  {isCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {isCopied ? "Skopiowano!" : "Kopiuj tekst"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* LICZNIK SOCIAL PROOF */}
      <div className="ds-counter-banner">
        <span className="ds-counter-fire">🔥</span>
        <span className="ds-counter-text">
          Już ponad <strong className="ds-counter-number">{counterValue}</strong> klubów wygenerowało swoją grafikę w tym tygodniu!
        </span>
      </div>

      {/* GALERIA MVP - Social Proof */}
      <section className="ds-gallery-section">
        <div className="ds-gallery-inner">
          <h2 className="ds-gallery-title">Zobacz, jak inne kluby chwalą się sukcesem!</h2>
          <p className="ds-gallery-subtitle">Dołącz do setek polskich klubów, które już pochwaliły się swoimi dotacjami.</p>
          <div className="ds-gallery-grid">
            {[
              'sukces-delfin',
              'sukces-fronda',
              'sukces-jantar',
              'sukces-klub',
              'sukces-lublin',
              'sukces-penclin',
              'sukces-poznan',
              'sukces-poznanianka',
              'sukces-szczecin',
              'sukces-wisa',
            ].map((name) => (
              <div key={name} className="ds-gallery-item">
                <img src={`/gallery/${name}.webp`} alt={`Przykład grafiki - ${name}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--navy-800)', padding: 'var(--space-8) var(--space-6)', textAlign: 'center', color: 'var(--gray-300)', fontSize: 'var(--font-size-sm)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <a href={CONFIG.socialLinks.facebookGroup} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="Społeczność Facebook"><Users size={24} /></a>
            <a href={CONFIG.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="WhatsApp"><MessageCircle size={24} /></a>
            <a href={CONFIG.socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="Facebook"><Facebook size={24} /></a>
            <a href={CONFIG.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="Instagram"><Instagram size={24} /></a>
            <a href={CONFIG.socialLinks.youtube} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }} title="YouTube"><Youtube size={24} /></a>
          </div>
          <p style={{ marginBottom: '8px' }}>Stworzone z myślą o polskich klubach sportowych.</p>
          <p><a href={CONFIG.utmLinks.footer} style={{ color: 'var(--red-400)', textDecoration: 'none', fontWeight: 600 }}>ProgramyDlaKlubow.pl</a></p>
        </div>
      </footer>
    </div>
  );
}
