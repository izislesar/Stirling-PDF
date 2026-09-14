import { useEffect, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import LocalIcon from "@app/components/shared/LocalIcon";
import { NavSurface } from "@app/ui/NavSurface";
import {
  QuickNavRailBase,
  type QuickNavEntry,
} from "@app/components/shared/quickNav/QuickNavRailBase";
import {
  ClassificationProgressRing,
  type ClassificationProgressRingProps,
  type ClassificationProgressRingVariant,
} from "@app/components/quickNav/ClassificationProgressRing";
import "@app/components/shared/quickNav/QuickNavRailContainer.css";

/**
 * Draft of the rail indicator for a Downloads folder being classified in the
 * background. The `Live` story runs the whole life of one: reading, filling, tick, gone.
 */
const meta = {
  title: "Onboarding/Classification Progress Ring",
  component: ClassificationProgressRing,
  parameters: { layout: "centered" },
  args: {
    processed: 37,
    total: 450,
    status: "running",
    variant: "fraction",
    label: "Classifying Downloads: 37 of 450",
  },
  argTypes: {
    variant: { control: "radio", options: ["fraction", "count"] },
    status: { control: "radio", options: ["running", "done"] },
  },
} satisfies Meta<typeof ClassificationProgressRing>;
export default meta;

type Story = StoryObj<typeof meta>;

const SIZE = "1.125rem";

/** The rail column the ring sits in, so it is judged at the size it will really be. */
function Rail({ children }: { children: ReactNode }) {
  const entry = (id: string, label: string, icon: ReactNode): QuickNavEntry => ({
    id,
    label,
    icon,
    onClick: () => {},
  });
  return (
    <div className="quick-nav-rail-container" style={{ height: 420 }}>
      <NavSurface className="quick-nav-rail-surface">
        <QuickNavRailBase
          groups={[
            [
              entry(
                "reader",
                "Reader",
                <LocalIcon icon="menu-book-outline-rounded" width={SIZE} height={SIZE} />,
              ),
              entry(
                "editor",
                "Editor",
                <LocalIcon icon="edit-outline-rounded" width={SIZE} height={SIZE} />,
              ),
            ],
            [
              entry(
                "files",
                "File library",
                <LocalIcon icon="folder-outline-rounded" width={SIZE} height={SIZE} />,
              ),
              entry(
                "automate",
                "Automate",
                <LocalIcon icon="rebase-outline-rounded" width={SIZE} height={SIZE} />,
              ),
            ],
          ]}
          footer={<div className="quick-nav-rail-footer">{children}</div>}
        />
      </NavSurface>
    </div>
  );
}

/** Stacked x over y inside the ring. */
export const Fraction: Story = {
  render: (args) => (
    <Rail>
      <ClassificationProgressRing {...args} />
    </Rail>
  ),
};

/** Just x inside; the total lives in the tooltip. Larger digits, less to read. */
export const CountOnly: Story = {
  args: { variant: "count" },
  render: (args) => (
    <Rail>
      <ClassificationProgressRing {...args} />
    </Rail>
  ),
};

/** Folder still being read: no total yet, so the ring turns instead of filling. */
export const Reading: Story = {
  args: { processed: 0, total: 0, label: "Reading Downloads folder" },
  render: (args) => (
    <Rail>
      <ClassificationProgressRing {...args} />
    </Rail>
  ),
};

/** The moment it finishes: full ring, tick, then it collapses out of the rail. */
export const Done: Story = {
  args: {
    processed: 450,
    total: 450,
    status: "done",
    label: "Downloads classified: 450 PDFs",
  },
  render: (args) => (
    <Rail>
      <ClassificationProgressRing {...args} />
    </Rail>
  ),
};

function LiveRing({
  variant,
  total,
  msPerFile,
}: {
  variant: ClassificationProgressRingVariant;
  total: number;
  msPerFile: number;
}) {
  const [props, setProps] = useState<Omit<
    ClassificationProgressRingProps,
    "onSettled" | "variant"
  > | null>({ processed: 0, total: 0, status: "running", label: "Reading" });
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let stopped = false;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => !stopped && fn(), ms));
    };
    setProps({
      processed: 0,
      total: 0,
      status: "running",
      label: "Reading Downloads folder",
    });
    for (let i = 1; i <= total; i += 1) {
      at(900 + i * msPerFile, () =>
        setProps({
          processed: i,
          total,
          status: "running",
          label: `Classifying Downloads: ${i} of ${total}`,
        }),
      );
    }
    at(900 + total * msPerFile + 300, () =>
      setProps({
        processed: total,
        total,
        status: "done",
        label: `Downloads classified: ${total} PDFs`,
      }),
    );
    return () => {
      stopped = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [cycle, total, msPerFile]);

  // Removed from the rail once the tick has been seen, as the real one will be, then a
  // pause before it starts over so the empty rail is visible too.
  const settle = () => {
    setProps(null);
    window.setTimeout(() => setCycle((n) => n + 1), 1500);
  };

  return (
    <Rail>
      {props && (
        <ClassificationProgressRing
          {...props}
          variant={variant}
          onSettled={settle}
        />
      )}
    </Rail>
  );
}

/** One whole run on a loop: reading, filling, tick, collapse, gone, and again. */
export const Live: Story = {
  args: { total: 60 },
  render: (args) => (
    <LiveRing variant={args.variant ?? "fraction"} total={args.total} msPerFile={80} />
  ),
};
