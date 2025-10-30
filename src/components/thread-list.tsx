"use client"

import useThread from "@/hooks/use-thread";
import { format, formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import { Fragment, type ComponentProps } from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const ThreadList = () => {
    const { threads, threadId, setThreadId } = useThread();

    const groupedThreads = threads?.reduce((acc, thread) => {
        const date = format(thread.emails[0]?.sentAt ?? new Date(), 'yyyy-MM-dd');
        acc[date] ??= [];
        acc[date].push(thread);
        return acc;
    }, {} as Record<string, typeof threads>)
    return (
        <div className="max-w-full max-h-[calc(100vh-120px)]">
            <div className="flex flex-col gap-3 p-4 pt-0">
                {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
                    return (
                        <Fragment key={date}>
                            <div className="text-xs font-medium text-muted-foreground mt-5 first:mt-0">
                                {date}
                            </div>
                            {threads.map(thread => {
                                return (
                                    <button
                                        onClick={() => setThreadId(thread.id)}
                                        key={thread.id}
                                        className={cn('min-w-[200px] flex flex-col items-start gap-2 border p-3 text-left text-sm transition-all relative', {
                                            'bg-accent border border-black/40 shadow-[4.5px_4.5px_1px_rgba(0,0,0,0.5)] transition-all duration-400': thread.id === threadId
                                        })}
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
                                            <div className="text-xs font-medium">{thread.subject}</div>
                                        </div>
                                        <div
                                            className="text-xs line-clamp-2 text-muted-foreground"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(thread.emails.at(-1)?.bodySnippet ?? "", {
                                                    USE_PROFILES: { html: true }
                                                })
                                            }}
                                        />
                                        {
                                            thread.emails[0]?.sysLabels.length && (
                                                <div className="flex items-center gap-2">
                                                    {thread.emails[0].sysLabels.map(label => {
                                                        return (
                                                            <Badge
                                                                key={label}
                                                                variant={getBadgeVariantFromLable(label)}
                                                                className={'bg-gray-300/60'}
                                                            >
                                                                {label}
                                                            </Badge>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        }
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

function getBadgeVariantFromLable(label: string): ComponentProps<typeof Badge>['variant'] {
    if (['work'].includes(label.toLowerCase())) {
        return 'default';
    }
    return 'secondary';
}

export default ThreadList