import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;
    
    const status = params.get('status');
    if (!status) {
        return NextResponse.json({
            message: "failed to link account"
        }, { status: 403 });
    }

    const code = params.get('code');
    if (!code) {
        return NextResponse.json({
            message: "no code was provided"
        }, { status: 411 });
    }

    const token = await exchangeCodeForAccessToken(code);
    if (!token) {
        return NextResponse.json({
            message: "failed to exchange code for access token"
        }, { status: 400 })
    }

    const accountDetails = await getAccountDetails(token.accessToken);

    await db.account.upsert({
        where: {
            id: token.accountId.toString(),
        },
        update: {
            accessToken: token.accessToken,
        },
        create: {
            id: token.accountId.toString(),
            userId,
            accessToken: token.accessToken,
            emailAddress: accountDetails.email,
            name: token.accessToken,
        }
    })
    return NextResponse.redirect(new URL('/mail', req.url));
}