"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { generate } from "@/lib/action";
import { readStreamableValue } from "@ai-sdk/rsc";
import { BotIcon, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
    isComposing: boolean;
    onGenerate: (token: string) => void;
}

const AICompose = ({ isComposing, onGenerate }: Props) => {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const myailAIGenerate = async () => {
        setIsGenerating(true);
        try {
            const { output } = await generate('', prompt);
            for await (const token of readStreamableValue(output)) {
                if (token) {
                    console.log(token);
                    onGenerate(token as string);
                }
            }
            setOpen(false);
            setPrompt('');
        } catch (error) {
            console.error('Error generating email:', error);
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="outline-none border-none focus:outline-none focus:border-none" asChild>
                <Button
                    size={'icon'}
                    className="bg-transparent border-none hover:bg-transparent hover:border-none cursor-pointer hover:scale-125 transition-all duration-200"
                >
                    <BotIcon className="size-5 text-black dark:text-white" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Myailer AI</DialogTitle>
                    <DialogDescription>
                        Myailer AI will help you compose your email.
                    </DialogDescription>
                    <div className="h-2" />
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Write something how you want AI to compose your email."
                        disabled={isGenerating}
                        rows={6}
                    />
                    <div className="h-2" />
                    <Button 
                        onClick={myailAIGenerate}
                        disabled={isGenerating || !prompt.trim()}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate'
                        )}
                    </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default AICompose