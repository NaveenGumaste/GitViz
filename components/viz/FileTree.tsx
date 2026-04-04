"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatBytes } from "@/lib/utils";
import type { TreeNode } from "@/lib/schemas/github";

interface FileTreeProps {
  nodes: TreeNode[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface HoverState {
  name: string;
  path: string;
  kind: "folder" | "file";
  extension?: string;
  size?: number;
}

interface TreeSize {
  width: number;
  height: number;
}

type NodeDatum = d3.HierarchyPointNode<TreeNode & { children?: TreeNode[] }>;

const FILE_COLORS: Record<string, string> = {
  ts: "#4f83ff",
  tsx: "#5da6ff",
  js: "#f7b500",
  jsx: "#ffcc66",
  css: "#ff4d98",
  md: "#19a974",
  json: "#aa7aff",
  yml: "#7dd3fc",
  yaml: "#7dd3fc",
  html: "#ff6b6b",
  svg: "#ff9248",
  go: "#6ee7b7",
  rs: "#f97316",
  py: "#4ade80",
  default: "#6b6b6b",
};

const LEGEND = [
  { label: "TypeScript", className: "bg-[#4f83ff]" },
  { label: "CSS", className: "bg-[#ff4d98]" },
  { label: "Markdown", className: "bg-[#19a974]" },
  { label: "JSON", className: "bg-[#aa7aff]" },
  { label: "Other", className: "bg-[#6b6b6b]" },
] as const;

export function FileTree({ nodes, isLoading, error, onRetry }: FileTreeProps): React.ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const previousPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<HoverState | null>(null);
  const [size, setSize] = useState<TreeSize>({ width: 0, height: 0 });

  useEffect(() => {
    setCollapsedPaths(new Set());
    setHoveredNode(null);
  }, [nodes]);

  // Re-run whenever nodes change so the ResizeObserver attaches after the
  // skeleton phase ends and the real container div becomes available.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    // Capture the current dimensions immediately so we don't have to wait
    // for the first ResizeObserver callback to fire.
    const rect = container.getBoundingClientRect();
    if (rect.width > 0) {
      setSize({ width: rect.width, height: Math.max(640, Math.round(rect.width * 0.84)) });
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = entry.contentRect.width;
      const height = Math.max(640, Math.round(width * 0.84));
      setSize({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [nodes]);

  const visibleTree = useMemo(() => filterCollapsedTree(nodes ?? [], collapsedPaths), [collapsedPaths, nodes]);

  useEffect(() => {
    if (!svgRef.current || !size.width || !size.height || visibleTree.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const radius = Math.max(180, Math.min(size.width, size.height) / 2 - 100);
    const rootData: TreeNode = {
      name: "root",
      path: "",
      kind: "folder",
      children: visibleTree,
    };

    const root = d3
      .hierarchy<TreeNode>(rootData, (d: TreeNode) => d.children)
      .sum((d: TreeNode) => (d.kind === "file" ? 1 : 0))
      .sort((a: d3.HierarchyNode<TreeNode>, b: d3.HierarchyNode<TreeNode>) => {
        if (a.data.kind !== b.data.kind) {
          return a.data.kind === "folder" ? -1 : 1;
        }

        return a.data.name.localeCompare(b.data.name);
      });

    const cluster = d3.cluster<TreeNode>().size([2 * Math.PI, radius]);
    cluster(root);

    const pointRoot = root as d3.HierarchyPointNode<TreeNode>;
    const nodeData = pointRoot.descendants().filter((node) => node.depth > 0) as NodeDatum[];
    const linkData = pointRoot.links().filter((link) => link.target.depth > 0) as d3.HierarchyPointLink<TreeNode>[];

    const chartRoot = svg
      .selectAll<SVGGElement, null>("g.chart-root")
      .data([null])
      .join("g")
      .attr("class", "chart-root")
      .attr("transform", `translate(${size.width / 2},${size.height / 2})`);

    const zoomLayer = chartRoot
      .selectAll<SVGGElement, null>("g.zoom-layer")
      .data([null])
      .join("g")
      .attr("class", "zoom-layer");

    svg
      .attr("viewBox", `0 0 ${size.width} ${size.height}`)
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.6, 3])
          .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
            zoomLayer.attr("transform", event.transform.toString());
          }),
      );

    const radialLink = d3
      .linkRadial<d3.HierarchyPointLink<TreeNode>, NodeDatum>()
      .angle((d: NodeDatum) => d.x)
      .radius((d: NodeDatum) => d.y);

    const linkSelection = zoomLayer
      .selectAll<SVGPathElement, d3.HierarchyPointLink<TreeNode>>("path.tree-link")
      .data(linkData, (d: d3.HierarchyPointLink<TreeNode>) => d.target.data.path);

    const linkEnter = linkSelection
      .enter()
      .append("path")
      .attr("class", "tree-link")
      .attr("fill", "none")
      .attr("stroke", "rgba(107,107,107,0.28)")
      .attr("stroke-width", 1.2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0);

    linkEnter
      .merge(linkSelection as d3.Selection<SVGPathElement, d3.HierarchyPointLink<TreeNode>, SVGGElement, null>)
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("d", (d) => radialLink(d) ?? "")
      .attr("opacity", 1);

    linkSelection
      .exit()
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("opacity", 0)
      .remove();

    const nodeSelection = zoomLayer
      .selectAll<SVGGElement, NodeDatum>("g.tree-node")
      .data(nodeData, (d: NodeDatum) => d.data.path) as d3.Selection<SVGGElement, NodeDatum, SVGGElement, null>;

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "tree-node")
      .attr("cursor", "pointer")
      .attr("transform", (d: NodeDatum) => radialTransform(previousPosition(d.data.path, previousPositionsRef.current, d)))
      .attr("opacity", 0);

