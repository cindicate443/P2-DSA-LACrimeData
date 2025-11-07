import React, {useEffect, useState} from 'react' //For bar graph
import BarGraph from './BarGraph';

function Building({ xAxis }) {
    const [groupedData, setGroupedData] = useState({ xAxisVals: [], yAxisVals: [] }); //x and y axis data
    
    const [datasetLabel, setDatasetLabel] = useState('Results'); //Label for dataset
    const [treeSnapshots, setTreeSnapshots] = useState([]); //Snapshots of tree traversal for animation
    const stepInterval = 500;

    async function buildGraph(alg) { //alg is 'bfs' or 'dfs'
        setDatasetLabel(alg);
        try {
            const response = await fetch(`http://localhost:3001/api/test?alg=${alg}`);
            const data = await response.json();

            //fetch grouped data
            setGroupedData({ xAxisVals: xVals, yAxisVals: Array(xVals.length).fill(0) }); //reset before building
            const xVals = data.xAxisVals;

            //parse traversal order
            // const traversalOrder = [];
            const treeSnapshots = data.tree
            .split('\r\n')
            .filter(line => line.trim() !== '')//There MIGHT be empty lines idk
            .map(snap => {
                const counts = Array(xVals.length).fill(0);
                snap.split('|').forEach(part => {
                    const keyMatch = part.match(/key:\s*(\S+)/);
                    const countMatch = part.match(/count:\s*(\d+)/);
                    //if key and count found, update counts
                    if (keyMatch && countMatch) {
                        const key = keyMatch[1]; //get actual key string
                        const count = parseInt(countMatch[1], 10); //Convert to number
                        //Find index of key in x labels
                        const index = xVals.indexOf(key);
                        if (index !== -1) { //assuming it exists store it
                            counts[index] = count;
                        }
                    }
                    });
                    return counts;
                    });
            
            // treeLines.forEach(line => {
            //     const treeLine = line.trim(); //no extra spaces
            //     if (treeLine.startsWith('key: ')){ //only process key lines
            //         const key = treeLine.slice(5).trim(); //get rid of 'key: '
            //         const index = xVals.indexOf(key); //find index of this key in x axis label
            //         if (index !== -1) { //valid index
            //             traversalOrder.push(index); //add to traversal order
            //         }
                    
            //     }
            // });
            // console.log("Traversal order parsed:", traversalOrder); //i forgot what this even prints

            setTreeSnapshots(snapshots);
        }
        catch (error) {
            console.error('Error fetching graph data:', error);
        }
    }

    return (
        <div style = {{textAlign: 'center', padding: '20px'}}>
            <div style = {{ marginBottom: '10px' }}>
                <button onClick={() => buildGraph('bfs')}>Run BFS</button>
                <button onClick={() => buildGraph('dfs')}>Run DFS</button>
            </div>
            <BarGraph groupedData={groupedData} x_axis_label={xAxis} y_axis_label={"Count"} datasetLabel={datasetLabel} treeSnapshots={treeSnapshots} />
        </div>         
    );
}
export default Building;