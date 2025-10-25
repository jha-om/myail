"use client"

import { useEffect, useState } from "react";
import { Nav } from "./nav";

type sidebarProps = {
    isCollapsed: boolean,
}

const Sidebar = ({ isCollapsed }: sidebarProps) => {
    const [accountId, setAccountId] = useState<string>('');

    useEffect(() => {
        const storedAccountId = localStorage.getItem('accountId');
        if (storedAccountId) {
            setAccountId(storedAccountId);
        }
    }, []);
    
    return (
        <div>nav</div>
    )
}

export default Sidebar