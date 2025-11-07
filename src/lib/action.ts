"use server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from '@ai-sdk/rsc'

export async function generate(context: string, prompt: string) {
    const stream = createStreamableValue();

    void (async () => {
        const { textStream } = streamText({
            model: openai('gpt-4.1-mini-2025-04-14'),
            prompt: `
                You are a helpful AI embedded in a email client app that is used to answer questions about the emails in the inbox.

                AT THE MOMENT TIME IS ${new Date().toLocaleString()}

                USER PROMPT: ${prompt}

                START OF THE CONTEXT
                ${context}
                END OF THE CONTEXT

                When responsding, please keep these things in mind:
                - Be helpful, clever, and articulate.
                - Rely on the provided email context to inform your response.
                - If the context does not contain enough information to fully address the prompt, politely give a draft response and non-verbose.
                - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on your previous responses.
                - Do not invent or speculate about anything that is not directly supported by the email context.
                - Keep your response focused and relevant to the user's prompt.
                - Don't add fluff like 'Here's your email' or anything like that.
                - Directly output the email, no need to say 'Here is your email' or anything like that.
                - No need to output subject.
            `
        })
        for await (const token of textStream) {
            stream.update(token);
        }

        stream.done();
    })();

    return { output: stream.value };
}