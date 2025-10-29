"use client"

import useThread from "@/hooks/use-thread";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { Fragment } from "react";

const ThreadList = () => {
    const { threads } = useThread();

    const groupedThreads = threads?.reduce((acc, thread) => {
        const date = format(thread.emails[0]?.sentAt ?? new Date(), 'yyyy-MM-dd');
        acc[date] ??= [];
        acc[date].push(thread);
        return acc;
    }, {} as Record<string, typeof threads>)
    return (
        <div className="max-w-full max-h-[calc(100vh-120px)]">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
                    return (
                        <Fragment key={date}>
                            <div className="text-xs font-medium text-muted-foreground mt-5 first:mt-0">
                                {date}
                            </div>
                            {threads.map(thread => {
                                return (
                                    <button
                                        key={thread.id}
                                        className={'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative'}
                                    >
                                        <div className="flex flex-col w-full gap-2">
                                            <div className="flex items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">
                                                        {thread.emails.at(-1)?.from.name}
                                                    </div>
                                                </div>
                                                <div className={'ml-auto text-xs'}>
                                                    {formatDistanceToNow(thread.emails.at(-1)?.sentAt ?? new Date(), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default ThreadList