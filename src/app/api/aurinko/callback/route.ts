import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions"
import axios from "axios";

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
    
    // Check if this email address is already linked to this user
    const existingAccount = await db.account.findFirst({
        where: {
            userId,
            emailAddress: accountDetails.email
        }
    });

    if (existingAccount) {
        // Account already exists, redirect with error message
        return NextResponse.redirect(
            new URL('/mail?error=account_already_exists', req.url)
        );
    }

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
            name: accountDetails.name,
        }
    })

    // trigger initial sync endpoint;
    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId,
        }).then(response => {
            console.log('initial sync triggered', response.data);
        }).catch(error => {
            console.error('failed to trigger initial sync', error);
        })
    )
    
    return NextResponse.redirect(new URL('/mail?success=account_linked', req.url));
}