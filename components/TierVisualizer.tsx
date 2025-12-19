import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Project, TierType } from '../types';

interface TierVisualizerProps {
  projects: Project[];
}

const TierVisualizer: React.FC<TierVisualizerProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    // Initial size
    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // D3 Logic
  useEffect(() => {
    if (!svgRef.current || projects.length === 0 || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Prepare Data
    const nodes: any[] = [];
    const links: any[] = [];

    projects.forEach(p => {
        nodes.push({ id: p.id, name: p.name, tier: p.tier, val: p.verifiedLinks });
    });

    const tier1 = nodes.filter(n => n.tier === TierType.TIER_1);
    const tier2 = nodes.filter(n => n.tier === TierType.TIER_2);
    const tier3 = nodes.filter(n => n.tier === TierType.TIER_3);

    // Mock connections
    tier2.forEach((t2, i) => {
        const target = tier1[i % tier1.length];
        if (target) links.push({ source: t2.id, target: target.id });
    });
    tier3.forEach((t3, i) => {
         const target = tier2[i % tier2.length];
         if (target) links.push({ source: t3.id, target: target.id });
    });

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Draw lines
    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    // Draw nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => Math.min(Math.max(d.val / 10, 5), 20))
      .attr("fill", (d) => {
          if (d.tier === TierType.TIER_1) return "#10b981"; // Emerald
          if (d.tier === TierType.TIER_2) return "#3b82f6"; // Blue
          return "#a855f7"; // Purple
      })
      .call((d3.drag() as any)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    node.append("title")
      .text(d => `${d.name} (${d.tier})`);

    // Ticker
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => Math.max(10, Math.min(width - 10, d.x)))
        .attr("cy", (d: any) => Math.max(10, Math.min(height - 10, d.y)));
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
        simulation.stop();
    }

  }, [projects, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden min-h-[300px]">
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-2 rounded backdrop-blur-sm pointer-events-none">
            <h3 className="text-sm font-bold text-slate-300">Network Topology</h3>
            <div className="flex flex-col gap-1 mt-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Tier 1</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Tier 2</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Tier 3</div>
            </div>
        </div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block" />
    </div>
  );
};

export default TierVisualizer;