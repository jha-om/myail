import { type Editor } from "@tiptap/react"
import { Bold, Code, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Italic, List, ListOrdered, Quote, Redo, Strikethrough, Undo } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
    editor: Editor
}

const EditorMenubar = ({ editor }: Props) => {
    const buttonClass = (isActive: boolean) => cn(
        "p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-accent border border-primary"
    )

    return (
        <div className="flex flex-wrap gap-1 border-b py-2">
            {/* Bold */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive("bold"))}
                title="Bold (Ctrl+B)"
                type="button"
            >
                <Bold className="size-4" />
            </button>

            {/* Italic */}
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive("italic"))}
                title="Italic (Ctrl+I)"
                type="button"
            >
                <Italic className="size-4" />
            </button>

            {/* Strikethrough */}
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive("strike"))}
                title="Strikethrough"
                type="button"
            >
                <Strikethrough className="size-4" />
            </button>

            {/* Code */}
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive("code"))}
                title="Inline Code"
                type="button"
            >
                <Code className="size-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Heading 1 */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 1 }))}
                title="Heading 1"
                type="button"
            >
                <Heading1 className="size-4" />
            </button>

            {/* Heading 2 */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 2 }))}
                title="Heading 2"
                type="button"
            >
                <Heading2 className="size-4" />
            </button>

            {/* Heading 3 */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 3 }))}
                title="Heading 3"
                type="button"
            >
                <Heading3 className="size-4" />
            </button>

            {/* Heading 4 */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 4 }))}
                title="Heading 4"
                type="button"
            >
                <Heading4 className="size-4" />
            </button>

            {/* Heading 5 */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 5 }))}
                title="Heading 5"
                type="button"
            >
                <Heading5 className="size-4" />
            </button>

            {/* Heading 6 */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 6 }))}
                title="Heading 6"
                type="button"
            >
                <Heading6 className="size-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Bullet List */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive("bulletList"))}
                title="Bullet List"
                type="button"
            >
                <List className="size-4" />
            </button>

            {/* Ordered List */}
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive("orderedList"))}
                title="Numbered List"
                type="button"
            >
                <ListOrdered className="size-4" />
            </button>

            {/* Blockquote */}
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive("blockquote"))}
                title="Blockquote"
                type="button"
            >
                <Quote className="size-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Undo */}
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className={buttonClass(false)}
                title="Undo (Ctrl+Z)"
                type="button"
            >
                <Undo className="size-4" />
            </button>

            {/* Redo */}
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className={buttonClass(false)}
                title="Redo (Ctrl+Y)"
                type="button"
            >
                <Redo className="size-4" />
            </button>
        </div>
    )
}

export default EditorMenubar