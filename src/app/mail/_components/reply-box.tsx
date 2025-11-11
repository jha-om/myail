"use client"

import EmailEditor from "@/app/mail/_components/email-editor"
import useThread from "@/hooks/use-thread"
import { api, type RouterOutputs } from "@/trpc/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const ReplyBox = () => {
    const { threadId, accountId } = useThread();
    const { data: replyDetails } = api.account.getReplyDetails.useQuery({
        accountId,
        threadId: threadId ?? "",
    }, {
        enabled: !!threadId && !!accountId,
    })
    
    if (!replyDetails) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Select a thread to reply
            </div>
        );
    }
    
    return (
        <ReplyComponent replyDetails={replyDetails} />
    )
}

const ReplyComponent = ({ replyDetails }: { replyDetails: RouterOutputs['account']['getReplyDetails'] } ) => {
    const { threadId, accountId } = useThread();
    const [subject, setSubject] = useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)
    const [toValues, setToValues] = useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({
        label: to.address,
        value: to.address,
    })))
    const [ccValues, setCcValues] = useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({
        label: cc.address,
        value: cc.address,
    })))

    useEffect(() => {
        if (!threadId || !replyDetails) {
            return;
        }

        if (!replyDetails.subject.startsWith("Re:")) {
            setSubject(`Re: ${replyDetails.subject}`);
        } else {
            setSubject(replyDetails.subject)
        }

        setToValues(replyDetails.to.map(to => ({
            label: to.address,
            value: to.address,
        })));

        setCcValues(replyDetails.cc.map(cc => ({
            label: cc.address,
            value: cc.address,
        })))
    }, [threadId, replyDetails])

    const sendEmail = api.account.sendEmail.useMutation();
    const handleSend = async (value: string) => {
        if (!replyDetails) { 
            return;
        }
        sendEmail.mutate({
            accountId,
            threadId: threadId ?? undefined,
            body: value,
            subject,
            from: replyDetails.from,
            to: replyDetails.to.map(to => ({
                address: to.address,
                name: to.name ?? "",
            })),
            cc: replyDetails.cc.map(cc => ({
                address: cc.address,
                name: cc.name ?? "",
            })),
            replyTo: replyDetails.from,
            inReplyTo: replyDetails.id,
        }, {
            onSuccess: () => {
                toast.success('Email sent');
            },
            onError: (error) => {
                console.log(error);
                toast.error("Error sending email");
            }
        })
    }

    return (
        <EmailEditor
            subject={subject}
            setSubject={setSubject}

            toValues={toValues}
            setToValues={setToValues}

            ccValues={ccValues}
            setCcValues={setCcValues}

            to={replyDetails.to.map(to => to.address)}

            isSending={sendEmail.isPending}
            handleSend={handleSend}
            defaultExpanded={false}
        />
    )
}

export default ReplyBox