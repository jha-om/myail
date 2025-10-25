"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSwitcher from "@/components/account-switcher";
import Sidebar from "./sidebar";

type mailProps = {
    defaultLayout: number[] | undefined,
    navCollapsedSize: number,
    defaultCollapse: boolean
}
const MailComponent = ({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapse }: mailProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapse);
    const [tab, setTab] = useState<string>('inbox');

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
            <ResizablePanelGroup direction="horizontal" onLayout={(sizes: number[]) => {
                console.log(sizes);
            }} className="items-stretch h-full min-h-screen">
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={40}
                    onCollapse={() => {
                        setIsCollapsed(true)
                    }}
                    onResize={() => {
                        setIsCollapsed(false)
                    }}
                    className={cn(isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
                >
                    <div className="flex flex-col h-full flex-1">
                        <div className={cn("flex h-[60px] items-center justify-between", isCollapsed ? "h-[60px]" : "px-2")}>
                            {/* account switcher */}
                            <AccountSwitcher isCollapsed={isCollapsed} />
                        </div>
                        <Separator />
                        {/* Sidebar */}
                        <Sidebar 
                            isCollapsed={isCollapsed} 
                            currentTab={tab} 
                            onTabChange={handleTabChange} 
                        />
                        <div className="flex-1" />
                        <Separator />
                        Ask AI
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    defaultSize={defaultLayout[1]}
                    minSize={30}
                >
                    <Tabs defaultValue="inbox">
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <TabsList className="ml-auto">
                                <TabsTrigger value="inbox" className="text-zinc-600 dark:text-zinc-200">
                                    Inbox
                                </TabsTrigger>
                                <TabsTrigger value="done" className="text-zinc-600 dark:text-zinc-200">
                                    Done
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <Separator />
                        {/* Search Bar */}
                        Search Bar
                        <TabsContent value="inbox">
                            Inbox
                        </TabsContent>
                        <TabsContent value="done">
                            Done
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    defaultSize={defaultLayout[2]}
                    minSize={30}
                >
                    Thread&apos;s
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}

export default MailComponent