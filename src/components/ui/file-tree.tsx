"use client";

import React, { useState } from "react";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TreeViewElement = {
  id: string;
  name: string;
  type?: "file" | "folder";
  isSelectable?: boolean;
  children?: TreeViewElement[];
};

type TreeProps = {
  elements: TreeViewElement[];
  initialSelectedId?: string;
  initialExpandedItems?: string[];
  onSelect?: (id: string) => void;
  className?: string;
};

const isFolder = (el: TreeViewElement) =>
  el.type === "folder" || Array.isArray(el.children);

/**
 * Minimal click-to-expand / click-to-select file tree. No accordion
 * primitive — just a Set of expanded ids in state, with the open/close
 * animation done via a 0fr/1fr grid-rows transition (pure CSS, no height
 * measuring required).
 */
export const Tree: React.FC<TreeProps> = ({
  elements,
  initialSelectedId,
  initialExpandedItems = [],
  onSelect,
  className,
}) => {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [expanded, setExpanded] = useState(new Set(initialExpandedItems));

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (el: TreeViewElement) => {
    if (el.isSelectable === false) return;
    if (isFolder(el)) {
      // Folders only toggle open/closed — the persistent "selected" tint
      // is reserved for files, which drive the detail pane.
      toggleExpand(el.id);
      return;
    }
    setSelectedId(el.id);
    onSelect?.(el.id);
  };

  const renderNode = (el: TreeViewElement, depth: number) => {
    const folder = isFolder(el);
    const isOpen = expanded.has(el.id);
    const isSelected = !folder && selectedId === el.id;
    const disabled = el.isSelectable === false;

    return (
      <li key={el.id}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(el)}
          style={{ paddingLeft: `${depth * 1.1 + 0.5}rem` }}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left font-mono text-sm transition-colors",
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-tint-hover",
            isSelected && !disabled && "bg-tint-active/60"
          )}
        >
          {folder ? (
            isOpen ? (
              <FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
            )
          ) : (
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{el.name}</span>
        </button>

        {folder && el.children && (
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-in-out"
            style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
          >
            <ul className="overflow-hidden">
              {el.children.map((child) => renderNode(child, depth + 1))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <ul className={cn("flex flex-col gap-0.5", className)}>
      {elements.map((el) => renderNode(el, 0))}
    </ul>
  );
};
