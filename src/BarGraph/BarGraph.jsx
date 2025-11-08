import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import React, { useState, useMemo, useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarGraph = ({
    groupedData = [],
    treeSnapshots = [],
    x_axis_label = 'X',
    y_axis_label = 'Count',
    datasetLabel = 'Count',
    stepInterval = 500
}) => {
    const labels = groupedData["xAxisVals"];
    const xAxisVals = groupedData?.xAxisVals || [];

    let values = groupedData["tree"] || []
    // let arrFreq = values.split('\n') //now there all in there own little groups within changeThisName liek arrs
    const [dataSet, setDataSet] = useState([0]*xAxisVals.length)
    
    // // let lineChartData;
    let freqArr = []
    if(values.length !== 0) freqArr = values.split('\n')


        const [chartData, setChartData] = useState(() => ({
            labels: groupedData.xAxisVals,
            datasets: [
                {
                    label: datasetLabel,
                    data: dataSet,
                    backgroundColor: 'rgba(125, 20, 190, 0.8)',
                    borderColor: 'rgba(56, 12, 83, 1)',
                    borderWidth: 1,
                },
            ],
        }));

    const options = useMemo(() => ({
        responsive: true,
        scales: {
            x: { type: 'category' },
            y: {
                beginAtZero: true,
                max: groupedData["yAxisMax"],
                title: {
                    display: true,
                    text: "Number of Crimes Committed"
                }
            }
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: datasetLabel || "result"},

        },
            animation: { //build animation
                duration: 100, // (500 was too quick)
                easing: 'linear', //steady instead
        },
    }), [datasetLabel, groupedData["yAxisMax"]]);


    useEffect(() => {
        const snapshots = freqArr
        .filter(line => line.trim() !== '')//There MIGHT be empty lines idk
        .map(snap => {
            const counts = Array(xAxisVals.length).fill(0);
            snap.split('|').forEach(part => {
                const keyMatch = part.indexOf('key:');
                const countMatch = part.match(/frequency:\s*(\d+)/);
                //if key and count found, update counts
                if (keyMatch && countMatch) {
                    const key = part.slice(keyMatch+4).trim(''); //get actual key string
                    const count = parseInt(countMatch[1], 10); //Convert to number
                    //Find index of key in x labels
                    const index = xAxisVals.indexOf(key);
                    if (index !== -1) { //assuming it exists store it
                        counts[index] = count;
                    }
                }
            });
            return counts;
        })

        let step = 0;
        const interval = setInterval(() => {
            if (step >= snapshots.length) {
                clearInterval(interval);

                setChartData(prev => ({
                    ...prev,
                    labels: groupedData.xAxisVals,
                    datasets: prev.datasets.map(ds => ({
                        ...ds,
                        data: snapshots[snapshots.length - 1],
                    })),
                }));

                return;
            }

            setChartData(prev => ({
                ...prev,
                labels: groupedData.xAxisVals,
                datasets: prev.datasets.map(ds => ({
                    ...ds,
                    data: snapshots[step],
                })),
            }));

            step++;
        }, stepInterval);
        return () => clearInterval(interval);
    }, [groupedData.tree, xAxisVals, stepInterval]);

    //animate based on searchOrder
    // useEffect(() => {
    //     if (searchOrder.length === 0) return; //No animation if no search order
    //     let i = 0; //Current position
    //     const interval = setInterval(() => { 
    //         if (i >= searchOrder.length) {
    //             clearInterval(interval); //stop when finished
    //             return;
    //         }
    //         setChartData((prevData) => {
    //             //i think this was an issue because it wasnt updating state correctly
    //             const newDatasets = prevData.datasets.map(ds => ({...ds, data: [...ds.data]})); //copy
    //             const idx = searchOrder[i]; //get new index to update
    //             newDatasets[0].data[idx] = yAxisVals[idx]; //set actual value at that index
    //             return {...prevData, datasets: newDatasets};
    //         });
    //         i++; //move next
    //     }, stepInterval);
    //     return () => clearInterval(interval);
    // }, [searchOrder, xAxisVals, yAxisVals, stepInterval]);
    return  (
        <div style={{ maxWidth: '990px', width: '100%' }}>
            <Bar key={datasetLabel} options={options} data={chartData}></Bar>
        </div>
    );

};

export default BarGraph;