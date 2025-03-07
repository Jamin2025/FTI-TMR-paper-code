"use client"
import {useRef, useEffect} from "react"
import {Graph} from "./util/graphType"
import robotGraph from "./dataset/robot.json"

const GraphVisiualization = ({graphData}: {graphData?: Graph}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return
        const ctx = canvas.getContext('2d');
        if (!ctx) return
        // 定义数据点
        const dataPoints = [
            { x: 50, y: 150 },
            { x: 100, y: 100 },
            { x: 150, y: 120 },
            { x: 200, y: 80 },
            { x: 250, y: 90 },
            { x: 300, y: 60 }
        ];

        // 绘制折线图
        ctx.beginPath();
        ctx.moveTo(dataPoints[0].x, dataPoints[0].y);
        for (let i = 1; i < dataPoints.length; i++) {
            ctx.lineTo(dataPoints[i].x, dataPoints[i].y);
        }
        ctx.stroke();

        // 绘制数据点
        ctx.fillStyle = 'blue';
        dataPoints.forEach(point => {
            ctx.beginPath();
            ctx.fillRect(point.x, point.y, 10, 5);
            ctx.fill();
        });
    }, []);
    
    return (
        <div className="flex items-center w-full align-middle justify-center">
            <canvas ref={canvasRef} id="myCanvas" width="400" height="200"></canvas>
        </div>
    )
}

export default GraphVisiualization
