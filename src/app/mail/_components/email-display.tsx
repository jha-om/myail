"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useThread from "@/hooks/use-thread";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

type Props = {
    email: RouterOutputs['account']['getThreads'][0]['emails'][0]
}

const EmailDisplay = ({ email }: Props) => {
    const { account } = useThread();
    const isMe = account?.emailAddress === email.from.address;
    const cleanEmailBody = DOMPurify.sanitize(email.body ?? "");
    return (
        <div className={cn(
            'border rounded-md p-4', {
            'border-l-gray-900 border-l-4': isMe
        }
        )}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center justify-between gap-2">
                    {!isMe && (
                        <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {email.from.name?.split(' ').map(chunk => chunk[0]).join('').slice(0, 1).toUpperCase() ?? email.from.address.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col">
                        <div className="font-semibold text-sm">
                            {isMe ? 'Me' : (email.from.name ?? email.from.address)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {email.from.address}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(email.sentAt ?? new Date(), {
                        addSuffix: true,
                    })}
                </p>
            </div>
            <div className="h-4" />
            <div className="bg-white rounded-md text-black">
                {parse(cleanEmailBody)}
            </div>
        </div>
    )
}

export default EmailDisplay