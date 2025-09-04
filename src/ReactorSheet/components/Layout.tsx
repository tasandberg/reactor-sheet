import ActorScores from "./ActorScores";
import Encumbrance from "./Encumbrance";
import Header from "./Header";
import Movement from "./Movement";
import SheetPages from "./SheetPages";
export const Layout = () => {
  return (
    <div className="reactor-sheet-app flex-col">
      <Header />
      <ActorScores />
      <div className="flex-col gap-0">
        <Movement />
        <Encumbrance />
      </div>
      <SheetPages />
    </div>
  );
};
