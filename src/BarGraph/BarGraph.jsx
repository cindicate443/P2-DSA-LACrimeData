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

// register imported items with ChartJS library
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarGraph = ({ groupedData = [], x_axis_label = 'X', y_axis_label = 'Count', datasetLabel = 'Count' }) => {
    // groupedData expected shape: [{ label: 'Some value', value: 123 }, ...]
    const labels = groupedData["xAxisVals"];

    let dataValues;
    let lineChartData;
    // for(let i = 0; i < groupedData["tree"].length; i++) {
    //     dataValues
        lineChartData = {
            labels,
            datasets: [
                {
                    label: datasetLabel,
                    data: dataValues,
                    backgroundColor: 'rgba(125, 20, 190, 0.8)',
                    borderColor: 'rgba(56, 12, 83, 1)',
                    borderWidth: 1,
                },
            ],
        };
    // }

    const options = {
        scales: {
            x: {
                grid: {
                    color: 'black',
                },

                ticks: {
                    color: 'green'
                },

                title: {
                    display: true,
                    text: x_axis_label,
                    color: 'purple', // Set title color
                },
            },
            y: {
                grid: {
                    color: 'black'
                },

                ticks: {
                    color: 'green'
                },

                title: {
                    display: true,
                    text: y_axis_label,
                    color: 'purple', // Set title color
                },

            }
        }
    };

    return  (
        <div style={{ maxWidth: '990px', width: '100%' }}>
            <Bar options={options} data={lineChartData}></Bar>
        </div>
    )
}

export default BarGraph;