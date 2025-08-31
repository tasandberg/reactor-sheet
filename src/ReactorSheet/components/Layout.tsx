import ArrowDivider from "./ArrowDivider";
import Header from "./Header";
import SheetPages from "./SheetPages";
import ActorScores from "./ActorScores";

export const Layout = () => {
  return (
    <div className="reactor-sheet-app flex-col gap-1">
      <Header />
      <ActorScores />
      <ArrowDivider />
      <SheetPages />
    </div>
  );
};
