import React, { useEffect } from 'react'
import { convertUnderlineToTitleCase } from '../../../utils/convertStringFunctions'

import { Tooltip, Chart, Colors, LinearScale, CategoryScale} from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import { Panel } from 'primereact/panel';
import { useTheme } from 'next-themes';


export default function BoxplotChart({ plotdata, metric, chartSize }) {
    let chart;
    Chart.register(Colors);
    Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale, Tooltip);
    let theme = useTheme();

    const createChart = () => {
        const ctx = (document.getElementById(metric) as HTMLCanvasElement).getContext("2d");

        chart = new Chart(ctx, {
            type: 'boxplot',
            data: plotdata,
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { beginAtZero: false,
                        ticks: {
                            callback: (val: number) => {
                                // if (val >= 1000000000)
                                //     return `${parseFloat((val / 1000000000).toFixed(1))}B`
                                // else if (val >= 1000000)
                                //     return `${parseFloat((val / 1000000).toFixed(1))}M`
                                // else if (val >= 1000)
                                //     return `${parseFloat((val / 1000).toFixed(1))}K`
                                return parseFloat(val.toFixed(1));
                            },
                            color: theme.theme === "dark" ? "lightgrey" : "black"
                        },
                    },
                    y: {
                        ticks: {
                            autoSkip: false,
                            color: theme.theme === "dark" ? "lightgrey" : "black"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        // Disable the on-canvas tooltip
                        enabled: false,
                        external: function (context) {
                            // Tooltip Element
                            let tooltipEl = document.getElementById(`tooltip-${metric}`);
        
                            // Create element on first render
                            if (!tooltipEl) {
                                tooltipEl = document.createElement('div');
                                tooltipEl.id = `tooltip-${metric}`;
                                tooltipEl.innerHTML = '<table></table>';
                                document.body.appendChild(tooltipEl);
                            }
        
                            // Hide if no tooltip
                            const tooltipModel = context.tooltip;
                            if (tooltipModel.opacity === 0) {
                                tooltipEl.style.opacity = "0";
                                return;
                            }
        
                            // Set caret Position
                            tooltipEl.classList.remove('above', 'below', 'no-transform');
                            if (tooltipModel.yAlign) {
                                tooltipEl.classList.add(tooltipModel.yAlign);
                            } else {
                                tooltipEl.classList.add('no-transform');
                            }
        
                            function getBody(bodyItem) {
                                return bodyItem.lines;
                            }
        
                            // Set Text
                            if (tooltipModel.body) {
                                const titleLines = tooltipModel.title || [];
                                const bodyLines = tooltipModel.body.map(getBody);
        
                                let innerHtml = '<thead>';
        
                                titleLines.forEach(function (title) {
                                    innerHtml += '<tr><th>' + title + '</th></tr>';
                                });
                                innerHtml += '</thead><tbody>';
        
                                bodyLines.forEach(function (body, i) {
                                    let style = '';
                                    const span = '<span style="' + style + '">' + body + '</span>';
                                    innerHtml += '<tr><td>' + span + '</td></tr>';
                                });
                                innerHtml += '</tbody>';
        
                                let tableRoot = tooltipEl.querySelector('table');
                                tableRoot.innerHTML = innerHtml;
                            }
        
                            const position = context.chart.canvas.getBoundingClientRect();
        
                            // Display, position, and set styles for font
                            tooltipEl.style.opacity = "1";
                            tooltipEl.style.position = 'absolute';
                            tooltipEl.style.left = position.left + window.scrollX + tooltipModel.caretX + 'px';
                            tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY + 'px';
                            tooltipEl.style.padding = "10px";
                            tooltipEl.style.pointerEvents = 'none';
                            tooltipEl.style.zIndex = "9999";
                            tooltipEl.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                            tooltipEl.style.borderRadius = "3px";
                            tooltipEl.style.color = "white";
                            tooltipEl.style.borderColor = "rgba(0, 0, 0, 0.5)";
                        }

                    }
                },
                
            },
        });
        chart.resize(0,(plotdata.labels.length*40 > 250?plotdata.labels.length*40 : 250));
    };

    useEffect(() => {
        createChart();
        return () => {
            chart.destroy();
        };
    }, [plotdata]);

    return (
        <Panel header={convertUnderlineToTitleCase(metric)} className="text-center" style={{ width: chartSize }}>
            <div>
                <canvas id={metric}></canvas>
            </div>
        </Panel>
    )
}
