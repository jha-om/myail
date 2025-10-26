"use client"

import { useEffect, useState } from "react";
import { Nav } from "./nav";
import { FileIcon, InboxIcon, SendIcon } from "lucide-react";
import { api } from "@/trpc/react";

type sidebarProps = {
    isCollapsed: boolean,
    currentTab: string,
    onTabChange: (tab: string) => void
}

const Sidebar = ({ isCollapsed, currentTab, onTabChange }: sidebarProps) => {
    const [accountId, setAccountId] = useState<string>('');
    
    useEffect(() => {
        const storedAccountId = localStorage.getItem('accountId');
        if (storedAccountId) {
            setAccountId(storedAccountId);
        }
    }, []);

    const { data: inboxThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'inbox',
    }, {
        enabled: !!accountId,
    })
    const { data: draftThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'drafts',
    }, {
        enabled: !!accountId,
    })
    const { data: sentThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'sent',
    }, {
        enabled: !!accountId,
    })
    return (
        <Nav
            isCollapsed={isCollapsed}
            currentTab={currentTab}
            onTabChange={onTabChange}
            links={[
                {
                    title: "Inbox",
                    label: inboxThreads?.toString() ?? '0',
                    icon: InboxIcon,
                    variant: currentTab === 'inbox' ? 'default' : 'ghost'
                },
                {
                    title: "Drafts",
                    label: draftThreads?.toString() ?? '0',
                    icon: FileIcon,
                    variant: currentTab === 'drafts' ? 'default' : 'ghost',
                },
                {
                    title: "Sent",
                    label: sentThreads?.toString() ?? '0',
                    icon: SendIcon,
                    variant: currentTab === 'sent' ? 'default' : 'ghost'
                }
            ]}
        />
    )
}

export default Sidebar