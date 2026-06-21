import { useEffect, useState } from "react";
import { useReactorSheetContext } from "../../context";
import { SectionTitle } from "../../ui/SectionTitle";
import { ProseMirrorEditor } from "../../ui/ProseMirrorEditor";

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
  const [enriched, setEnriched] = useState<string>("");

  useEffect(() => {
    let live = true;
    foundry.applications.ux.TextEditor.enrichHTML(value, {
      secrets: true,
      documents: true,
      links: true,
      rolls: true,
      embeds: true,
      relativeTo: actor,
    }).then((html) => {
      if (live) setEnriched(html);
    });
    return () => {
      live = false;
    };
  }, [value, actor]);

  return (
    <section className="rs-section rs-notes-sec">
      <SectionTitle>{title}</SectionTitle>
      <ProseMirrorEditor
        name={name}
        value={value}
        enriched={enriched}
        height={height}
        documentUUID={actor.uuid}
        onSave={(next) => updateActor({ [name]: next })}
      />
    </section>
  );
}
