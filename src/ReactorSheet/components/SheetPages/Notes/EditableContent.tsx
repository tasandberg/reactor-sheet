import { useEffect, useRef, useState } from "react";
import { useReactorSheetContext } from "../../context";
import { TextLarge } from "../../shared/elements";

export default function EditableContent({
  title,
  name,
  value,
  height = 150,
}: {
  title: string;
  name: string;
  value: string;
  height?: number;
}) {
  const { actor, updateActor } = useReactorSheetContext();
  const [enriched, setEnriched] = useState<string>(null);
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentEditor = editor.current;
    const handleSave = async (e: Event) => {
      e.preventDefault();
      await updateActor({ [name]: (e.target as HTMLInputElement).value });
    };
    currentEditor.addEventListener("save", handleSave);
    return () => {
      if (currentEditor) {
        currentEditor.removeEventListener("save", handleSave);
      }
    };
  }, [enriched, editor, name, updateActor]);

  useEffect(() => {
    foundry.applications.ux.TextEditor.enrichHTML(value, {
      secrets: true,
      documents: true,
      links: true,
      rolls: true,
      embeds: true,
      relativeTo: actor,
    }).then((enriched) => {
      setEnriched(enriched);
    });
  }, [value, actor]);

  return (
    <div style={{ width: "100%" }}>
      <TextLarge>{title}</TextLarge>
      <div
        ref={editor}
        style={{ width: "100%" }}
        dangerouslySetInnerHTML={{
          __html: `<prose-mirror name="${name}" value="${value}" style="height: ${height}px;" toggled>
            ${enriched}
          </prose-mirror>`,
        }}
      />
    </div>
  );
}
