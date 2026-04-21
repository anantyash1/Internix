import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Loader } from 'lucide-react';

/**
 * CameraCapture
 * Props:
 *   onCapture(file: File) — called when user confirms photo
 *   onClose()             — called to dismiss
 *   label                 — "Check In" or "Check Out"
 */
export default function CameraCapture({ onCapture, onClose, label = 'Take Photo' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('init'); // init | streaming | captured | error
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // selfie by default

  // Start camera
  const startCamera = useCallback(async (mode = facingMode) => {
    setPhase('init');
    setErrorMsg('');

    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => setPhase('streaming'));
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('No camera found on this device.');
      } else {
        setErrorMsg(`Camera error: ${err.message}`);
      }
      setPhase('error');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Capture snapshot
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    // Mirror for selfie (front camera)
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedUrl(dataUrl);
    setPhase('captured');

    // Stop stream to save resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  // Retake
  const retake = () => {
    setCapturedUrl(null);
    setPhase('init');
    startCamera(facingMode);
  };

  // Flip camera
  const flipCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    setCapturedUrl(null);
    setPhase('init');
    startCamera(newMode);
  };

  // Confirm and pass file to parent
  const confirm = () => {
    if (!capturedUrl) return;
    canvas2file(capturedUrl, (file) => {
      onCapture(file);
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 500, marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(59,130,246,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={18} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              Take a selfie to verify attendance
            </div>
          </div>
        </div>
        <button onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); onClose(); }}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <X size={15} />
        </button>
      </div>

      {/* Camera viewport */}
      <div style={{
        width: '100%', maxWidth: 500,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: '#111',
        aspectRatio: '4/3',
        position: 'relative',
        border: phase === 'captured' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.1)',
        transition: 'border-color 300ms ease',
      }}>
        {/* Live video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            display: phase === 'streaming' ? 'block' : 'none',
          }}
        />

        {/* Captured image preview */}
        {capturedUrl && (
          <img
            src={capturedUrl}
            alt="Captured"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Loading / error overlays */}
        {phase === 'init' && !errorMsg && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem',
          }}>
            <Loader size={32} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Starting camera…</span>
          </div>
        )}

        {phase === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem',
            padding: '1.5rem', textAlign: 'center',
          }}>
            <AlertCircle size={36} style={{ color: '#f43f5e' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              {errorMsg}
            </span>
            <button onClick={() => startCamera(facingMode)} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
              background: '#2563eb', color: '#fff', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-body)',
            }}>
              Try Again
            </button>
          </div>
        )}

        {/* Face guide overlay */}
        {phase === 'streaming' && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 180, height: 220,
              border: '2px dashed rgba(255,255,255,0.35)',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              boxShadow: '0 0 0 4000px rgba(0,0,0,0.18)',
            }} />
          </div>
        )}

        {/* Confirmed tick */}
        {phase === 'captured' && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <Check size={16} style={{ color: '#fff' }} />
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Controls */}
      <div style={{
        display: 'flex', gap: '0.75rem', marginTop: '1.25rem',
        width: '100%', maxWidth: 500,
      }}>
        {phase === 'streaming' && (
          <>
            <button onClick={flipCamera} style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 180ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            title="Flip camera"
            >
              <RotateCcw size={18} />
            </button>
            <button onClick={capturePhoto} style={{
              flex: 1, height: 48, borderRadius: 12, border: '3px solid #fff',
              background: '#2563eb', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 700,
              transition: 'all 180ms cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.45)'; }}
            >
              <Camera size={18} /> Capture
            </button>
          </>
        )}

        {phase === 'captured' && (
          <>
            <button onClick={retake} style={{
              flex: 1, height: 48, borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600,
            }}>
              <RotateCcw size={16} /> Retake
            </button>
            <button onClick={confirm} style={{
              flex: 2, height: 48, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
              transition: 'all 180ms cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <Check size={18} /> Use This Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Utility: dataURL → File ──────────────────────────────────────────────────
function canvas2file(dataUrl, callback) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  const blob = new Blob([u8arr], { type: mime });
  const file = new File([blob], `attendance-${Date.now()}.jpg`, { type: 'image/jpeg' });
  callback(file);
}