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
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./compose-button";
import SearchBar from "./search-bar";

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

    useEffect(() => {
        const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
            setTab(event.detail.tab);
        }

        window.addEventListener('tab-change', handleTabChange as EventListener);

        return () => {
            window.removeEventListener('tab-change', handleTabChange as EventListener)
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
                    <div className="flex flex-col h-full bg-linear-to-b from-background to-muted/20">
                        {/* Account Switcher - Match height with email panel header */}
                        <div className={cn(
                            "flex items-center h-[52px] border-b bg-background/50 backdrop-blur-sm",
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

                        <div className="w-auto h-px bg-linear-to-r from-transparent via-border to-transparent mx-4" />

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* User Actions Section - Enhanced Design */}
                        <div className={cn(
                            "p-3 space-y-3 bg-linear-to-t from-background/80 to-transparent backdrop-blur-sm",
                            isCollapsed && "p-2"
                        )}>
                            {/* User Profile & Compose Container */}
                            <div className={cn(
                                "rounded-xl bg-card/50 backdrop-blur-md border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 hover:shadow-xl hover:border-border",
                                isCollapsed ? "p-2 flex flex-col gap-2 items-center" : "p-3"
                            )}>
                                {/* Expanded State - Same Row */}
                                {!isCollapsed && (
                                    <div className="flex items-center gap-3">
                                        {/* User Info Section */}
                                        <div className="relative group">
                                            <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-primary/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative ring-2 ring-background rounded-full">
                                                <UserButton
                                                    appearance={{
                                                        elements: {
                                                            avatarBox: "w-9 h-9"
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Compose Button - Flex 1 to take remaining space */}
                                        <div className="flex-1 relative group">
                                            <div className="absolute inset-0 rounded-lg bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                            <div className="relative">
                                                <ComposeButton isCollapsed={false} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Collapsed State - Two Rows */}
                                {isCollapsed && (
                                    <>
                                        {/* First Row: Compose Button */}
                                        <div className="relative group w-full">
                                            <div className="absolute inset-0 rounded-lg bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                            <div className="relative">
                                                <ComposeButton isCollapsed={true} />
                                            </div>
                                        </div>

                                        {/* Second Row: User Profile */}
                                        <div className="relative group">
                                            <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-primary/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative ring-2 ring-background rounded-full">
                                                <UserButton
                                                    appearance={{
                                                        elements: {
                                                            avatarBox: "w-9 h-9"
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Ask AI Button - Enhanced */}
                        <div className="border-t bg-background/50 backdrop-blur-sm">
                            <div className="p-3">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/30 to-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button className={cn(
                                        "relative w-full bg-linear-to-r from-primary to-primary/90 rounded-lg text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]",
                                        isCollapsed ? "h-10 w-10 rounded-full text-xs mx-auto flex items-center justify-center" : "h-11 text-sm flex items-center justify-center gap-2"
                                    )}>
                                        {isCollapsed ? (
                                            <span className="text-xs">AI</span>
                                        ) : (
                                            <>
                                                <span>Ask AI</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
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
                    {/* Show Tabs only for inbox (inbox/done toggle) */}
                    {tab === 'inbox' || tab === 'done' ? (
                        <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col h-full">
                            {/* Header - Match height with sidebar */}
                            <div className="flex items-center justify-between h-[52px] px-6 border-b bg-background/50 backdrop-blur-sm">
                                <h1 className="text-xl font-bold capitalize bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Inbox
                                </h1>
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
                            <SearchBar />

                            {/* Email List Content */}
                            <TabsContent value="inbox" className="flex-1 overflow-auto m-0">
                                <ThreadList />
                            </TabsContent>
                            <TabsContent value="done" className="flex-1 overflow-auto m-0">
                                <ThreadList />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // For other tabs (sent, drafts, etc) - simpler layout
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between h-[52px] px-6 border-b bg-background/50 backdrop-blur-sm">
                                <h1 className="text-xl font-bold capitalize bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {tab}
                                </h1>
                            </div>

                            {/* Search Bar */}
                            <div className="px-6 py-3 border-b bg-muted/30">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl" />
                                    <input
                                        type="search"
                                        placeholder="Search emails..."
                                        className="relative w-full px-4 py-2.5 rounded-lg border bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                                    />
                                </div>
                            </div>

                            {/* Email List */}
                            <div className="flex-1 overflow-auto">
                                <ThreadList />
                            </div>
                        </div>
                    )}
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Thread Detail Panel */}
                <ResizablePanel
                    defaultSize={defaultLayout[2]}
                    minSize={30}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between h-[52px] px-6 border-b bg-background/50 backdrop-blur-sm">
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