import { useState, type ReactNode } from "react";
import ReactGridLayout, { useContainerWidth, type LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { clearLayout, COLUMNS, DEFAULT_LAYOUT, GAP, loadLayout, ROW_HEIGHT, saveLayout, type CardId } from "./layout";

// Below this width there's no room for cards side by side: they stack in a
// fixed order instead (phones, narrow windows).
const MIN_GRID_WIDTH = 860;

type Props = {
  /** One card per id. Each is rendered as given; the grid only positions it. */
  cards: Record<CardId, ReactNode>;
};

/**
 * The dashboard: cards you can drag around by their grip and resize from
 * their bottom-right corner. The arrangement is remembered on this device.
 */
export function Dashboard({ cards }: Props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<LayoutItem[]>(loadLayout);
  const isDefault = JSON.stringify(layout.map(({ i, x, y, w, h }) => [i, x, y, w, h])) ===
    JSON.stringify(DEFAULT_LAYOUT.map(({ i, x, y, w, h }) => [i, x, y, w, h]));

  const grid = mounted && width >= MIN_GRID_WIDTH;

  return (
    <div ref={containerRef} className="dashboard-wrap">
      {grid ? (
        <>
          <ReactGridLayout
            className="dashboard-grid"
            width={width}
            layout={layout}
            gridConfig={{ cols: COLUMNS, rowHeight: ROW_HEIGHT, margin: [GAP, GAP], containerPadding: [0, 0] }}
            dragConfig={{ handle: ".panel__grip" }}
            resizeConfig={{ handles: ["se"] }}
            onLayoutChange={(next) => {
              setLayout([...next]);
              saveLayout(next);
            }}
          >
            {(Object.keys(cards) as CardId[]).map((id) => (
              <div key={id} className="dashboard-cell">
                {cards[id]}
              </div>
            ))}
          </ReactGridLayout>
          {!isDefault && (
            <p className="dashboard-reset">
              <button
                type="button"
                className="footer-link"
                onClick={() => {
                  clearLayout();
                  setLayout(DEFAULT_LAYOUT);
                }}
              >
                reset the layout
              </button>
            </p>
          )}
        </>
      ) : (
        // Stacked: today, focus, week, review.
        <div className="dashboard-stack">
          {cards.today}
          {cards.focus}
          {cards.week}
          {cards.review}
        </div>
      )}
    </div>
  );
}
