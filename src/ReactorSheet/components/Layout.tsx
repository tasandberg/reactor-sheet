import ActorScores from "./ActorScores";
import Header from "./Header";
import SheetPages from "./SheetPages";
export const Layout = () => {
  return (
    <div className="reactor-sheet-app flex-col">
      <Header />
      <ActorScores />
      <SheetPages />
    </div>
  );
};
