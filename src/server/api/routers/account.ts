import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import z from "zod";

export const authorizeAccountAccess = async (accoundId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accoundId,
            userId
        },
        select: {
            id: true,
            emailAddress: true,
            name: true,
            accessToken: true,
        }
    });
    if (!account) {
        throw new Error("Unauthorized");
    }
    return account;
}

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ ctx }) => {
        return await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId
            },
            select: {
                id: true,
                emailAddress: true,
                name: true,
            }
        })
    }),
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authorizeAccountAccess(input.accountId, ctx.auth.userId);
        const filter: Prisma.ThreadWhereInput = {};

        if (input.tab === 'inbox') {
            filter.inboxStatus = true;
        } else if (input.tab === 'drafts') {
            filter.draftStatus = true;
        } else if (input.tab === 'sent') {
            filter.sentStatus = true;
        }
        return await ctx.db.thread.count({
            where: {
                accountId: account.id,
                // we can do below one also rather than calling prismathreadinput;
                // inboxStatus: input.tab === 'inbox' ? true : false,
                // draftStatus: input.tab === 'draft' ? true : false,
                // sentStatus: input.tab === 'sent' ? true : false,
                ...filter
            }
        })
    }),
    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
    })).query(async ({ ctx, input }) => {
        const account = await authorizeAccountAccess(input.accountId, ctx.auth.userId);
        const filter: Prisma.ThreadWhereInput = {};

        if (input.tab === 'inbox') {
            filter.inboxStatus = true;
        } else if (input.tab === 'drafts') {
            filter.draftStatus = true;
        } else if (input.tab === 'sent') {
            filter.sentStatus = true;
        }

        filter.done = {
            equals: input.done
        };
        return await ctx.db.thread.findMany({
            where: {
                accountId: account.id,
                ...filter
            },
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'asc'
                    },
                    select: {
                        from: true,
                        body: true,
                        bodySnippet: true,
                        emailLabel: true,
                        subject: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true,
                    }
                }
            },
            take: 15,
            orderBy: {
                lastMessageDate: 'desc'
            }
        })
    })
})