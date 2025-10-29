import { api } from "@/trpc/react"
import { useEffect, useState } from "react";

const useThread = () => {
    const { data: accounts } = api.account.getAccounts.useQuery();
    const [accountId, setAccountId] = useState<string>('');
    const [tab, setTab] = useState<string>('inbox');
    const [done, setDone] = useState<boolean>(false);

    useEffect(() => {
        const storedAccountId = localStorage.getItem('accountId');
        if (storedAccountId) {
            setAccountId(storedAccountId);
        }
    }, []);
    useEffect(() => {
        const storedTab = localStorage.getItem('myail-tab');
        if (storedTab) {
            setTab(storedTab);
        }
    }, []);
    useEffect(() => {
        const storedDone = localStorage.getItem('myail-done');
        if (storedDone) {
            setDone(Boolean(storedDone));
        }
    }, []);

    const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
        accountId,
        tab,
        done
    }, {
        enabled: !!accountId && !!tab,
        placeholderData: e => e,
        refetchInterval: 5000,

    });

    return {
        threads,
        isFetching,
        refetch,
        accountId,
        account: accounts?.find(a => a.id === accountId)
    }
}

export default useThread