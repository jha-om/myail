import axios from "axios";
import type { SyncUpdatedResponse, SyncResponse, EmailMessage, EmailAddress } from "@/types";
import { db } from "@/server/db";
import { syncEmailsToDatabase } from "./sync-to-db";

export const AURINKO_URL = "https://api.aurinko.io";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async startSync() {
        const response = await axios.post<SyncResponse>(`${AURINKO_URL}/v1/email/sync`, {}, {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params: {
                daysWithin: 5,
                bodyType: "html",
            }
        });
        return response.data;
    }

    private async getUpdatedEmails({ deltaToken, pageToken }: { deltaToken?: string, pageToken?: string }) {
        const params: Record<string, string> = {};

        if (deltaToken) params.deltaToken = deltaToken;
        if (pageToken) params.pageToken = pageToken;

        const response = await axios.get<SyncUpdatedResponse>(`${AURINKO_URL}/v1/email/sync/updated`, {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params
        });
        return response.data;
    }
    async performInitialSync() {
        try {
            let syncResponse = await this.startSync();

            while (!syncResponse.ready) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                syncResponse = await this.startSync();
            }

            // get the last synced mailed reference token
            // meaning as daysWithin: 5, so it will sync 5 mails and then put a reference at the 6th mail
            // to ease in to identify the next set of batch to sync the mail
            let storedDeltaToken: string = syncResponse.syncUpdatedToken;

            // now we get the delta token, we should hit the sync email endpoint;
            let updatedEmailResponse = await this.getUpdatedEmails({ deltaToken: storedDeltaToken });

            if (updatedEmailResponse.nextDeltaToken) {
                // sync has completed;
                storedDeltaToken = updatedEmailResponse.nextDeltaToken;
            }

            let allEmails: EmailMessage[] = updatedEmailResponse.records;

            while (updatedEmailResponse.nextPageToken) {
                updatedEmailResponse = await this.getUpdatedEmails({ pageToken: updatedEmailResponse.nextPageToken });
                allEmails = allEmails.concat(updatedEmailResponse.records);
                if (updatedEmailResponse.nextDeltaToken) {
                    storedDeltaToken = updatedEmailResponse.nextDeltaToken;
                }
            }
            console.log("initial sync compelted, we have synced", allEmails.length, "emails");
            // store the latest delta token for future incremental syncs;
            return {
                emails: allEmails,
                deltaToken: storedDeltaToken,
            }


        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("error during sync: (axios issue) ", JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('error during sync: ', error)
            }
        }
    }

    async sendEmail({
        from, subject, body, inReplyTo, threadId, to, references, cc, bcc, replyTo
    }: {
        from: EmailAddress,
        subject: string,
        body: string,
        inReplyTo?: string,
        to: EmailAddress[],
        threadId?: string,
        references?: string,
        cc?: EmailAddress[],
        bcc?: EmailAddress[],
        replyTo?: EmailAddress,
    }) {
        try {
            const response = await axios.post<{ messageId: string }>(`${AURINKO_URL}/v1/email/messages`, {
                from,
                subject,
                body,
                inReplyTo,
                to,
                references,
                cc,
                threadId,
                bcc,
                replyTo: [replyTo]
            }, {
                params: {
                    returnIds: true,
                },
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            })

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle 401 (Unauthorized) specifically
                if (error.response?.status === 401) {
                    console.error("Authentication failed - token expired");
                    throw new Error("AUTH_EXPIRED");
                }

                console.error("Error sending email (Aurinko API):", {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data as unknown,
                    headers: error.response?.headers
                });
            } else {
                console.error('Error sending email:', error)
            }
            throw error;
        }
    }

    async syncEmails() {
        const account = await db.account.findUnique({
            where: {
                accessToken: this.token,
            }
        });
        if (!account) {
            throw new Error('Account not found');
        }
        if (!account.nextDeltaToken) {
            throw new Error('Account not ready for sync');
        }
        let response = await this.getUpdatedEmails({
            deltaToken: account.nextDeltaToken,
        });
        let storedDeltaToken = account.nextDeltaToken;
        let allEmails: EmailMessage[] = response.records;

        if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken;
        }

        try {
            await syncEmailsToDatabase(allEmails, account.id);
        } catch (error) {
            console.error('Error during sync: ', error);
        }
        await db.account.update({
            where: {
                id: account.id,
            },
            data: {
                nextDeltaToken: storedDeltaToken,
            }
        })

        while (response.nextPageToken) {
            response = await this.getUpdatedEmails({
                pageToken: response.nextPageToken,
            });
            allEmails = allEmails.concat(response.records);

            if (response.nextDeltaToken) {
                storedDeltaToken = response.nextDeltaToken;
            }
        }

        return {
            emails: allEmails,
            deltaToken: storedDeltaToken,
        }
    }
}