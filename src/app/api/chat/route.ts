import { OramaClient } from '@/lib/orama';
import { openai } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        console.log("body: ", body);
        const { messages, accountId } = body;
        
        const orama = new OramaClient(accountId);

        await orama.init();

        const lastMessage = messages[messages.length - 1];
        console.log("lastmessage: ", lastMessage);
        // const context = await orama.vectorSearch({ term: lastMessage.})
        // console.log("messages: ", messages);

        const result = streamText({
            model: openai('gpt-4.1-mini-2025-04-14'),
            system: 'You are a helpful assistant.',
            messages: convertToModelMessages(messages),
        });
        console.log("result: ", result);
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.log("error while requesting openai api: ", error);
        throw error;
    }
}