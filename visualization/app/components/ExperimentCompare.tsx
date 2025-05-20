"use client"
import {useRef, useEffect, useLayoutEffect} from "react"
import {Graph} from "../alogrithms/util/graphType"
import * as echarts from "echarts"
function run(_rawData: any, myChart: any, title: string, Y: string) {

  const methods = [
    'C-TMR',
    'TP-TMR',
    'R-TMR',
    'FDT-TMR'
  ];
  const datasetWithFilters: echarts.DatasetComponentOption[] = [];
  const seriesList: echarts.SeriesOption[] = [];
  echarts.util.each(methods, function (method) {
    var datasetId = 'dataset_' + method;
    datasetWithFilters.push({
      id: datasetId,
      fromDatasetId: 'dataset_raw',
      transform: {
        type: 'filter',
        config: {
          and: [
            { dimension: Y , gte: 0 },
            { dimension: 'Method', '=': method }
          ]
        }
      }
    });
    seriesList.push({
      type: 'line',
      datasetId: datasetId,
      showSymbol: false,
      name: method,
      endLabel: {
        show: true,
        formatter: function (params: any) {
          return params.value[2] + ': ' + params.value[1];
        }
      },
      labelLayout: {
        moveOverlap: 'shiftY'
      },
      emphasis: {
        focus: 'series'
      },
      encode: {
        x: 'Orginal Tasks Num',
        y: Y,
        label: [Y, 'Orginal Tasks Num'],
        itemName: Y,
        tooltip: [Y]
      }
    });
  });

  const option = {
    animationDuration: 10000,
    dataset: [
      {
        id: 'dataset_raw',
        source: _rawData
      },
      ...datasetWithFilters
    ],
    title: {
      text: title
    },
    tooltip: {
      order: 'valueDesc',
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      nameLocation: 'middle',
      name: 'Original Tasks Num',
      nameGap: 30,
    },
    yAxis: {
      name: Y
    },
    grid: {
      right: 140
    },
    series: seriesList
  };

  myChart.setOption(option);
}

const ExperimentCompare = ({taskNumExperimentData, taskPofExperimentData}: {taskNumExperimentData?: any, taskPofExperimentData: any}) => {
    const chartsRef = useRef<HTMLDivElement>(null);
    const pofChartRef = useRef<HTMLDivElement>(null);
    // 
    useEffect(() => {
        const myChart = echarts.init(chartsRef.current);
        const pofChart = echarts.init(pofChartRef.current);
         // Initialize the echarts instance based on the prepared dom
        // Specify the configuration items and data for the chart

        // Display the chart using the configuration items and data just specified.
        run(taskNumExperimentData, myChart, "Excuted Task Num Comparison", "Excuted Tasks Num");
        run(taskPofExperimentData || [], pofChart, "PoF Comparison", "PoF")
        /**
         * experimentData [["Orginal Tasks Num", "Excuted Tasks Num", "Method"]]
         * 
         *  */ 

    }, [taskNumExperimentData, taskPofExperimentData]);
    
    return (
        <div className="flex items-center w-full align-middle ">
            <div id="1" style={{width: "600px", height: '400px'}} ref={chartsRef}></div>
            <div id="2" style={{width: "600px", height: '400px'}} ref={pofChartRef}></div>
        </div>
    )
}

export default ExperimentCompare
