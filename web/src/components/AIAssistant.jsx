import { useState, useRef, useEffect } from 'react';
import useAIStore from '../store/aiStore';
import useAuthStore from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Sparkles, X, Send, RefreshCw } from 'lucide-react';

const BOT_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-1H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4h4zm0 2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-2 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-2 4a2 2 0 0 0 1.732-1H9.268A2 2 0 0 0 11 12z"/>
  </svg>
);

const SUGGESTIONS = [
  'How do I mark my attendance?',
  'Tips for writing a great report',
  'What skills should I focus on?',
  'How do I download my certificate?',
];

function Message({ msg, isNew }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      gap: '0.5rem',
      alignItems: 'flex-end',
      animation: isNew ? 'fadeUp 0.2s ease both' : 'none',
    }}>
      {!isUser && (
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', marginBottom: 2,
        }}>
          {BOT_ICON}
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '0.5625rem 0.875rem',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
          : '#ffffff',
        color: isUser ? '#ffffff' : 'var(--slate-800)',
        fontSize: '0.8125rem',
        lineHeight: 1.6,
        boxShadow: isUser
          ? '0 2px 8px rgba(37,99,235,0.3)'
          : 'var(--shadow-sm)',
        border: isUser ? 'none' : '1px solid var(--slate-100)',
        fontFamily: 'var(--font-body)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const isNarrowScreen = useMediaQuery('(max-width: 560px)');
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [prevLen, setPrevLen] = useState(0);
  const { messages, loading, sendMessage, clearMessages } = useAIStore();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const handleSend = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    setPrevLen(messages.length);
    await sendMessage(t, `Role: ${user?.role}, Name: ${user?.name}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          zIndex: 50,
          bottom: isNarrowScreen ? 'max(14px, env(safe-area-inset-bottom))' : 28,
          right: isNarrowScreen ? 'max(14px, env(safe-area-inset-right))' : 28,
          display: open ? 'none' : 'flex',
          alignItems: 'center', gap: '0.5rem',
          padding: isNarrowScreen ? '0.625rem 0.875rem' : '0.6875rem 1.25rem',
          maxWidth: isNarrowScreen ? 'calc(100vw - 28px)' : 'none',
          background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(37,99,235,0.45)',
          transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
          animation: 'fadeUp 0.4s ease both',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.45)'; }}
      >
        <Sparkles size={16} />
        Ask AI
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          zIndex: 60,
          ...(isNarrowScreen
            ? {
                left: 'max(10px, env(safe-area-inset-left))',
                right: 'max(10px, env(safe-area-inset-right))',
                bottom: 'max(14px, env(safe-area-inset-bottom))',
                top: 'auto',
                width: 'auto',
                height: 'min(580px, 78dvh)',
                maxHeight: '78dvh',
              }
            : {
                bottom: 24,
                right: 24,
                width: 380,
                height: 580,
              }),
          background: 'var(--slate-50)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.07)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
          transformOrigin: isNarrowScreen ? 'bottom center' : 'bottom right',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            background: 'linear-gradient(135deg, var(--navy-900), var(--navy-800))',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
              }}>
                {BOT_ICON}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: '#fff', letterSpacing: '-0.02em' }}>
                  AI Study Assistant
                </div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Powered by Claude
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  title="Clear chat"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 8,
                    border: 'none', background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  <RefreshCw size={13} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 8,
                  border: 'none', background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.25)'; e.currentTarget.style.color = '#fca5a5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--blue-50)', border: '1px solid var(--blue-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.875rem', color: 'var(--blue-500)',
                }}>
                  <Sparkles size={22} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-800)', marginBottom: '0.375rem' }}>
                  Hi, {user?.name?.split(' ')[0]}!
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  I'm your AI assistant. Ask me anything about your internship journey.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.5625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--slate-200)',
                        background: '#ffffff',
                        fontSize: '0.8125rem', color: 'var(--slate-600)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-50)'; e.currentTarget.style.borderColor = 'var(--blue-200)'; e.currentTarget.style.color = 'var(--blue-700)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.color = 'var(--slate-600)'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <Message key={i} msg={msg} isNew={i >= prevLen} />
              ))
            )}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  {BOT_ICON}
                </div>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: '#ffffff', border: '1px solid var(--slate-100)',
                  borderRadius: '14px 14px 14px 4px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div className="ai-typing"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--slate-200)',
            background: '#ffffff',
            display: 'flex', gap: '0.5rem',
            alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'var(--slate-900)',
                background: 'var(--slate-50)',
                border: '1.5px solid var(--slate-200)',
                borderRadius: 12,
                padding: '0.5rem 0.75rem',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.5,
                maxHeight: 100,
                transition: 'border-color 150ms',
                overflowY: 'auto',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-400)'; e.currentTarget.style.background = '#fff'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.background = 'var(--slate-50)'; }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, flexShrink: 0,
                background: (!loading && input.trim())
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : 'var(--slate-200)',
                border: 'none', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: (!loading && input.trim()) ? '#fff' : 'var(--slate-400)',
                cursor: (!loading && input.trim()) ? 'pointer' : 'not-allowed',
                transition: 'all 180ms cubic-bezier(0.34,1.56,0.64,1)',
                transform: (!loading && input.trim()) ? '' : '',
              }}
              onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
