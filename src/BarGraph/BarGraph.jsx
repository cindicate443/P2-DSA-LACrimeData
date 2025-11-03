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

const BarGraph = ({ x_axis, y_axis, x_axis_label, y_axis_label }) => {
    const lineChartData = {
        // labels represent x axis
        labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        datasets: [
            {
                label: "Bank Account Total",
                data: [140000, 600400, 290000, 340000, 703000, 500000, 30000, 12000, 130000, 540000, 777000, 999999], // y-axis
                backgroundColor: "rgba(125, 20, 190, 1)",
                borderColor: "rgba(56, 12, 83, 1)",
                borderWidth: 1,
            },
        ],
    };
    
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
        <div style={{ maxWidth: '800px', width: '100%' }}>
            <Bar options={options} data={lineChartData}></Bar>
        </div>
    )
}

export default BarGraph;