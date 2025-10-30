"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import useThread from "@/hooks/use-thread"
import { ArchiveIcon, ArchiveXIcon, Clock, MoreVertical, Trash2Icon } from "lucide-react"

const ThreadDisplayUpper = () => {
    const { threadId, threads } = useThread();
    const thread = threads?.find(t => t.id === threadId);

    return (
        <div className="w-full">
            <div className="flex items-center p-2">
                <div className="flex items-center gap-2">
                    <Button variant={'ghost'} size='icon' disabled={!thread} >
                        <ArchiveIcon className="size-4" />
                    </Button>
                    <Button variant={'ghost'} size='icon' disabled={!thread} >
                        <ArchiveXIcon className="size-4" />
                    </Button>
                    <Button variant={'ghost'} size='icon' disabled={!thread} >
                        <Trash2Icon className="size-4" />
                    </Button>
                </div>
                <Separator orientation="vertical" className="ml-2" />
                <Button className="ml-2" variant={'ghost'} size='icon' disabled={!thread} >
                    <Clock className="size-4" />
                </Button>
                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'ghost'} size='icon' disabled={!thread} >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                            <DropdownMenuItem>Star Thread</DropdownMenuItem>
                            <DropdownMenuItem>Add label</DropdownMenuItem>
                            <DropdownMenuItem>Mute Thread</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}

export default ThreadDisplayUpper