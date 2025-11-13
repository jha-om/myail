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
import useThread from "@/hooks/use-thread"
import { api } from "@/trpc/react"
import { toast } from "sonner"

const ComposeButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const [subject, setSubject] = useState<string>('')
    const [toValues, setToValues] = useState<{ label: string, value: string }[]>([])
    const [ccValues, setCcValues] = useState<{ label: string, value: string }[]>([]);

    const { account } = useThread();

    const sendEmail = api.account.sendEmail.useMutation();

    const handleSend = async (value: string) => {
        if (!account) {
            return;
        }
        sendEmail.mutate({
            accountId: account.id,
            threadId: undefined,
            body: value,
            from: {
                name: account.name ?? "Me",
                address: account.emailAddress ?? "me@example.com"
            },
            to: toValues.map(to => ({
                name: to.value,
                address: to.value,
            })),
            cc: ccValues.map(cc => ({
                name: cc.value,
                address: cc.value,
            })),
            replyTo: {
                name: account.name ?? "Me",
                address: account.emailAddress ?? "me@example.com",
            },
            subject: subject,
            inReplyTo: undefined,
        }, {
            onSuccess: () => {
                toast.success("Email sent");
            },
            onError: (error) => {
                console.log("error: in compose email", error);
                toast.error('Error sending email');
            }
        })
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

                    isSending={sendEmail.isPending}
                    to={toValues.map(to => to.value)}
                />
            </DrawerContent>
        </Drawer>
    )
}

export default ComposeButton