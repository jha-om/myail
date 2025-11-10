"use client"

import EmailEditor from "@/app/mail/_components/email-editor"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { PencilIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

const ComposeButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const [subject, setSubject] = useState<string>('')
    const [toValues, setToValues] = useState<{ label: string, value: string }[]>([])
    const [ccValues, setCcValues] = useState<{ label: string, value: string }[]>([]);
    
    const handleSend = async () => {
        console.log('handle send button in compose button');
    }
    
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    variant={"ghost"}
                    className={cn(
                        "transition-all duration-200",
                        isCollapsed
                            ? "h-10 w-10 p-0! rounded-full flex items-center justify-center"
                            : "w-full border rounded-lg gap-2 flex items-center justify-center py-2.5"
                    )}
                >
                    <PencilIcon className={
                        "shrink-0 h-4 w-4"
                    } />
                    {!isCollapsed && <span>Compose</span>}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Compose New Email</DrawerTitle>
                </DrawerHeader>
                <EmailEditor
                    toValues={toValues}
                    setToValues={setToValues}

                    ccValues={ccValues}
                    setCcValues={setCcValues}

                    subject={subject}
                    setSubject={setSubject}

                    handleSend={handleSend}
                    defaultExpanded={true}

                    isSending={false}
                    to={toValues.map(to => to.value)}
                />
            </DrawerContent>
        </Drawer>
    )
}

export default ComposeButton