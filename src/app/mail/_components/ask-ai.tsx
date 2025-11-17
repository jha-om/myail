'use client'

import useThread from "@/hooks/use-thread";
import { cn } from "@/lib/utils";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { SendIcon, SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";

const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
    // const messages: any[] = [];
    const { accountId } = useThread();
    const [input, setInput] = useState<string>("");

    const { messages, sendMessage, status } = useChat<UIMessage>({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: {
                accountId,
            }
        })
    });

    useEffect(() => {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            })
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim) {
            return;
        }
        sendMessage({
            text: input,
        });

        setInput("");
    }

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    }

    if (isCollapsed) {
        return null;
    }

    return (
        <div className="p-4 mb-12">
            <motion.div className="flex flex-1 flex-col items-end pb-4 rounded-lg bg-gray-100 shadow-inner dark:bg-gray-900">
                <div className="max-h-[50vh] overflow-y-scroll w-full flex flex-col gap-2" id="message-container">
                    <AnimatePresence mode="wait">
                        {messages.map(message => {
                            return (
                                <motion.div
                                    key={message.id}
                                    layout='position'
                                    className={cn('z-10 mt-2 max-w-[250px] wrap-break-word rounded-2xl bg-gray-200 dark:bg-gray-800', {
                                        'self-end text-gray-900 dark:text-gray-100': message.role === 'user',
                                        'self-start bg-blue-500 text-white': message.role === 'assistant'
                                    })}
                                    layoutId={`container-[${messages.length - 1}]`}
                                    transition={{
                                        ease: ["easeOut"],
                                        duration: 0.2,
                                    }}
                                >
                                    <div className="px-3 py-2 text-[15px] leading-[15px]">
                                        {message.parts.map((part, index) => {
                                            if (part.type === 'text') {
                                                return <span key={index}>{part.text}</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {messages.length > 0 && <div className="h-4"></div>}

                <div className="w-full">
                    {/* Suggestion chips when no messages */}
                    {messages.length === 0 && (
                        <div className="mb-4">
                            <div className='flex items-center gap-4'>
                                <SparklesIcon className='size-6 text-gray-500' />
                                <div>
                                    <p className='text-gray-900 dark:text-gray-100'>Ask AI anything</p>
                                    <p className='text-gray-500 text-xs dark:text-gray-400'>Get instant answers to your questions</p>
                                </div>
                            </div>
                            <div className="h-2"></div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    onClick={() => handleSuggestionClick('What can you help me with?')}
                                    className='px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs cursor-pointer hover:bg-gray-700'
                                >
                                    What can you help me with?
                                </span>
                                <span
                                    onClick={() => handleSuggestionClick('Summarize recent activity')}
                                    className='px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs cursor-pointer hover:bg-gray-700'
                                >
                                    Summarize recent activity
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full flex relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={status !== 'ready'}
                            className="py-1 relative h-9 placeholder:text-[13px] grow rounded-full border border-gray-200 bg-white px-3 text-[15px] outline-none focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 disabled:opacity-50"
                            placeholder="Ask AI"
                        />

                        {/* Animated bubble effect */}
                        <motion.div
                            key={messages.length}
                            layout='position'
                            layoutId={`container-[${messages.length}]`}
                            transition={{
                                ease: ["easeOut"],
                                duration: 0.2,
                            }} initial={{ opacity: 0.6, zIndex: -1 }}
                            animate={{ opacity: 0.6, zIndex: -1 }}
                            exit={{ opacity: 1, zIndex: 1 }}
                            className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-200 dark:bg-gray-800"
                        >
                            <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                                {input}
                            </div>
                        </motion.div>

                        <button
                            type="submit"
                            disabled={status !== 'ready'}
                            className="ml-2 flex size-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            <SendIcon className="size-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default AskAI