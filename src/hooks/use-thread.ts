import { api } from "@/trpc/react"
import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";

export const threadIdAtom = atom<string | null>(null);

const useThread = () => {
    const { data: accounts } = api.account.getAccounts.useQuery();
    
    const [accountId, setAccountId] = useState<string | null>(null);
    const [tab, setTab] = useState<string>('inbox');
    const [done, setDone] = useState<boolean>(false);
    const [threadId, setThreadId] = useAtom(threadIdAtom);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (isInitialized) return;

        const storedAccountId = localStorage.getItem('accountId');

        if (storedAccountId) {
            setAccountId(storedAccountId);
            setIsInitialized(true);
        } else if (accounts && accounts.length > 0) {
            const firstAccountId = accounts[0]!.id;
            setAccountId(firstAccountId);
            localStorage.setItem('accountId', firstAccountId);
            setIsInitialized(true);
        }
    }, [accounts, isInitialized]);

    useEffect(() => {
        const storedTab = localStorage.getItem('myail-tab');
        if (storedTab) {
            setTab(storedTab);
        }
    }, []);

    useEffect(() => {
        const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
            const newTab = event.detail.tab;
            setTab(newTab);
            localStorage.setItem('myail-tab', newTab);

            if (newTab === 'done') {
                setDone(true);
            } else if (newTab === 'inbox') {
                setDone(false);
            }
        }

        window.addEventListener('tab-change', handleTabChange as EventListener);

        return () => {
            window.removeEventListener('tab-change', handleTabChange as EventListener)
        }
    }, []);

    const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery(
        {
            accountId: accountId ?? "",
            tab,
            done
        }, 
        {
            enabled: !!accountId && accountId !== '',
            placeholderData: (previousData) => previousData,
            refetchInterval: 5000,
        }
    );

    return {
        threads,
        isFetching,
        refetch,
        accountId,
        account: accounts?.find(a => a.id === accountId),
        threadId,
        setThreadId,
    }
}

export default useThread;