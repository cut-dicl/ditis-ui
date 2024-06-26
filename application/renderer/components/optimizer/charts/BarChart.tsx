import React, { use } from 'react'

import { convertUnderlineToTitleCase } from '../../../utils/convertStringFunctions'

import { Chart, Colors, BarElement, CategoryScale, BarController, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Panel } from 'primereact/panel';
import { useTheme } from 'next-themes';

export default function BarChart({ plotdata, metric, chartSize, print }) {
    let chart;
    Chart.register(Colors);
    Chart.register(BarElement, CategoryScale, BarController, LinearScale, Tooltip);
    let theme = useTheme();
    const [err, setErr] = React.useState(false);
    

    const createChart = () => {

        if (plotdata.labels.length === 0) {
            setErr(true);
            return;
        }

        // @ts-ignore
        const ctx = document.getElementById("Bar_"+metric).getContext("2d");
        if (chart)
            chart.destroy();
        chart = new Chart(ctx, {
            type: 'bar',
            data: plotdata,
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: print,
                    },
                    tooltip: {
                        position: 'average',
                    },
                    datalabels: {
                        color: theme.theme === "dark" ? "white" : "black",
                        font: {
                            weight: 'bold'
                        }
                    },
                    title: {
                        display: print,
                        text: convertUnderlineToTitleCase(metric),
                        color: theme.theme === "dark" ? "white" : "black",
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            callback: (val: number) => {
                                if (val >= 1000000000)
                                    return `${parseFloat((val / 1000000000).toFixed(1))}B`
                                else if (val >= 1000000)
                                    return `${parseFloat((val / 1000000).toFixed(1))}M`
                                else if (val >= 1000)
                                    return `${parseFloat((val / 1000).toFixed(1))}K`
                                return val;
                            },
                            color: theme.theme === "dark" ? "lightgrey" : "black"
                        }
                    },
                    y: {
                        ticks: {
                            autoSkip: false,
                            color: theme.theme === "dark" ? "lightgrey" : "black"
                        }
                    }
                }
                
                
            },
            plugins: [ChartDataLabels]
        });
        chart.resize(0,Math.max(plotdata.labels.length * plotdata.labels[0].length * 30, 200));
        
    };

    React.useEffect(() => {
        createChart();
        return () => {
            if (chart)
                chart.destroy();
        };
    }, [plotdata]);


    if (err) {
        return (
            <div className="text-center text-danger">No data available</div>
        )
    }
    if (print) {
        return (
            <div style={{ width: "100%" }}>
                <canvas id={"Bar_" + metric} style={{display:"block"}}></canvas>
            </div>         
        )
    }

    return (
        <Panel header={convertUnderlineToTitleCase(metric)} className="text-center" style={{ width: chartSize }}>
            <div>
                <canvas id={"Bar_" + metric}></canvas>
            </div>
        </Panel>
    )
}
