import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
    isComposing: boolean;
    onGenerate: (token: string) => void;
}
const AICompose = ({ isComposing, onGenerate }: Props) => {
    return (
        <Dialog>
            <DialogTrigger className="outline-none border-none focus:outline-none focus:border-none">Open</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default AICompose