"use client"
import {useRef, useEffect, useLayoutEffect} from "react"
import {Graph} from "../alogrithms/util/graphType"
import * as echarts from "echarts"
function computeLevels(nodes: any, edges: any) {
    const inDegree = new Map(nodes.map(n => [n.id, 0]));
    const graph = new Map();

    for (const { source, target } of edges) {
      inDegree.set(target, inDegree.get(target) + 1);
      if (!graph.has(source)) graph.set(source, []);
      graph.get(source).push(target);
    }

    const levelMap = new Map();
    const queue = [];

    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push({ id, level: 0 });
    }

    while (queue.length > 0) {
      const { id, level } = queue.shift();
      levelMap.set(id, level);
      for (const neighbor of graph.get(id) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push({ id: neighbor, level: level + 1 });
        }
      }
    }

    return levelMap;
  }
  function assignPositions(nodes: any, levelMap: any, amplife?: boolean) {
    const levels: any = {};
    for (const node of nodes) {
      const level = levelMap.get(node.id) || 0;
      if (!levels[level]) levels[level] = [];
      levels[level].push(node.id);
    }

    const positioned: any = [];
    const xSpacing = 600;
    const ySpacing = 180 +(amplife ? 200 : 0);

    for (const [levelStr, nodeIds] of Object.entries(levels)) {
      const level = parseInt(levelStr);
      nodeIds.forEach((id, index) => {
        positioned.push({
          name: nodes[id].name,
          x: level * xSpacing,
          y: index * ySpacing
        });
      });
    }

    return positioned;
  }
const GraphVisiualization = ({graphData, amplife}: {graphData?: Graph, amplife?: boolean}) => {
    const graphRef = useRef<HTMLDivElement>(null);
    // 
    useEffect(() => {
         // Initialize the echarts instance based on the prepared dom
        if (!graphData) return
        var myChart = echarts.init(graphRef.current);
        const nodeList = graphData.map(item => ({name: `T${item.id}\n${item.duration}`, id: item.id}))
       
        const links = []
        for (let id = 0; id < graphData.length; id++) {
            const node = graphData[id];
            for (let predecessor of node.predecessors) {
                links.push({source: +predecessor, target: id})
            }
        }
        const levelMap = computeLevels(nodeList, links)
        const positionedNodes = assignPositions(nodeList, levelMap, amplife);
        const multi = amplife ? 2 : 1
        // Specify the configuration items and data for the chart
        const option = {
            title: {
              text: ''
            },
            tooltip: {},
            animationDurationUpdate: 1500,
            
            animationEasingUpdate: 'quinticInOut',
            series: [
              {
                type: 'graph',
                layout: 'none',
                symbolSize: 15 * multi,
                coordinateSystem: null,
                label: {
                    show: true,
                    fontSize: 6 * multi
                },
                edgeSymbol: ['circle', 'arrow'],
                edgeSymbolSize: 4,
                edgeLabel: {
                  fontSize: 6 * multi
                },
                data: positionedNodes,
                // links: [],
                links: links,
                lineStyle: {
                  opacity: 0.9,
                  width: 0.5,
                  curveness: 0
                }
              }
            ]
        };

        // Display the chart using the configuration items and data just specified.
        myChart.setOption(option);
    }, [graphData, amplife]);
    
    return (
        <div className="flex items-center w-full align-middle justify-center">
            <div id="main" style={{width: "100%", height: '700px'}} ref={graphRef}></div>
        </div>
    )
}

export default GraphVisiualization
