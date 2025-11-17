'use client'

import useThread from "@/hooks/use-thread";
import { cn } from "@/lib/utils";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, SendIcon, SparklesIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const { accountId } = useThread();
    const [input, setInput] = useState<string>("");

    const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: {
                accountId,
            }
        }),
        onError: (error) => {
            console.error('Chat error:', error);
            toast.error('Failed to send message. Please try again.');
        }
    });

    // Auto-scroll to latest message
    useEffect(() => {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) {
            return;
        }
        sendMessage({
            text: input,
        });
        setInput("");
    }

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        // Auto-submit after setting input
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                form.requestSubmit();
            }
        }, 50);
    }

    const handleClearConversation = () => {
        setMessages([]);
        toast.success('Conversation cleared');
    }

    if (isCollapsed) {
        return null;
    }

    return (
        <div className="p-4">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 blur-md opacity-75 rounded-full" />
                        <div className="relative bg-linear-to-br from-primary to-primary/80 p-2 rounded-full">
                            <SparklesIcon className="size-4 text-primary-foreground" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Ask AI</h3>
                        <p className="text-xs text-muted-foreground">Get instant answers about your emails</p>
                    </div>
                </div>
                
                {messages.length > 0 && (
                    <button
                        onClick={handleClearConversation}
                        className="p-2 rounded-lg hover:bg-muted transition-colors group"
                        title="Clear conversation"
                    >
                        <Trash2 className="size-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </button>
                )}
            </div>

            {/* Chat Container */}
            <motion.div 
                className={cn(
                    "flex flex-col border rounded-lg bg-card shadow-sm transition-all",
                    messages.length > 0 ? "min-h-[300px]" : "min-h-[120px]"
                )}
            >
                {/* Messages Area */}
                <div 
                    className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] scroll-smooth"
                    id="message-container"
                >
                    {messages.length === 0 ? (
                        // Empty State with Suggestions
                        <div className="flex flex-col items-center justify-center h-full space-y-4 py-6">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 blur-xl opacity-75" />
                                        <SparklesIcon className="size-12 text-primary relative" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-foreground">What can I help you with?</p>
                                <p className="text-xs text-muted-foreground max-w-[250px]">
                                    Ask me anything about your emails, meetings, or schedule
                                </p>
                            </div>

                            {/* Suggestion Chips */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
                                {[
                                    'When is my next flight?',
                                    'Summarize today\'s emails',
                                    'When is my next meeting?',
                                    'What can I ask?'
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs rounded-full border transition-all",
                                            "bg-background hover:bg-accent hover:border-primary/50",
                                            "text-muted-foreground hover:text-foreground",
                                            "hover:shadow-md hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Messages Display
                        <AnimatePresence mode="wait">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    layout="position"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        'flex w-full',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-foreground border'
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap wrap-break-word">
                                            {message.parts.map((part, index) => {
                                                if (part.type === 'text') {
                                                    return <span key={index}>{part.text}</span>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Loading Indicator */}
                    {status === 'in_progress' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-muted border">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t bg-muted/30 p-3">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1 group">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl" />
                            
                            {/* Input Field */}
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={status === 'in_progress'}
                                className={cn(
                                    "relative w-full px-4 py-2.5 rounded-lg border bg-background text-sm",
                                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all",
                                    "placeholder:text-muted-foreground/60",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                placeholder="Ask anything about your emails..."
                                autoComplete="off"
                            />

                            {/* Animated Input Preview */}
                            {input && (
                                <motion.div
                                    key={messages.length}
                                    layout="position"
                                    layoutId={`container-[${messages.length}]`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 0, scale: 0.95 }}
                                    exit={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="pointer-events-none absolute left-0 top-0 right-12 z-10 flex items-center px-4 py-2.5 overflow-hidden rounded-lg bg-primary/10 backdrop-blur-sm"
                                >
                                    <span className="text-sm text-foreground truncate">
                                        {input}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === 'in_progress' || !input.trim()}
                            className={cn(
                                "relative flex items-center justify-center rounded-lg transition-all",
                                "h-10 w-10 shrink-0",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                input.trim() && status !== 'in_progress'
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 active:scale-95"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {status === 'in_progress' ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <SendIcon className="size-4" />
                            )}
                        </button>
                    </form>

                    {/* Helper Text */}
                    {messages.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Press <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">Enter</kbd> to send
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default AskAI