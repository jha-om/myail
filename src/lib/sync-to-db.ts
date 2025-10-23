import { db } from "@/server/db";
import type { EmailMessage } from "@/types";
import pLimit from "p-limit";

// file where we will store the writing portion to db;
export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log(emails);
    // here we can use, simple batch processing, or p-limit library(that uses queue based approach)
    // we can write custom queue using bullmq;
    
    // for batch processing we can write like(written outside of this function);
    const limit = pLimit(10);
    try {
        await Promise.all(emails.map((email, index) => upsertEmail(email, accountId, index)));
    } catch (error) {
        
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
        const addressesToUpsert = new Map();
        for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
            addressesToUpsert.set(address.address, address);
        }
        
    } catch (error) {
        
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