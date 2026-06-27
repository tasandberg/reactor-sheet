/** Inventory thumbnail: the item's art in an ink-black rounded square, or a
 *  monogram fallback. Shared by item rows and the wealth coin table so coins get
 *  identical treatment. */
export function ItemImage({ img, monogram }: { img: string; monogram: string }) {
  return (
    <span className="rs-inv-img" aria-hidden="true">
      {img ? <img src={img} alt="" /> : <span className="mono">{monogram}</span>}
    </span>
  );
}
