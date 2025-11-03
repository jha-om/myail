"use client"

import RenderResults from "@/components/kbar/render-results"
import useAccountSwitching from "@/hooks/kbar/use-account-switching";
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch, type Action } from "kbar"
export default function KBar({ children }: { children: React.ReactNode }) {
    const handleTabChange = (tab: string) => {
        localStorage.setItem('myail-tab', tab);

        const event = new CustomEvent('tab-change', {
            detail: { tab },
            bubbles: true,
            composed: true,
        });

        window.dispatchEvent(event);
        console.log("kbar: dispatched tab-change event for: ", tab);
    }

    const actions: Action[] = [
        {
            id: 'inboxAction',
            name: "Inbox",
            shortcut: ['i'],
            section: 'Navigation',
            keywords: 'inbox',
            subtitle: "View your inbox",
            perform: () => {
                handleTabChange('inbox');
            }
        },
        {
            id: 'draftAction',
            name: 'Draft',
            shortcut: ['r', 'd'],
            section: 'Navigation',
            keywords: 'draft',
            subtitle: "View your drafts",
            perform: () => {
                handleTabChange('drafts');
            }
        },
        {
            id: 'sentAction',
            name: 'Sent',
            shortcut: ['s'],
            section: 'Navigation',
            keywords: 'sent',
            subtitle: "View your sent",
            perform: () => {
                handleTabChange('sent');
            }
        },
        {
            id: 'doneAction',
            name: 'See done',
            shortcut: ['o', 'd'],
            section: 'Navigation',
            keywords: 'done',
            subtitle: "View your done emails",
            perform: () => {
                handleTabChange('done');
            }
        },
        {
            id: 'accountsActions',
            name: 'Switch Account',
            shortcut: ['a'],
            section: 'Accounts',
            keywords: 'switch account change email',
            subtitle: "Switch between email accounts"
        }
    ]
    return (
        <KBarProvider actions={actions}>
            <ActualComponent>
                {children}
            </ActualComponent>
        </KBarProvider>

    )
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
    useAccountSwitching();
    return (
        <>
            <KBarPortal>
                <KBarPositioner className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm p-0! z-900 overflow-hidden">
                    <KBarAnimator className="max-w-[600px] mt-64! w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg border dark:border-gray-600 rounded-lg overflow-hidden relative -translate-y-12!">
                        <div className="bg-white dark:bg-gray-800">
                            <div className="border-x-0 border-b-2 dark:border-gray-700">
                                <KBarSearch className="py-2 px-4 text-lg w-full bg-white dark:bg-gray-800 outline-none border-none focus:ouline-none focus:ring-0 focus:ring-offset-0 " />
                            </div>
                            <RenderResults />
                        </div>
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </>
    )
}