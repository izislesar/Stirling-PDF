/** Rail indicator for a folder being classified in the background: a ring that fills as
 *  documents land, with the count inside, then a tick that takes the item away. */

import { useEffect, useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Tooltip } from "@app/components/shared/Tooltip";
import "@app/components/shared/quickNav/QuickNavRail.css";
import styles from "@app/components/quickNav/ClassificationProgressRing.module.css";

const SIZE = 30;
const STROKE = 2.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** How long the tick is shown before {@link ClassificationProgressRingProps.onSettled}. */
const SETTLE_MS = 1800;

export type ClassificationProgressRingVariant = "fraction" | "count";

export interface ClassificationProgressRingProps {
  processed: number;
  /** 0 while the folder is still being read: the ring turns instead of filling. */
  total: number;
  status: "running" | "done";
  /** "fraction" stacks x over y inside the ring; "count" shows x and keeps y for the tooltip. */
  variant?: ClassificationProgressRingVariant;
  /** Tooltip and accessible name, e.g. "Classifying Downloads: 37 of 450". */
  label: string;
  onClick?: () => void;
  /** Fired once the tick has been on screen long enough to read; the owner removes the item. */
  onSettled?: () => void;
}

export function ClassificationProgressRing({
  processed,
  total,
  status,
  variant = "fraction",
  label,
  onClick,
  onSettled,
}: ClassificationProgressRingProps) {
  const [leaving, setLeaving] = useState(false);
  const done = status === "done";
  const indeterminate = !done && total === 0;
  const fraction = done ? 1 : total > 0 ? Math.min(processed / total, 1) : 0;

  useEffect(() => {
    if (!done) {
      setLeaving(false);
      return;
    }
    const leave = window.setTimeout(() => setLeaving(true), SETTLE_MS);
    const settle = window.setTimeout(() => onSettled?.(), SETTLE_MS + 300);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(settle);
    };
  }, [done, onSettled]);

  return (
    <Tooltip content={label} position="right" arrow>
      <button
        type="button"
        className={`quick-nav-rail-item ${styles.item} ${leaving ? styles.leaving : ""}`}
        aria-label={label}
        data-state={done ? "done" : indeterminate ? "reading" : "running"}
        onClick={onClick}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className={`${styles.ring} ${indeterminate ? styles.ringTurning : ""}`}
          aria-hidden="true"
        >
          <circle
            className={styles.track}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
          />
          <circle
            className={styles.fill}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={
              indeterminate
                ? CIRCUMFERENCE * 0.72
                : CIRCUMFERENCE * (1 - fraction)
            }
          />
        </svg>
        <span className={styles.centre} aria-hidden="true">
          {done ? (
            <CheckRoundedIcon className={styles.tick} />
          ) : indeterminate ? null : variant === "fraction" ? (
            <span className={styles.stacked}>
              <span className={styles.numerator}>{processed}</span>
              <span className={styles.denominator}>{total}</span>
            </span>
          ) : (
            <span className={styles.count}>{processed}</span>
          )}
        </span>
      </button>
    </Tooltip>
  );
}
