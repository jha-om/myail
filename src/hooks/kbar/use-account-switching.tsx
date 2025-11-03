"use client"
import { useRegisterActions } from "kbar";
import { api } from "@/trpc/react";


const useAccountSwitching = () => {
    const { data: accounts } = api.account.getAccounts.useQuery();

    const accountActions = accounts?.map(account => ({
        id: `account-${account.id}`,
        name: account.emailAddress,
        parent: 'accountsActions', // This must match the parent ID in actions array
        section: 'Accounts',
        keywords: `switch ${account.emailAddress} ${account.name || ''}`,
        subtitle: account.name || 'Switch to this account',
        perform: () => {
            localStorage.setItem('accountId', account.id);
            window.location.reload(); // Reload to apply account switch
        }
    })) ?? [];

    useRegisterActions(accountActions, [accounts]);
};

export default useAccountSwitching;