import { useState } from "react";

export type ReactorSheetSettings = {
  currentPage: string;
};
export function useLocalSettings() {
  const [sheetSettings, setSheetSettings] = useState<ReactorSheetSettings>(
    () => {
      const saved = localStorage.getItem("reactorSheetSettings");
      return saved ? JSON.parse(saved) : { currentPage: "tab1" };
    }
  );

  const updateSettings = (newSettings: ReactorSheetSettings) => {
    const updatedSettings = { ...sheetSettings, ...newSettings };
    setSheetSettings(updatedSettings);
    localStorage.setItem(
      "reactorSheetSettings",
      JSON.stringify(updatedSettings)
    );
  };

  const setSetting = (key: keyof ReactorSheetSettings, value: string) => {
    const updatedSettings = { ...sheetSettings, [key]: value };
    setSheetSettings(updatedSettings);
    localStorage.setItem(
      "reactorSheetSettings",
      JSON.stringify(updatedSettings)
    );
  };

  return { sheetSettings, setSetting, updateSettings } as const;
}
