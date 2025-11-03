"use client"

import EmailDisplay from "@/app/mail/_components/email-display";
import ReplyBox from "@/app/mail/_components/reply-box";
import useThread from "@/hooks/use-thread";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const ThreadDisplay = () => {
    const { threadId, threads } = useThread();
    const thread = threads?.find(t => t.id === threadId);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {thread ? (
                <>
                    <div className="shrink-0 p-4 border-b bg-background">
                        <div className="text-xl font-bold mb-3">
                            {thread.subject}
                        </div>
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage alt="avatar" />
                                <AvatarFallback>
                                    {thread.emails[0]?.from.name?.split(' ').map(chunk => chunk[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="font-semibold text-sm">
                                    {thread.emails[0]?.from.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    Reply-To: {thread.emails[0]?.from.address}
                                </div>
                            </div>
                            {thread.emails[0]?.sentAt && (
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(thread.emails[0].sentAt), 'PPp')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="p-4 space-y-3">
                            {thread.emails.map((email) => (
                                <EmailDisplay key={email.id} email={email} />
                            ))}
                        </div>
                    </div>
                    <div className="shrink-0 border-t bg-background px-2">
                        <ReplyBox />
                    </div>
                </>
            ) : (
                <div className="flex-1 overflow-auto p-6">
                    <p className="text-muted-foreground text-sm text-center py-8">
                        Select an email to view details
                    </p>
                </div>
            )}
        </div>
    )
}

export default ThreadDisplay