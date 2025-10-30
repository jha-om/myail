"use client"

import useThread from "@/hooks/use-thread";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import { Separator } from "./ui/separator";
import EmailDisplay from "@/app/mail/_components/email-display";

const ThreadDisplay = () => {
    const { threadId, threads } = useThread();
    const thread = threads?.find(t => t.id === threadId);

    return (
        <div className="flex flex-col h-full">
            {thread ?
                <>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-none p-4 border-b">
                            <div className="text-2xl font-semibold mb-4">
                                {thread.emails[0]?.subject}
                            </div>
                            <div className="flex items-start gap-4 w-full">
                                <Avatar className="border border-black/60">
                                    <AvatarImage alt="avatar" />
                                    <AvatarFallback>
                                        {thread.emails[0]?.from.name?.split(' ').map(chunk => chunk[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="font-semibold">
                                        {thread.emails[0]?.from.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium">Reply-To: </span>
                                        {thread.emails[0]?.from.address}
                                    </div>
                                </div>
                                {thread.emails[0]?.sentAt && (
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {format(new Date(thread.emails[0].sentAt), 'PPpp')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="max-h-[calc(100vh-500px)] flex flex-col">
                            <div className="p-6 flex flex-col gap-4">
                                {thread.emails.map(email => {
                                    return (
                                        <EmailDisplay key={email.id} email={email} />
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex-1" />
                        <Separator className="ml-auto" />
                        {/* Reply box */}
                        Reply box
                    </div>
                </> : (
                    <>
                        <div className="flex-1 overflow-auto p-6">
                            <p className="text-muted-foreground text-sm text-center py-8">
                                Select an email to view details
                            </p>
                        </div>
                    </>
                )}
        </div >
    )
}

export default ThreadDisplay