    nodeEnter
      .append("circle")
      .attr("r", (d: NodeDatum) => (d.data.kind === "folder" ? 7.5 : 5.5))
      .attr("fill", (d: NodeDatum) => nodeFill(d.data))
      .attr("stroke", (d: NodeDatum) => (d.data.kind === "folder" ? "#ff4d00" : "rgba(13,13,13,0.2)"))
      .attr("stroke-width", (d: NodeDatum) => (d.data.kind === "folder" ? 1.5 : 1));

    nodeEnter
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: NodeDatum) => ((d.x < Math.PI) === !d.children ? 12 : -12))
      .attr("text-anchor", (d: NodeDatum) => ((d.x < Math.PI) === !d.children ? "start" : "end"))
      .attr("transform", (d: NodeDatum) => (d.x >= Math.PI ? "rotate(180)" : null))
      .attr("class", "fill-ink text-[10px] font-medium tracking-[0.04em] dark:fill-paper")
      .text((d: NodeDatum) => d.data.name);

    nodeEnter
      .on("mouseenter", (_event: MouseEvent, d: NodeDatum) => {
        setHoveredNode({
          name: d.data.name,
          path: d.data.path,
          kind: d.data.kind,
          extension: d.data.extension,
          size: d.data.size,
        });
      })
      .on("mouseleave", () => setHoveredNode(null))
      .on("click", (_event: MouseEvent, d: NodeDatum) => {
        if (d.data.kind === "folder") {
          setCollapsedPaths((current) => {
            const next = new Set(current);
            if (next.has(d.data.path)) {
              next.delete(d.data.path);
            } else {
              next.add(d.data.path);
            }
            return next;
          });
        }
      });

    nodeEnter
      .merge(nodeSelection)
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("transform", (d: NodeDatum) => radialTransform(d))
      .attr("opacity", 1);

    const nodeExit = nodeSelection.exit() as d3.Selection<SVGGElement, NodeDatum, SVGGElement, null>;

    nodeExit
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("transform", (d: NodeDatum) => radialTransform(previousPosition(d.data.path, previousPositionsRef.current, d)))
      .attr("opacity", 0)
      .remove();

    previousPositionsRef.current = new Map(
      nodeData.map((node) => [
        node.data.path,
        {
          x: node.x,
          y: node.y,
        },
      ]),
    );
  }, [collapsedPaths, nodes, size.height, size.width, visibleTree]);

  if (isLoading && !nodes) {
    return <FileTreeSkeleton />;
  }

  if (error && !nodes) {
    return <ErrorState title="File tree unavailable" message={error} onRetry={onRetry} variant={error.toLowerCase().includes("rate limit") ? "rate-limit" : "default"} />;
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Card className="flex min-h-[760px] items-center justify-center">
        <p className="text-sm text-muted dark:text-paper/65">No tree data is available for this repository yet.</p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div ref={containerRef} className="relative min-h-[760px]">
        <svg ref={svgRef} className="h-full w-full" />

        {hoveredNode ? (
          <div className="pointer-events-none absolute bottom-4 left-4 max-w-sm rounded-3xl border border-border bg-paper/95 p-4 text-ink shadow-xl backdrop-blur-sm dark:border-border-dark dark:bg-surface/95 dark:text-paper">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/60">Node details</p>
            <p className="mt-2 font-display text-2xl leading-tight">{hoveredNode.name}</p>
            <p className="mt-1 break-all text-xs text-muted dark:text-paper/60">{hoveredNode.path}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-accent-muted px-3 py-1 text-accent">{hoveredNode.kind}</span>
              {hoveredNode.extension ? <span className="rounded-full bg-surface-light px-3 py-1 text-ink dark:bg-paper/10 dark:text-paper">{hoveredNode.extension.toUpperCase()}</span> : null}
              {typeof hoveredNode.size === "number" ? <span className="rounded-full bg-surface-light px-3 py-1 text-ink dark:bg-paper/10 dark:text-paper">{formatBytes(hoveredNode.size)}</span> : null}
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-4 right-4 rounded-3xl border border-border bg-paper/90 p-4 shadow-lg backdrop-blur-sm dark:border-border-dark dark:bg-surface/90">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted dark:text-paper/55">Legend</p>
          <div className="mt-3 grid gap-2">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-ink dark:text-paper">
                <span className={cn("size-3 rounded-full", item.className)} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function filterCollapsedTree(nodes: TreeNode[], collapsedPaths: Set<string>): TreeNode[] {
  return nodes.map((node) => {
    if (node.kind === "file" || !node.children || node.children.length === 0) {
      return node;
    }

    if (collapsedPaths.has(node.path)) {
      return { ...node, children: undefined };
    }

    return {
      ...node,
      children: filterCollapsedTree(node.children, collapsedPaths),
    };
  });
}

function radialTransform(node: { x: number; y: number }): string {
  return `rotate(${(node.x * 180) / Math.PI - 90}) translate(${node.y},0)`;
}

function previousPosition(
  path: string,
  cache: Map<string, { x: number; y: number }>,
  fallback: { x: number; y: number },
): { x: number; y: number } {
  return cache.get(path) ?? fallback;
}

function nodeFill(node: TreeNode): string {
  if (node.kind === "folder") {
    return "rgba(255,77,0,0.16)";
  }

  if (node.extension) {
    return FILE_COLORS[node.extension.toLowerCase()] ?? FILE_COLORS.default;
  }

  return FILE_COLORS.default;
}

function FileTreeSkeleton(): React.ReactNode {
  return (
    <Card className="flex min-h-[760px] flex-col items-center justify-center gap-4">
      <Loader2 className="size-8 animate-spin text-accent" aria-hidden="true" />
      <p className="text-sm text-muted dark:text-paper/65">Constructing file tree...</p>
    </Card>
  );
}
