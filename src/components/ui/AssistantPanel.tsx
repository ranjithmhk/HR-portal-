import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Bot, User as UserIcon, Minus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AssistantPanel: React.FC = () => {
  const { aiAssistantOpen, toggleAiAssistant, currentUser, tasks, leaveBalance } = useStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${currentUser.name.split(' ')[0]}! I'm your MHK AI Copilot. How can I assist you today?`,
      timestamp: 'Just now',
      suggestions: [
        'How many casual leaves do I have left?',
        'What are the core working hours at MHK?',
        'Summarize my focus tasks for today',
        'How do I file an expense reimbursement?',
      ],
    },
  ]);

  const handleSend = (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userText) setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let aiResponse = "I've logged your request. You can also view this in the respective portal section.";
      let suggestions: string[] | undefined = undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('leave') || lower.includes('casual') || lower.includes('balance')) {
        aiResponse = `You currently have ${leaveBalance.clTotal - leaveBalance.clUsed} Casual Leaves (CL) available out of ${leaveBalance.clTotal}, and ${leaveBalance.slTotal - leaveBalance.slUsed} Sick Leaves (SL) remaining out of ${leaveBalance.slTotal}. You can apply directly from Time → Leaves.`;
        suggestions = ['Apply for 1 day leave', 'View half-day leave policy', 'Show holiday calendar'];
      } else if (lower.includes('working hours') || lower.includes('hours') || lower.includes('shift') || lower.includes('late')) {
        aiResponse = `Standard office hours are 09:30 AM to 06:30 PM local office time (Mon–Fri). A minimum of 9 hours logged per day is required. Punches after 09:30 AM are flagged as Late arrivals.`;
        suggestions = ['How to request attendance correction?', 'Clock Out now'];
      } else if (lower.includes('task') || lower.includes('focus') || lower.includes('today')) {
        const userTasks = tasks.filter(t => t.assignedTo === currentUser.id && t.status !== 'Verified');
        aiResponse = `You have ${userTasks.length} pending tasks assigned. Top priority: "${userTasks[0]?.title || 'Architecture review'}" (Due: ${userTasks[0]?.dueDate || 'Today'}).`;
        suggestions = ['Open Work → Tasks', 'Mark task as Submitted'];
      } else if (lower.includes('expense') || lower.includes('claim') || lower.includes('reimburse')) {
        aiResponse = `To claim an expense, navigate to Finance & Docs → Expenses → "+ New Claim". Auto-detection will scan your uploaded receipt. Standard claims are processed within 3-5 business days.`;
        suggestions = ['What is the per diem limit?', 'View my submitted expenses'];
      } else if (lower.includes('h1b') || lower.includes('lca') || lower.includes('wage') || lower.includes('visa')) {
        aiResponse = `All specialty occupation foreign national teammates are compensated strictly in compliance with certified Department of Labor LCA prevailing wages. You can view your immigration records under Documents or submit a ticket via My Requests.`;
        suggestions = ['Download I-797 notice', 'Contact HR immigration lead'];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 450);
  };

  return (
    <>
      {/* Floating Copilot Trigger Button at Bottom Right */}
      {!aiAssistantOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAiAssistant}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 h-11 px-4 rounded-full hero-gradient text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none"
          aria-label="Open Copilot Assistant"
        >
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          <span>Copilot</span>
        </motion.button>
      )}

      {/* Sticky Floating Chat Window at Bottom Right */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-6rem)] rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
            aria-label="AI Assistant Panel"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-border bg-surface-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full hero-gradient flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-bold text-sm text-text">MHK Intelligence</h3>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" title="Online" />
                  </div>
                  <p className="text-[11px] text-text-secondary">AI Copilot · Ready to assist</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleAiAssistant}
                  className="p-1.5 text-text-tertiary hover:text-text rounded-md hover:bg-surface-muted transition-colors"
                  aria-label="Minimize assistant"
                  title="Minimize"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button
                  onClick={toggleAiAssistant}
                  className="p-1.5 text-text-tertiary hover:text-text rounded-md hover:bg-surface-muted transition-colors"
                  aria-label="Close assistant"
                  title="Close"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {msg.sender === 'ai' ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                        <span className="text-[11px] font-semibold text-primary">MHK AI</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold text-text-secondary">You</span>
                        <UserIcon className="w-3.5 h-3.5 text-text-secondary" strokeWidth={1.75} />
                      </>
                    )}
                    <span className="text-[10px] text-text-tertiary">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-surface-muted text-text border border-border rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                      {msg.suggestions.map((sugg, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sugg)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-primary-50 text-primary border border-primary-100 hover:bg-primary-100 dark:bg-primary-50/20 dark:border-primary-300/30 transition-colors text-left"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-surface">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  name="chat-input"
                  autoComplete="off"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about policies, leaves, tasks…"
                  aria-label="Ask about policies, leaves, or tasks"
                  className="flex-1 h-10 px-3 text-xs rounded-input border border-border bg-surface-muted focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-text placeholder:text-text-tertiary"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-input hero-gradient text-white flex items-center justify-center shrink-0 disabled:opacity-40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </form>
              <p className="text-[10px] text-text-tertiary text-center mt-2 tabular-nums">
                Confidential · Internal HR knowledge base v4.2
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
