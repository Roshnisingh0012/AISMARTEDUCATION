import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am your AI coach. How can I help you upskill today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';
      const response = await fetch(`${baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.body) throw new Error("No body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              assistantResponse += data.text || '';
              setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = assistantResponse;
                return newArr;
              });
            } catch (e) {
              // Fallback if not strict JSON
              const rawText = dataStr.replace(/\\n/g, '\n');
              assistantResponse += rawText;
              setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = assistantResponse;
                return newArr;
              });
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1].content = "Sorry, I'm having trouble connecting right now.";
        return newArr;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "Why do I have a gap in Python?",
    "Explain my last quiz mistakes",
    "Recommend NSSTA workshops for my role"
  ];

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center">
              <Bot size={24} className="mr-2" />
              <h3 className="font-bold">Contextual AI Coach</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition"><X size={20} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm prose-blue leading-relaxed max-w-none">
                      {m.content}
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="p-3 bg-white border-t border-gray-100 flex flex-wrap gap-2">
              {quickPrompts.map((qp, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(qp)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition border border-indigo-100"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden px-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none focus:outline-none p-3 text-sm"
              />
              <button 
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
