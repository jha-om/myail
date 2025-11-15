"use client"

import useThread from "@/hooks/use-thread";
import { format, formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import { Fragment, type ComponentProps } from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { searchValueAtom } from "./search-bar";

const ThreadList = () => {
    const { threads, threadId, setThreadId } = useThread();
    const [searchValue] = useAtom(searchValueAtom)

    const groupedThreads = threads?.reduce((acc, thread) => {
        const date = format(thread.emails[0]?.sentAt ?? new Date(), 'yyyy-MM-dd');
        acc[date] ??= [];
        acc[date].push(thread);
        return acc;
    }, {} as Record<string, typeof threads>)

    const filteredGroupedThreads = Object.entries(groupedThreads ?? {}).reduce((acc, [date, threads]) => {
        const filtered = threads.filter(thread => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();
            const matchesSubject = thread.subject?.toLowerCase().includes(searchLower) || false;
            
            // Check sender name or email
            const matchesFrom = 
                thread.emails[0]?.from.name?.toLowerCase().includes(searchLower) || 
                thread.emails[0]?.from.address?.toLowerCase().includes(searchLower) || 
                false;
            
            // Check body snippet
            const matchesBody = thread.emails[0]?.bodySnippet?.toLowerCase().includes(searchLower) || false;

            return matchesSubject || matchesFrom || matchesBody;
        });

        if (filtered.length > 0) {
            acc[date] = filtered;
        }
        return acc;
    }, {} as Record<string, typeof threads>);


    const hasResults = Object.keys(filteredGroupedThreads).length > 0;
    const isSearching = searchValue.length > 0;

    if (!threads || threads.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground">No emails found</p>
                    <p className="text-sm text-muted-foreground/60">
                        Your inbox is empty
                    </p>
                </div>
            </div>
        )
    }

    if (isSearching && !hasResults) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground">No results found</p>
                    <p className="text-sm text-muted-foreground/60">
                        Try searching with different keywords
                    </p>
                </div>
            </div>
        )
    }

    const displayThreads = isSearching ? filteredGroupedThreads : groupedThreads;

    return (
        <div className="max-w-full max-h-[calc(100vh-120px)]">
            <div className="flex flex-col gap-3 p-4 pt-0">
                {Object.entries(displayThreads ?? {}).map(([date, threads]) => {
                    return (
                        <Fragment key={date}>
                            <div className="text-xs font-medium text-muted-foreground mt-5 first:mt-0">
                                {date}
                            </div>
                            {threads?.map(thread => {
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