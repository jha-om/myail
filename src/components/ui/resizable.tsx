"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "group relative flex w-px items-center justify-center bg-linear-to-r from-border/50 via-border to-border/50 transition-all",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2 after:cursor-col-resize",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50",
        "data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:bg-linear-to-b",
        "data-[panel-group-direction=vertical]:hover:h-2",
        "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-4 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:cursor-row-resize",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-10 w-1.5 items-center justify-center rounded-md bg-muted/80 shadow-sm backdrop-blur-sm transition-all">
          <div className="flex flex-col gap-1">
            <div className="h-1 w-1 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary" />
          </div>
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
