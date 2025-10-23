import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";

interface idProps {
    accountId: string,
    userId: string,
}

export const POST = async (req: NextRequest) => {
    const { accountId, userId } = await req.json() as idProps;
    if (!accountId || !userId) {
        return NextResponse.json({
            error: "missing accountId, or userId",
        }, { status: 411 });
    }

    const dbAccount = await db.account.findUnique({
        where: {
            id: accountId,
            userId
        }
    })

    if (!dbAccount) {
        return NextResponse.json({
            error: "Account not found",
        }, { status: 400 });
    }

    // now send the user accesstoken to aurinko to sync the mails
    // after syncing is done, store into the db;
    const account = new Account(dbAccount.accessToken);
    const response = await account.performInitialSync();

    if (!response) {
        return NextResponse.json({
            error: "failed to perform initial sync"
        }, { status: 500 });
    }

    const { emails, deltaToken } = response;
    // await db.account.update({
    //     where: {
    //         id: accountId
    //     },
    //     data: {
    //         nextDeltaToken: deltaToken,
    //     }
    // })
    
    // // now store these emails in db;
    // await syncEmailsToDatabase(emails);
    console.log("emails: ", emails);
    console.log("sync completed", deltaToken);
    return NextResponse.json({ success: true }, { status: 200 });
}