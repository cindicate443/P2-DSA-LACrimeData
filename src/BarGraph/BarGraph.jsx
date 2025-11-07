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
    const yAxisVals = groupedData?.yAxisVals || [];
    
    // let dataValues;
    // let lineChartData;
    // let values = groupedData["tree"]
    // let changeThisName = values.split('\n')) //now there all in there own little groups within changeThisName liek arrs
    // for(let i = 0; i < groupedData["tree"].length; i++) {
        // dataValues = [1] this isnt right i was just rtying stuff
        const [chartData, setChartData] = useState(() => ({
            labels: groupedData.xAxisVals,
            datasets: [
                {
                    label: datasetLabel,
                    data: Array(yAxisVals.length).fill(0),
                    backgroundColor: 'rgba(125, 20, 190, 0.8)',
                    borderColor: 'rgba(56, 12, 83, 1)',
                    borderWidth: 1,
                },
            ],
        }));
    // }

    const options = useMemo(() => ({
        responsive: true,
        scales: {
            x: { type: 'category' },
            y: { beginAtZero: true },
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: datasetLabel || 'Results'},

        },
            animation: { //build animation
                duration: 300, // (500 was too quick)
                easing: 'linear', //steady instead
        },
    }), [datasetLabel]);



    useEffect(() => {
        if (treeSnapshots.length === 0) return; //No snapshots to animate
        let step = 0;
        const interval = setInterval(() => {
            if (step >= treeSnapshots.length) {
                clearInterval(interval); //stop when finished
                return;
            }
            setChartData(prev => ({
                ...prev,
                datasets: prev.datasets.map(ds => ({
                    ...ds,
                    data: treeSnapshots[step],
                })),
            }));
            step++;
        }, stepInterval);
        return () => clearInterval(interval); //cleanup on unmount or change
    }, [treeSnapshots, stepInterval]);

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