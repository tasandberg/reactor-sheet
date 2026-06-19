/* ============================================================
   useDragReorder — reusable drag-to-reorder hook with an
   insertion-line affordance (before / after) AND container
   nesting (into). Drives state only; the consumer wires the
   commit callbacks to its own data model.

   The "line" is never a real DOM node — rowClass() returns
   " drop-before" / " drop-after" / " drop-into" on the hovered
   row and CSS paints a 2px rule on the matching edge, so the
   list never reflows mid-drag.

   Usage:
     const dnd = useDragReorder({
       onReorder: ({ group, from, to, where, targetIdx, zone }) => {...},
       onNest:    ({ group, from, targetIdx, zone }) => {...},
     });

     // a normal reorderable row
     <div className={"row" + dnd.rowClass(group, i)} {...dnd.rowProps(group, i, { ownZone })} />

     // a row that is ALSO a drop-into container
     <div {...dnd.rowProps(group, i, { container: true, containerZone })} />

     // an empty container's body (nest with no sibling rows)
     <div {...dnd.nestProps(group, i, zone)} />

   Reorders are constrained to a single `group` — items in
   different groups can't interleave.
   ============================================================ */
(function () {
  const { useState } = React;

  function useDragReorder({ onReorder, onNest } = {}) {
    const [drag, setDrag] = useState(null); // { group, idx } — the item being dragged
    const [over, setOver] = useState(null); // { group, idx, where } — current hover target
    const clear = () => { setDrag(null); setOver(null); };

    // before/after from the pointer's position within the hovered row
    const edgeWhere = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2 ? "before" : "after";
    };

    const sameGroup = (group) => drag && drag.group === group;

    // Draggable + droppable row.
    //   opts: { container, containerZone, ownZone, onStart, onEnd }
    const rowProps = (group, idx, opts = {}) => ({
      draggable: true,
      onDragStart: (e) => {
        setDrag({ group, idx });
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", group + ":" + idx); } catch (_) {}
        opts.onStart && opts.onStart();
      },
      onDragEnd: () => { clear(); opts.onEnd && opts.onEnd(); },
      onDragOver: (e) => {
        if (!sameGroup(group)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const where = opts.container ? "into" : edgeWhere(e);
        if (!over || over.group !== group || over.idx !== idx || over.where !== where) {
          setOver({ group, idx, where });
        }
      },
      onDrop: (e) => {
        if (!sameGroup(group)) { clear(); return; }
        e.preventDefault();
        const from = drag.idx;
        if (opts.container) {
          onNest && onNest({ group, from, targetIdx: idx, zone: opts.containerZone });
        } else {
          // Recompute the edge from THIS drop event rather than reading `over`
          // state — a fast drop can fire before React re-renders the handler,
          // leaving `over` stale. The event is always current.
          const where = edgeWhere(e);
          let to = where === "after" ? idx + 1 : idx;
          if (from < to) to -= 1; // account for the gap the removed item leaves
          onReorder && onReorder({ group, from, to, where, targetIdx: idx, zone: opts.ownZone });
        }
        clear();
      },
    });

    // Drop target for an EMPTY container body (nest with no sibling rows to hover).
    const nestProps = (group, idx, zone) => ({
      onDragOver: (e) => {
        if (!sameGroup(group)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over || over.idx !== idx || over.where !== "into") setOver({ group, idx, where: "into" });
      },
      onDrop: (e) => {
        if (!sameGroup(group)) return;
        e.preventDefault();
        onNest && onNest({ group, from: drag.idx, targetIdx: idx, zone });
        clear();
      },
    });

    // " dragging" on the source + " drop-before|after|into" on the hovered target.
    const rowClass = (group, idx) => {
      let s = "";
      if (drag && drag.group === group && drag.idx === idx) s += " dragging";
      if (over && over.group === group && over.idx === idx) {
        s += over.where === "after" ? " drop-after" : over.where === "into" ? " drop-into" : " drop-before";
      }
      return s;
    };

    return { drag, over, rowProps, nestProps, rowClass, clear, setDrag, setOver };
  }

  window.HF = Object.assign(window.HF || {}, { useDragReorder });
})();
