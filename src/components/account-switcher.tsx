"use client"
import { api } from "@/trpc/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { getAurinkoAuthUrl } from "@/lib/aurinko";

type accountSwitcherProps = {
    isCollapsed: boolean,
}
const AccountSwitcher = ({ isCollapsed }: accountSwitcherProps) => {
    const { data } = api.account.getAccounts.useQuery();
    const [accountId, setAccountId] = useState<string>('');

    useEffect(() => {
        const storedAccountId = localStorage.getItem('accountId');
        if (storedAccountId) {
            setAccountId(storedAccountId);
        }
    }, [])

    const handleAccountChange = (value: string) => {
        setAccountId(value)
        localStorage.setItem('accountId', value)
    }

    if (!data) {
        return null;
    }

    return (
        <Select defaultValue={accountId} onValueChange={handleAccountChange}>
            <SelectTrigger
                className={cn(
                    "flex w-full items-center gap-2 border-none shadow-none hover:bg-accent/50 focus:ring-0",
                    isCollapsed && "h-10 w-10 p-0 border rounded-full bg-gray-300/40 justify-center items-center &>span]:w-auto [&>svg]:hidden"
                )}
                aria-label="Select account"
            >
                <SelectValue placeholder="Select account">
                    {isCollapsed ? (
                        <span className="text-sm font-semibold">
                            {data.find(account => account.id === accountId)?.emailAddress[0]?.toUpperCase()}
                        </span>
                    ) : (
                        <span className="truncate text-md">
                            {data.find(account => account.id === accountId)?.emailAddress}
                        </span>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent align={isCollapsed ? "center" : "start"}>
                {data.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                        <div className="flex flex-col">
                            <span className="font-semibold">{account.emailAddress}</span>
                            {account.name && (
                                <span className="text-xs text-muted-foreground">{account.name}</span>
                            )}
                        </div>
                    </SelectItem>
                ))}
                <div
                    onClick={async () => {
                        const authUrl = await getAurinkoAuthUrl('Google');
                        window.location.href = authUrl;
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm mt-1 border-t"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add account</span>
                </div>
            </SelectContent>
        </Select>
    )
}

export default AccountSwitcher