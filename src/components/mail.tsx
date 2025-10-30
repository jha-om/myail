"use client"

import ThreadDisplayUpper from "@/app/mail/_components/thread-display-upper";
import AccountSwitcher from "@/components/account-switcher";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "./sidebar";
import ThreadList from "./thread-list";
import ThreadDisplay from "./thread-display";

type mailProps = {
    defaultLayout: number[] | undefined,
    navCollapsedSize: number,
    defaultCollapse: boolean
}
const MailComponent = ({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapse }: mailProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapse);
    const [tab, setTab] = useState<string>('inbox');
    const searchParams = useSearchParams();


    useEffect(() => {
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        if (error === 'account_already_exists') {
            toast.error("Account Already Exists", {
                description: "This email account is already linked to your profile.",
            });
        } else if (success === 'account_linked') {
            toast.success("Account Linked Successfully", {
                description: "Your email account has been connected.",
            });
        }

        if (error || success) {
            window.history.replaceState({}, '', '/mail');
        }
    }, [searchParams]);

    useEffect(() => {
        const storedTab = localStorage.getItem('myail-tab');
        if (storedTab) {
            setTab(storedTab);
        }
    }, []);

    const handleTabChange = (newTab: string) => {
        setTab(newTab);
        localStorage.setItem('myail-tab', newTab);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                className="h-screen max-h-screen w-full overflow-hidden"
            >
                {/* Sidebar Panel */}
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={25}
                    onCollapse={() => setIsCollapsed(true)}
                    onResize={() => setIsCollapsed(false)}
                    className={cn(
                        "transition-all duration-300 ease-in-out",
                        isCollapsed && "min-w-[50px]"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Account Switcher - Match height with email panel header */}
                        <div className={cn(
                            "flex items-center h-[52px] border-b",
                            isCollapsed ? "justify-center" : "px-6 justify-center"
                        )}>
                            <AccountSwitcher isCollapsed={isCollapsed} />
                        </div>

                        {/* Navigation */}
                        <Sidebar
                            isCollapsed={isCollapsed}
                            currentTab={tab}
                            onTabChange={handleTabChange}
                        />

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Ask AI Button */}
                        <div className="border-t flex items-center justify-center p-1.5">
                            <button className={cn(
                                "w-full bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors font-medium",
                                isCollapsed ? "h-10 w-10 rounded-full text-xs" : "h-10 text-sm"
                            )}>
                                {isCollapsed ? "AI" : "Ask AI"}
                            </button>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Email List Panel */}
                <ResizablePanel
                    defaultSize={defaultLayout[1]}
                    minSize={30}
                    maxSize={50}
                >
                    <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col h-full">
                        {/* Header - Match height with sidebar */}
                        <div className="flex items-center justify-between h-[52px] px-6 border-b">
                            <h1 className="text-xl font-bold capitalize">{tab}</h1>
                            <TabsList>
                                <TabsTrigger value="inbox">
                                    Inbox
                                </TabsTrigger>
                                <TabsTrigger value="done">
                                    Done
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Search Bar */}
                        <div className="px-6 py-3 border-b">
                            <input
                                type="search"
                                placeholder="Search emails..."
                                className="w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none"
                            />
                        </div>

                        {/* Email List Content */}
                        <TabsContent value="inbox" className="flex-1 overflow-auto m-0">
                            {/* <div className="p-4">
                                <p className="text-muted-foreground text-sm text-center py-8">
                                    No emails in inbox
                                </p>
                            </div> */}
                            <ThreadList />
                        </TabsContent>
                        <TabsContent value="done" className="flex-1 overflow-auto m-0">
                            {/* <div className="p-4">
                                <p className="text-muted-foreground text-sm text-center py-8">
                                No completed emails
                                </p>
                                </div> */}
                            <ThreadList />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Thread Detail Panel */}
                <ResizablePanel
                    defaultSize={defaultLayout[2]}
                    minSize={30}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between h-[52px] px-6 border-b">
                            <ThreadDisplayUpper />
                        </div>
                        <ThreadDisplay />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}

export default MailComponent