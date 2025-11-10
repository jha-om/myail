"use client"

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Text } from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { useState } from "react";
import AICompose from "./ai-compose";
import EditorMenubar from "./editor-menubar";
import TagInput from "./tag-input";
import { generate } from "@/lib/action";
import { readStreamableValue } from "@ai-sdk/rsc";
import useThread from "@/hooks/use-thread";
import { turndown } from "@/lib/turndown";

type Props = {
    subject: string,
    setSubject: (value: string) => void,

    toValues: { label: string, value: string }[],
    setToValues: (value: { label: string, value: string }[]) => void,

    ccValues: { label: string, value: string }[],
    setCcValues: (value: { label: string, value: string }[]) => void,

    to: string[],

    handleSend: (value: string) => void;
    isSending: boolean;

    defaultExpanded: boolean;
}


const EmailEditor = ({ subject, setSubject, ccValues, defaultExpanded, handleSend, isSending, setCcValues, setToValues, to, toValues }: Props) => {
    const [value, setValue] = useState<string>('')
    const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const { threads, threadId, account } = useThread();
    const thread = threads?.find(t => t.id === threadId);

    const customText = Text.extend({
        addKeyboardShortcuts() {
            return {
                'Mod-Space': ({ editor }) => {
                    // Access editor from the shortcut context
                    void aiGenerate(editor);
                    return true;
                }
            }
        }
    })
    
    const editor = useEditor({
        autofocus: false,
        extensions: [StarterKit.configure({
            heading: {
                levels: [1, 2, 3, 4, 5, 6],
            }
        }), customText],
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML());
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4',
            },
        },
        editable: true,
    })

    const aiGenerate = async (editorInstance: typeof editor) => {
        if (isGenerating || !editorInstance) {
            return;
        }
        
        setIsGenerating(true);
        
        try {
            // Build context from the email thread
            let context = '';
            
            // Add thread context if available (limit to last 3 emails)
            if (thread && thread.emails.length > 0) {
                const recentEmails = thread.emails.slice(-3);
                context += '=== EMAIL THREAD HISTORY ===\n';
                for (const email of recentEmails) {
                    const emailBody = turndown.turndown(email.body ?? email.bodySnippet ?? "");
                    const content = `
From: ${email.from.name ?? email.from.address}
Sent: ${new Date(email.sentAt).toLocaleString()}
Subject: ${email.subject}
Body: ${emailBody.slice(0, 500)}${emailBody.length > 500 ? '...' : ''}
---
`;
                    context += content;
                }
            }
            
            // Add current email context
            context += '\n=== CURRENT EMAIL DETAILS ===\n';
            context += `I am: ${account?.name ?? 'User'} (${account?.emailAddress})\n`;
            context += `Sending to: ${to.join(', ')}\n`;
            if (ccValues.length > 0) {
                context += `CC: ${ccValues.map(c => c.value).join(', ')}\n`;
            }
            if (subject) {
                context += `Subject: ${subject}\n`;
            }
            
            // Add current draft content
            const currentText = editorInstance.getText();

            // Create a smart prompt based on current state
            let prompt = '';
            const textLength = currentText.trim().length;
            
            if (textLength <= 0) {
                prompt = 'Write a natural email opening. Start directly with content (e.g., "Hi [name]," or appropriate greeting). Keep it brief and relevant. Continue this email naturally.Add 1 - 2 sentences that flow from what I\'ve written. Be specific and relevant. Don\'t repeat existing text.';
            } else {
                prompt = `Write a brief, natural closing for this email (1-2 sentences) with account name ${account?.name}. Then add appropriate sign-off.`;
            }

            const { output } = await generate(context, prompt);
            
            for await (const token of readStreamableValue(output)) {
                if (token && editorInstance) {
                    editorInstance.commands.insertContent(token as string);
                }
            }

        } catch (error) {
            console.error('Error generating email:', error);
        } finally {
            setIsGenerating(false);
        }
    }
    
    const handleOnGenerate = (token: string) => {
        if (editor) {
            editor.commands.insertContent(token);
        }
    }
    
    return (
        <div>
            {editor && <EditorMenubar editor={editor} />}

            <div className="p-4 pb-0 space-y-2">
                <div 
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden space-y-2">
                        <TagInput
                            label="To"
                            onChange={setToValues}
                            placeholder="Add Recipients"
                            value={toValues}
                        />
                        <TagInput
                            label="Cc"
                            onChange={setCcValues}
                            placeholder="Add Recipients"
                            value={ccValues}
                        />
                        <Input 
                            className="focus:outline-none focus:border-none" 
                            id="subject" 
                            placeholder="Subject" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        className="cursor-pointer flex items-center gap-2 hover:opacity-70 transition-opacity"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span className="text-green-600 font-medium">
                            Draft {" "}
                        </span>
                        <span className="text-sm">
                            to {to.join(', ')}
                        </span>
                        {expanded ? (
                            <ChevronUp className="h-4 w-4 transition-transform" />
                        ) : (
                            <ChevronDown className="h-4 w-4 transition-transform" />
                        )}
                    </button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <AICompose isComposing={defaultExpanded} onGenerate={handleOnGenerate} />
                </div>
            </div>

            <div className="max-h-[100px] sm:max-h-[200px] lg:max-h-[300px] overflow-y-auto min-h-[100px]">
                <EditorContent editor={editor} value={value} />
            </div>
            <div className="py-1 px-2 flex items-center justify-between border-t">
                <span className="text-sm">
                    <span className="font-bold">Tip: </span>Press {" "}
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                        Cmd/Ctrl + Space
                    </kbd> {" "}
                    for AI autocomplete
                    {isGenerating && <span className="ml-2 text-muted-foreground">(Generating...)</span>}
                </span>
                <div className="border border-black/25 bg-transparent p-1.5 rounded-lg">
                    <button
                        onClick={() => {
                            editor?.commands.clearContent();
                            handleSend(value)
                        }}
                        disabled={isSending}
                        className="flex items-center justify-center hover:rotate-45 transition-all duration-300">
                        <Send />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmailEditor