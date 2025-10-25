import { db } from "@/server/db";
import type { EmailAddress, EmailAttachment, EmailMessage } from "@/types";
import { Prisma } from "@prisma/client";
import pLimit from "p-limit";

// file where we will store the writing portion to db;
export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log(emails);
    // here we can use, simple batch processing, or p-limit library(that uses queue based approach)
    // we can write custom queue using bullmq;

    // for batch processing we can write like(written outside of this function);
    const limit = pLimit(2);
    try {
        // await Promise.all(emails.map((email, index) => upsertEmail(email, accountId, index)));
        for (const email of emails) {
            await upsertEmail(email, accountId, 0);
        }
    } catch (error) {
        console.log('error', error);
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log("upserting emails", index);
    try {
        let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox';
        if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
            emailLabelType = 'inbox';
        } else if (email.sysLabels.includes('sent')) {
            emailLabelType = 'sent';
        } else if (email.sysLabels.includes('draft')) {
            emailLabelType = 'draft'
        }

        // now if the email exists, we add the thread to that email
        // else we add this new email to start making the thread;
        const addressesToUpsert = new Map<string, EmailAddress>();
        for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
            addressesToUpsert.set(address.address, address);
        }

        const upsertedAddresses: (Awaited<ReturnType<typeof upsertEmailAddress>>)[] = [];

        for (const address of addressesToUpsert.values()) {
            const upsertAddress = await upsertEmailAddress(address, accountId);
            upsertedAddresses.push(upsertAddress);
        }

        const addressMap = new Map(
            upsertedAddresses.filter(Boolean).map(address => [address?.address, address])
        );

        const fromAddress = addressMap.get(email.from.address);
        if (!fromAddress) {
            console.log(`failed to upsert from address for email ${email.bodySnippet}`);
            return;
        }

        const toAddress = email.to.map(address => addressMap.get(address.address)).filter(Boolean);
        const ccAddress = email.cc.map(address => addressMap.get(address.address)).filter(Boolean);
        const bccAddress = email.bcc.map(address => addressMap.get(address.address)).filter(Boolean);
        const replyToAddress = email.replyTo.map(address => addressMap.get(address.address)).filter(Boolean);

        // upsert thread;
        const thread = await db.thread.upsert({
            where: {
                id: email.threadId,
            },
            update: {
                subject: email.subject,
                accountId,
                lastMessageDate: new Date(email.sentAt),
                done: false,
                participantIds: [...new Set([
                    fromAddress.id,
                    ...toAddress.map(a => a?.id),
                    ...ccAddress.map(a => a?.id),
                    ...bccAddress.map(a => a?.id),
                ].filter((id): id is string => id !== undefined))]
            },
            create: {
                id: email.threadId,
                accountId,
                subject: email.subject,
                done: false,
                draftStatus: emailLabelType === "draft",
                inboxStatus: emailLabelType === "inbox",
                sentStatus: emailLabelType === "sent",
                lastMessageDate: new Date(email.sentAt),
                participantIds: [...new Set([
                    fromAddress.id,
                    ...toAddress.map(a => a?.id),
                    ...ccAddress.map(a => a?.id),
                    ...bccAddress.map(a => a?.id),
                ].filter((id): id is string => id !== undefined))],

            }
        })

        // upsert email
        await db.email.upsert({
            where: { id: email.id },
            update: {
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { set: toAddress.map(a => ({ id: a!.id })) },
                cc: { set: ccAddress.map(a => ({ id: a!.id })) },
                bcc: { set: bccAddress.map(a => ({ id: a!.id })) },
                replyTo: { set: replyToAddress.map(a => ({ id: a!.id })) },
                hasAttachments: email.hasAttachments,
                internetHeaders: email.internetHeaders as any,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties,
                folderId: email.folderId,
                omitted: email.omitted,
                emailLabel: emailLabelType,
            },
            create: {
                id: email.id,
                emailLabel: emailLabelType,
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                internetHeaders: email.internetHeaders as any,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { connect: toAddress.map(a => ({ id: a?.id })) },
                cc: { connect: ccAddress.map(a => ({ id: a?.id })) },
                bcc: { connect: bccAddress.map(a => ({ id: a?.id })) },
                replyTo: { connect: replyToAddress.map(a => ({ id: a?.id })) },
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties,
                folderId: email.folderId,
                omitted: email.omitted,
            }
        });

        const threadEmails = await db.email.findMany({
            where: {
                threadId: thread.id,
            },
            orderBy: {
                receivedAt: 'asc'
            }
        });

        let threadFolderType = 'sent';
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === 'inbox') {
                threadFolderType = 'inbox';
                break;
                // if any email is in inbox, then whole  thread must be in inbox;
            } else if (threadEmail.emailLabel === 'draft') {
                threadFolderType = 'draft'
                // if any email is in draft, then whole  thread must be in draft;
            }
        }

        await db.thread.update({
            where: {
                id: thread.id
            },
            data: {
                draftStatus: threadFolderType === 'draft',
                inboxStatus: threadFolderType === 'inbox',
                sentStatus: threadFolderType === 'sent',
            }
        });

        // upsert attachments
        for (const attachment of email.attachments) {
            await upsertAttachment(email.id, attachment);
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(`Prisma error for email ${email.id}: ${error.message}`);
        } else {
            console.log(`Unknown error for email ${email.id}: ${String(error)}`);
        }
    }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
    try {
        await db.emailAttachment.upsert({
            where: { id: attachment.id ?? "" },
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
            create: {
                id: attachment.id,
                emailId,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
        });
    } catch (error) {
        console.log(`Failed to upsert attachment for email ${emailId}: ${String(error)}`);
    }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: {
                accountId_address: {
                    accountId,
                    address: address.address ?? ""
                }
            }
        });

        if (existingAddress) {
            return await db.emailAddress.update({
                where: {
                    id: existingAddress.id
                },
                data: {
                    name: address.name,
                    raw: address.raw,
                }
            })
        } else {
            return await db.emailAddress.create({
                data: {
                    address: address.address ?? "",
                    name: address.name,
                    raw: address.raw,
                    accountId,
                }
            })
        }
    } catch (error) {
        console.log("failed to upsert email address", error);
        return null;
    }
}

/**
 * async function processConcurrently(emails, concurrentLimit = 10) {
 *      let fewEmails = [];
 *      for(let i=0;i<=emails.length;i+=concurrencyLimit) {
 *          const batch = emails.slice(i, i+concurrencyLimit);
 *          const batchResults = await Promise.all(
 *              batch.map(email => saveToDB(email));
 *          )
 *          fewEmails(...batchResults);
 *      };
 *      return fewEmails;
 * }
 * 
 */