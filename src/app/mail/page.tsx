import dynamic from "next/dynamic"

const MailComponent = dynamic(() => {
    return import('@/components/mail')
})

const Mail = () => {
    return (
        // TODO: add dark theme
        
        <div className="h-screen w-full overflow-hidden">
            <MailComponent defaultLayout={[20, 32, 48]} navCollapsedSize={3} defaultCollapse={false} />
        </div>
    )
}

export default Mail