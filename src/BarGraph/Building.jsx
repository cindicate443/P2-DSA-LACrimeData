import React, {useState} from 'react' //For bar graph
import BarGraph from './BarGraph';

function Building({ xAxis }) {
    const [groupedData, setGroupedData] = useState({ xAxisVals: [], yAxisVals: [] });
    const [datasetLabel, setDatasetLabel] = useState('Results');
    async function buildGraph(alg) {
        setDatasetLabel(alg);
        try {
            const response = await fetch(`http://localhost:3001/api/test?alg=${alg}`);
            const data = await response.json();

            const groupedArray = data.grouped;
            const xVals = groupedArray.map(d => d.label);
            const yVals = groupedArray.map(d => d.value);
            
            let animatedVals = Array(xVals.length).fill(0);
            setGroupedData({ xAxisVals: xVals, yAxisVals: animatedVals });
            for (let i = 0; i < xVals.length; i++) {
               await new Promise((resolve) => setTimeout(resolve, 100)); // Delay for animation effect
               animatedVals[i] = yVals[i];
                setGroupedData({ xAxisVals: xVals, yAxisVals: [...animatedVals] });
        }
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
            <BarGraph groupedData={groupedData} x_axis_label={xAxis} y_axis_label={"Count"} datasetLabel={datasetLabel} />
        </div>         
    );
}
export default Building;