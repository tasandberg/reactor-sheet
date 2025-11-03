import { useReactorSheetContext } from "../../context";
import { Column, Row, Text, TextLarge } from "../../shared/elements";
import { showConfirmDialog, showFormDialog } from "../../shared/foundryDialogs";
import ActionTable from "../Actions/ActionTable";

export default function Languages() {
  const { actor, updateActor } = useReactorSheetContext();
  // @ts-expect-error Cant fix config type
  const languages = CONFIG.OSE.languages as string[];

  // HTML for form dialog
  const languageSelect = `
  <select name="selectedLanguage">
    ${languages
      .filter((l) => !actor.system.languages.value.includes(l))
      .map((lang) => `<option value="${lang}">${lang}</option>`)
      .join("")}
  </select>
  `;

  return (
    <Column style={{ width: "100%", maxWidth: 200 }}>
      <Row $align="center" $justify="space-between">
        <TextLarge>Languages</TextLarge>
        <Row style={{ width: "50px" }} $align="center" $justify="end">
          <a
            role="button"
            title="Add a language"
            onClick={async () => {
              const chosen = await showFormDialog({
                title: "Add a language",
                content: languageSelect,
                callback: (_e: Event, button: HTMLButtonElement) => {
                  // @ts-expect-error unknown form type
                  return button.form.elements.selectedLanguage.value;
                },
              });
              if (languages.includes(chosen) === false) return;
              const newLanguages = [...actor.system.languages.value, chosen];
              await updateActor({
                "system.languages.value": newLanguages,
              });
            }}
          >
            <i className="fa fa-plus text-sm" />
          </a>
        </Row>
      </Row>
      <ActionTable<string>
        showHeader={false}
        columns={[
          {
            name: "Name",
            header: "Language",
            justify: "start",
            width: "1fr",
            renderCell: (language) => (
              <Text $color="secondary">{language}</Text>
            ),
          },
          {
            name: "Delete",
            align: "center",
            justify: "end",
            header: "",
            width: "50px",
            renderCell: (language) => (
              <a
                role="button"
                onClick={async () =>
                  showConfirmDialog({
                    title: "Delete Language",
                    message: "Are you sure you want to delete this language?",
                    callback: async () => {
                      const updatedLanguages =
                        actor.system.languages.value.filter(
                          (lang) => lang !== language
                        );
                      await updateActor({
                        "system.languages.value": updatedLanguages,
                      });
                    },
                  })
                }
              >
                <i className="fa fa-trash text-sm" />
              </a>
            ),
          },
        ]}
        data={actor.system.languages.value}
        getRowId={(row) => `language-${row}`}
      />
    </Column>
  );
}
