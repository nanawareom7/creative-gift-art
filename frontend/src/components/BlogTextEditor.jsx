import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  // Sync external value changes to editor (only when different)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      exec("createLink", url);
    }
  };

  const removeLink = () => {
    exec("unlink");
  };

  return (
    <div className="border border-input rounded-xl overflow-hidden bg-card focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-secondary/50 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("bold")}
          title="Bold"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("italic")}
          title="Italic"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("formatBlock", "<h2>")}
          title="Heading 2"
          className="h-8 p-1 text-xs font-semibold"
        >
          <Heading2 className="h-4 w-4 mr-0.5" /> H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("formatBlock", "<h3>")}
          title="Heading 3"
          className="h-8 p-1 text-xs font-semibold"
        >
          <Heading3 className="h-4 w-4 mr-0.5" /> H3
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("formatBlock", "<p>")}
          title="Paragraph"
          className="h-8 px-2 text-xs font-medium"
        >
          P
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          title="Insert Link"
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeLink}
          title="Remove Link"
          className="h-8 w-8 p-0"
        >
          <Unlink className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => exec("removeFormat")}
          title="Clear Formatting"
          className="h-8 w-8 p-0"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      {/* Content editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[260px] p-4 text-sm focus:outline-none leading-relaxed prose max-w-none dark:prose-invert"
        style={{ overflowY: "auto" }}
      />
    </div>
  );
}
