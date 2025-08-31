import ArrowDivider from "./ArrowDivider";
import Header from "./Header";
import SheetPages from "./SheetPages";
import ActorScores from "./ActorScores";

export const Layout = () => {
  return (
    <div className="reactor-sheet-app">
      <Header />
      <ActorScores />
      <ArrowDivider />
      <SheetPages />
    </div>
  );
};
