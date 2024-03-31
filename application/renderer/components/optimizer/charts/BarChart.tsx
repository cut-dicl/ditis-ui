import React, { use } from 'react'

import { convertUnderlineToTitleCase } from '../../../utils/convertStringFunctions'

import { Chart, Colors, BarElement, CategoryScale, BarController, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Panel } from 'primereact/panel';
import { useTheme } from 'next-themes';

export default function BarChart({ plotdata, metric, chartSize }) {
    let chart;
    Chart.register(Colors);
    Chart.register(BarElement, CategoryScale, BarController, LinearScale, Tooltip);
    let theme = useTheme();
    

    const createChart = () => {

        // @ts-ignore
        const ctx = document.getElementById(metric).getContext("2d");
        chart = new Chart(ctx, {
            type: 'bar',
            data: plotdata,
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        position: 'average',
                    },
                    datalabels: {
                        color: theme.theme === "dark" ? "white" : "black",
                        font: {
                            weight: 'bold'
                        }
                    }
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
        chart.resize(0,(plotdata.labels[0].length*160 > 250 ? plotdata.labels[0].length*160 : 250));
    };

    React.useEffect(() => {
        createChart();
        return () => {
            chart.destroy();
        };
    }, [plotdata]);

    return (
            <Panel header={convertUnderlineToTitleCase(metric)} className="text-center" style={{ width: chartSize, height: "auto" }}>             
                <canvas id={metric}></canvas>              
            </Panel>
    )
}
