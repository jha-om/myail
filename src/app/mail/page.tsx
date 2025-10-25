import dynamic from "next/dynamic"

const MailComponent = dynamic(() => {
    return import('@/components/mail')
})

const Mail = () => {
    return (
        <MailComponent defaultLayout={[20, 32, 48]} navCollapsedSize={10} defaultCollapse={false}/>
    )
}

export default Mail