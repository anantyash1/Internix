import { useState, useRef, useEffect } from 'react';
import useAIStore from '../store/aiStore';
import useAuthStore from '../store/authStore';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage } = useAIStore();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    await sendMessage(text, `User role: ${user?.role}, Name: ${user?.name}`);
  };

  const suggestions = [
    'How do I complete a task?',
    'Tips for writing a good report',
    'What skills should I develop?',
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        title="AI Study Assistant"
      >
        <Bot size={22} />
        <span className="text-sm font-medium hidden sm:inline">AI Assistant</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 h-full sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary-600 sm:rounded-t-2xl">
            <div className="flex items-center gap-2 text-white">
              <Bot size={20} />
              <span className="font-semibold">AI Study Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center space-y-3 pt-4">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
                  <Bot size={28} className="text-primary-600" />
                </div>
                <p className="text-sm text-gray-500">
                  Hi {user?.name}! I'm your AI assistant. Ask me anything about your internship.
                </p>
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="w-full text-left text-xs border rounded-lg px-3 py-2 hover:bg-primary-50 hover:border-primary-200 text-gray-600 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot size={14} className="text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] text-sm rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                  <Bot size={14} className="text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="input-field flex-1 text-sm py-2"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary py-2 px-3">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}