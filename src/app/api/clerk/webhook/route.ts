import { db } from "@/server/db";
import type { WebhookEvent } from "@clerk/nextjs/server"

export const POST = async (req: Request) => {
    const { data, type } = await req.json() as WebhookEvent;

    if (type !== 'user.created' && type !== 'user.updated') {
        return new Response('Invalid request', { status: 200 });
    }

    const id = data.id;
    const email_address = data.email_addresses[0]?.email_address;
    const first_name = data.first_name;
    const last_name = data.last_name;
    const image_url = data.image_url;

    try {
        await db.user.create({
            data: {
                id,
                emailAddress: email_address!,
                firstName: first_name!,
                lastName: last_name!,
                imageUrl: image_url,
            }
        })
        return new Response('Webhook received', { status: 200 });
    } catch (error) {
        console.error('unable to add new user to db', error);
    }
}