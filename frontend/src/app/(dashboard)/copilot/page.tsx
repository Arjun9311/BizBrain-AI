'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Bot, 
  Send, 
  User, 
  FileUp, 
  Mic, 
  MicOff, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Table2,
  Trash2,
  Mail,
  Copy,
  Check,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  message: string;
  timestamp: Date;
  file?: {
    name: string;
    type: 'pdf' | 'excel' | 'image';
    url?: string;
  };
}

export default function CopilotPage() {
  const { token } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      message: 'Hello! I am your BizBrain Intelligent Business Copilot. I have mapped your ERP ledger, CRM segments, and inventory levels for **BizBrain HQ**.\n\nYou can ask me to write supplier emails, predict sales, find stock shortages, or draft business plans. Try clicking one of the templates on the left to start!',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice Input Mock States
  const [isRecording, setIsRecording] = useState(false);
  
  // File Upload Mock States
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: 'pdf' | 'excel' | 'image';
  } | null>(null);

  // Copilot Artifact View Panel (Renders the generated code, emails, or reports side-by-side)
  const [generatedDoc, setGeneratedDoc] = useState<{
    type: string;
    content: string;
  } | null>(null);
  
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string, fileAttached = attachedFile) => {
    const text = textToSend.trim();
    if (!text && !fileAttached) return;

    const userMsgId = Math.random().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      message: text,
      timestamp: new Date(),
      file: fileAttached ? { name: fileAttached.name, type: fileAttached.type } : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: text })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if output contains a structured format to show in the Generated Panel
        const answer = data.response;
        
        const isEmail = answer.includes('Subject:') || answer.includes('Dear');
        const isReport = answer.includes('###') || answer.includes('SWOT');
        
        if (isEmail) {
          setGeneratedDoc({ type: 'Email Outline', content: answer });
        } else if (isReport) {
          setGeneratedDoc({ type: 'Business Document', content: answer });
        }

        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'model',
          message: answer,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'model',
          message: 'Sorry, I encountered an error communicating with the neural processor. Please try again.',
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        message: 'Could not contact the server. Please verify the backend is running.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput('Which products should I reorder this week?');
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInput('Which products should I reorder this week?');
      }, 3000); // autofill prompt after 3s recording
    }
  };

  const handleMockUpload = (type: 'pdf' | 'excel' | 'image') => {
    const names = {
      pdf: 'Ledger_Statement_June.pdf',
      excel: 'Q2_Profit_Sheet.xlsx',
      image: 'Receipt_AWS_Bill.png'
    };
    setAttachedFile({ name: names[type], type });
  };

  const handleCopyText = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptSuggestions = [
    { label: 'Forecast next month sales', text: 'Predict next month sales and explain the factors.' },
    { label: 'Analyze monthly profit', text: 'How much profit did I make this month? Breakdown expenses.' },
    { label: 'Supplier Email draft', text: 'Write an email to suppliers requesting a restock of laptops.' },
    { label: 'Find stock shortages', text: 'Which products are running low in the warehouse?' },
    { label: 'CRM insights', text: 'Show recent customer insights. Which clients are at risk?' }
  ];

  return (
    <div className="h-[calc(100vh-130px)] flex gap-6 select-none overflow-hidden">
      
      {/* Left Column: Shortcuts / Prompts History */}
      <div className="w-80 hidden md:flex flex-col gap-6 shrink-0 h-full">
        {/* Suggestion Prompts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between flex-1 overflow-y-auto">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-500" /> Quick Copilot Actions
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
              Click any blueprint template below to instantly compile stats and generate files.
            </p>
            
            <div className="space-y-2">
              {promptSuggestions.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setInput(p.text);
                    handleSendMessage(p.text);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-blue-500/20 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{p.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center text-[10px] text-slate-500">
            Enterprise Model: Gemini 1.5 Flash
          </div>
        </div>
      </div>

      {/* Main Column: Chat interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-full">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Advisory Feed</h3>
              <p className="text-[10px] text-emerald-500 font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> ONLINE
              </p>
            </div>
          </div>
          
          {messages.length > 1 && (
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/15 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex items-start gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${
                  isUser ? 'bg-gradient-to-tr from-blue-600 to-cyan-500' : 'bg-slate-700 dark:bg-slate-800'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl leading-relaxed text-xs border ${
                    isUser 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10 rounded-tr-none' 
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800 rounded-tl-none'
                  }`}>
                    {/* Render message with line breaks */}
                    {m.message.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}

                    {/* File Attachment Pill */}
                    {m.file && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/10 dark:bg-white/10 rounded-lg text-[10px] font-semibold">
                        {m.file.type === 'pdf' && <FileText className="w-3.5 h-3.5 text-red-500" />}
                        {m.file.type === 'excel' && <Table2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {m.file.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />}
                        <span className="truncate max-w-[150px]">{m.file.name}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] text-slate-400 dark:text-slate-500 block px-1 ${isUser ? 'text-right' : ''}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loader bubble */}
          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-slate-700 dark:bg-slate-800 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-150"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Dynamic preview list for draft uploads */}
        {attachedFile && (
          <div className="px-6 py-2 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Draft attachment:</span>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-semibold">
                {attachedFile.type === 'pdf' && <FileText className="w-3 h-3 text-red-500" />}
                {attachedFile.type === 'excel' && <Table2 className="w-3 h-3 text-emerald-500" />}
                {attachedFile.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />}
                <span className="max-w-[160px] truncate">{attachedFile.name}</span>
              </div>
            </div>
            <button 
              onClick={() => setAttachedFile(null)}
              className="text-[10px] text-rose-500 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input panel with controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5"
          >
            {/* Attachment dropdown button trigger */}
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={() => handleMockUpload('pdf')}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500 transition-colors"
                title="Mock PDF Upload"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMockUpload('excel')}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-500 transition-colors"
                title="Mock Excel Upload"
              >
                <Table2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMockUpload('image')}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-500 transition-colors"
                title="Mock Image Upload"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Ask Copilot: 'Forecast sales' or 'Write restock email'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs outline-none text-slate-800 dark:text-slate-200 py-2 px-1 focus:ring-0"
              disabled={loading}
            />

            {/* Mic trigger and submit */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 rounded-lg transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title={isRecording ? "Listening..." : "Mock Voice Input"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile) || loading}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all flex items-center justify-center shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          {isRecording && (
            <p className="text-[10px] text-center text-red-500 mt-2 font-medium animate-pulse flex items-center justify-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 animate-spin" /> Recording audio ledger query...
            </p>
          )}
        </div>
      </div>

      {/* Slide-out Generated Panel (For previewing generated emails, sheets, or code) */}
      {generatedDoc && (
        <div className="w-80 hidden lg:flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-full animate-slide-in">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" /> Artifact Preview
            </span>
            <button 
              onClick={() => setGeneratedDoc(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto text-xs font-mono leading-relaxed bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300">
            {generatedDoc.content.split('\n').map((line, idx) => (
              <p key={idx} className={line.trim() === '' ? 'h-3' : ''}>{line}</p>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/25 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Document
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
