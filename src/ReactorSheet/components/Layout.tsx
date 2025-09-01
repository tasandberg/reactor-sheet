import Header from "./Header";
import SheetPages from "./SheetPages";
import ActorScores from "./ActorScores";
export const Layout = () => {
  return (
    <div className="reactor-sheet-app flex-col">
      <Header />
      <ActorScores />
      <SheetPages />
    </div>
  );
};
