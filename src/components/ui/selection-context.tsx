"use client";

import React from "react";

/**
 * Which of the two paper sections currently has something selected.
 *
 * Research and Projects each own their own `selectedId`; this only tracks
 * whether each one is open, so the shared backdrop behind them can react.
 * There are four states — neither open, one or the other open, both open —
 * and the artwork shows in exactly one of them.
 *
 * Kept as a context rather than lifting `selectedId` itself: the sections
 * stay in charge of what is selected, and only publish the one bit the
 * backdrop needs.
 */
type SelectionState = {
  research: boolean;
  projects: boolean;
};

type SelectionContextValue = SelectionState & {
  setOpen: (section: keyof SelectionState, open: boolean) => void;
  /** True only when nothing is selected in either section. */
  allClosed: boolean;
};

const SelectionContext = React.createContext<SelectionContextValue | null>(
  null,
);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = React.useState<SelectionState>({
    research: false,
    projects: false,
  });

  const setOpen = React.useCallback(
    (section: keyof SelectionState, open: boolean) => {
      // Bail when nothing changes: the sections report on every selection, and
      // re-setting the same value would rerender the whole subtree each time.
      setState((prev) =>
        prev[section] === open ? prev : { ...prev, [section]: open },
      );
    },
    [],
  );

  const value = React.useMemo<SelectionContextValue>(
    () => ({
      ...state,
      setOpen,
      allClosed: !state.research && !state.projects,
    }),
    [state, setOpen],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

/**
 * Read the selection state. Returns null outside a provider so a section can
 * still be rendered standalone without blowing up.
 */
export const useSelectionState = () => React.useContext(SelectionContext);

/**
 * Publish this section's open/closed state to the provider.
 */
export const useReportSelection = (
  section: keyof SelectionState,
  open: boolean,
) => {
  const ctx = useSelectionState();
  const setOpen = ctx?.setOpen;
  React.useEffect(() => {
    setOpen?.(section, open);
  }, [setOpen, section, open]);
};
