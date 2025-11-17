import { db } from "@/server/db"
import { create, insert, search, type AnyOrama } from "@orama/orama"
import { persist, restore } from "@orama/plugin-data-persistence"
import { getEmbeddings } from "./embedding"

export class OramaClient {
    private orama!: AnyOrama
    private accountId: string

    constructor(accountId: string) {
        this.accountId = accountId
    }

    async saveIndex() {
        const index = await persist(this.orama, 'json');
        await db.account.update({
            where: {
                id: this.accountId,
            },
            data: {
                oramaIndex: index
            }
        })
    }
    async init() {
        const account = await db.account.findUnique({
            where: {
                id: this.accountId,
            }
        })

        if (!account) {
            throw new Error('Account not found');
        }

        if (account.oramaIndex) {
            this.orama = await restore('json', account.oramaIndex);
        } else {
            this.orama = create({
                schema: {
                    subject: "string",
                    body: "string",
                    rawBody: "string",
                    from: "string",
                    to: "string[]",
                    sentAt: "string",
                    threadId: "string",
                    embeddings: 'vector[1536]',
                }
            })
            await this.saveIndex();
        }
    }

    async vectorSearch({ term }: { term: string }) {
        const embeddings = await getEmbeddings(term);
        const results = await search(this.orama, {
            mode: 'hybrid',
            term,
            vector: {
                value: embeddings,
                property: 'embeddings'
            },
            similarity: 0.8,
            limit: 10,
        });
        return results;
    }

    async search({ term }: { term: string }) {
        return await search(this.orama, {
            term
        })
    }

    async insert(document: any) {
        await insert(this.orama, document);
        await this.saveIndex();
    }
}