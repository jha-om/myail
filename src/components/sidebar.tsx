"use client"
import useThread from "@/hooks/use-thread"
import { api } from "@/trpc/react"
import { FileIcon, InboxIcon, SendIcon } from "lucide-react"
import { Nav } from "./nav"

type Props = {
    isCollapsed: boolean,
    currentTab: string,
    onTabChange: (tab: string) => void
}

const Sidebar = ({ isCollapsed, currentTab, onTabChange }: Props) => {
    const { accountId } = useThread();

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
                    variant: currentTab === 'inbox' ? 'default' : 'ghost',
                    tab: 'inbox'  // Add this
                },
                {
                    title: "Drafts",
                    label: draftThreads?.toString() ?? '0',
                    icon: FileIcon,
                    variant: currentTab === 'drafts' ? 'default' : 'ghost',
                    tab: 'drafts'  // Add this
                },
                {
                    title: "Sent",
                    label: sentThreads?.toString() ?? '0',
                    icon: SendIcon,
                    variant: currentTab === 'sent' ? 'default' : 'ghost',
                    tab: 'sent'  // Add this
                }
            ]}
        />
    )
}

export default Sidebar