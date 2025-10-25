"use client"

import { Nav } from "./nav";
import { FileIcon, InboxIcon, SendIcon } from "lucide-react";

type sidebarProps = {
    isCollapsed: boolean,
    currentTab: string,
    onTabChange: (tab: string) => void
}

const Sidebar = ({ isCollapsed, currentTab, onTabChange }: sidebarProps) => {
    console.log("current tab: ", currentTab)
    return (
        <Nav
            isCollapsed={isCollapsed}
            currentTab={currentTab}
            onTabChange={onTabChange}
            links={[
                {
                    title: "Inbox",
                    label: '1',
                    icon: InboxIcon,
                    variant: currentTab === 'inbox' ? 'default' : 'ghost'
                },
                {
                    title: "Drafts",
                    label: '2',
                    icon: FileIcon,
                    variant: currentTab === 'drafts' ? 'default' : 'ghost',
                },
                {
                    title: "Sent",
                    label: '3',
                    icon: SendIcon,
                    variant: currentTab === 'sent' ? 'default' : 'ghost'
                }
            ]}
        />
    )
}

export default Sidebar