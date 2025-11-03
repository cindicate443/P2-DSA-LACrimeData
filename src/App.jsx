import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import BarGraph from './BarGraph/BarGraph';
//import "@fontsource/ibm-plex-sans";


function App() {
  // Fetch backend/C++ output
  // For reference, region is the value, setRegion is the function to update the value, San Ferando is the defaul
  const [areas, setAreas] = useState([]);
  const [lat, setLat] = useState([]);
  const [lon, setLon] = useState([]);
  const [data, setData] = useState([]);
  const [cppOutput, setCppOutput] = useState("");

  const [message, setMessage] = useState("");
  const [type, setType] = useState("area");
  const [region, setRegion] = useState("N Hollywood");
  const [xAxis, setXAxis] = useState("AREA NAME");
  const [xAxisData, setXAxisData] = useState([]);
  const [xAxisLoading, setXAxisLoading] = useState(false);
  const [xAxisError, setXAxisError] = useState(null);

  const APP_TOKEN = "JZStIfxvIBLxyqzrOs41hWlyx" // api token from making an account with City of Los Angeles
  const api = `https://data.lacity.org/api/v3/views/2nrs-mtv8/query.json/`; // api using SODA3

  // List of search types for buttons
  //const searchTypes = ["DFS", "BFS", "DISPLAY"];
  const [searchType, setSearchType] = useState("hello"); // using useState instead or array bc its easier to keep track when clicked (i.e onClick event)

  const search = (type) => {
    // Make HTTP request to backend
    fetch(`/api/run-cpp?type=${type}&region=${region}`)
      .then(res => res.text()) // Plain text response
      .then(console.log)
      .then(setCppOutput)   // Directly set state
      .catch(err => setCppOutput("Error: " + err));
  }

  const fetchXAxisData = async (selectedAxis) => {
    setXAxisLoading(true);
    setXAxisError(null);
    try {
      const response = await axios.get(`/api/retrieve-xaxis-data`, { params: { Xaxis: selectedAxis } });
      setXAxisData(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching X-axis data:", error);
      setXAxisError(error.message || String(error));
      setXAxisData([]);
    } finally {
      setXAxisLoading(false);
    }
  }

  const fetchAreaNames = () => {
    axios.get(api, { params: { query: "SELECT distinct area_name", app_token: APP_TOKEN } })
    .then((response) => {
        setAreas(response.data);
        // console.log(response.data);
    })
  }

  const fetchLAT = () => {
    axios.get(api, { params: { query: "SELECT distinct lat", pageNumber: 1, pageSize: 10, app_token: APP_TOKEN } })
    .then((response) => {
        setLat(response.data);
        //console.log(response.data);
    })
  }

  const fetchLON = () => {
    axios.get(api, { params: { query: "SELECT distinct lon", pageNumber: 1, pageSize: 10, app_token: APP_TOKEN } })
    .then((response) => {
        setLon(response.data);
        //console.log(response.data);
    })
  }

  const handleFetch = async (e) => {
    try {
      const response = await axios.get(`http://localhost:3001/test`);
      setMessage(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }

  }

  useEffect(() => {
    fetchAreaNames();
    fetchLAT();
    fetchLON();
  }, [])

  return (
    <>
      <nav className='nav-cont'>
        <h1 id = "title" >Crime Data Explorer</h1>
      </nav>

      <div className='main'>

        <button onClick={() => handleFetch()}>call node api</button>
        <p>message: {message}</p>

        <label> Select region
          <select>
            {areas.map((item, key) => {
              return (
                <option key={key} value={item.area_name}>{item.area_name}</option>
              )})}
          </select>
        </label>


        <div className='map'>
          <BarGraph x_axis_label={"BFS"} y_axis_label={"Crime Amount"} />
          <BarGraph x_axis_label={"DFS"} y_axis_label={"Crime Amount"} />
        </div>


        <div className='controls'>
        <label> Longitude
          <select>
            {lon.map((item, key) => {
              return (
                <option key={key} value={item.lon}>{item.lon}</option>
              )})}
          </select>
        </label>

        <label> Latitude
          <select>
            {lat.map((item, key) => {
              return (
                <option key={key} value={item.lat}>{item.lat}</option>
              )})}
          </select>
        </label>

        </div>

        <div className='search-buttons'>
          <button onClick={() => setSearchType("DFS")}>DFS Search</button>
          <button onClick={() => setSearchType("BFS")}>BFS Search</button>
        </div>

        <div>
          <button onClick={() => setSearchType("Display")}>Display!</button>
        </div>
        <div className='x-axis-select'>
          <label> Select X-Axis:
            <select value={xAxis} onChange={(e) => { setXAxis(e.target.value); fetchXAxisData(e.target.value); }}>
              <option value="AREA NAME">Area</option>
              <option value="Crm Cd Desc">Crime Code</option>
              <option value="Vict Sex">Victim Sex</option>
              <option value="Vict Age">Victim Age</option>
              <option value="Premis Desc">Premise Description</option>
            </select>
          </label>
        </div>
            </div>
            /* temporary and for testing purposes */
            <div className='x-axis-results'>
              <h3>Grouped Data Preview:</h3>
              <pre>{JSON.stringify(xAxisData, null, 2)}</pre>
            </div>
    </>
  )
}

export default App
