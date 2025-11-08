import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import BarGraph from './BarGraph/BarGraph';
import Building from './BarGraph/Building';
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
  const [xAxis, setXAxis] = useState("area");
  const [xAxisData, setXAxisData] = useState([]);
  const [xAxisLoading, setXAxisLoading] = useState(false);
  const [xAxisError, setXAxisError] = useState(null);

  const APP_TOKEN = "JZStIfxvIBLxyqzrOs41hWlyx" // api token from making an account with City of Los Angeles
  const api = `https://data.lacity.org/api/v3/views/2nrs-mtv8/query.json/`; // api using SODA3

  // List of search types for buttons
  //const searchTypes = ["DFS", "BFS", "DISPLAY"];

  const [searchType, setSearchType] = useState(""); // using useState instead or array bc its easier to keep track when clicked (i.e onClick event)

  const search = (type) => {
    // Make HTTP request to backend
    fetch(`/api/run-cpp?type=${type}&region=${region}`)
      .then(res => res.text()) // Plain text response
      .then(console.log)
      .then(setCppOutput)   // Directly set state
      .catch(err => setCppOutput("Error: " + err));
  }

  // const fetchXAxisData = ['Area', 'Area Name', 'crime committed', 'Victim Sex', 'Victim Descent', 'Premise Desc']

  //     async (selectedAxis) => {
  //   setXAxisLoading(true);
  //   setXAxisError(null);
  //   try {
  //     const response = await axios.get(`/api/retrieve-xaxis-data`, { params: { Xaxis: selectedAxis } });
  //     setXAxisData(response.data || []);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error("Error fetching X-axis data:", error);
  //     setXAxisError(error.message || String(error));
  //     setXAxisData([]);
  //   } finally {
  //     setXAxisLoading(false);
  //   }
  // }

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

  // const handleFetch = async (e) => {
  //   try {
  //     const response = await axios.get(`http://localhost:3001/test`);
  //     setMessage(response.data);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  //
  // }

  const handleDisplay = async (e) => {
    try{
      if(!searchType){
        console.log("No search type selected please choose before continuing!")
        return;
      }
      const response = await axios.get(`http://localhost:3001/api/test?xAxis=${xAxis}&alg=${searchType}`)
  // backend returns { grouped: [...], tree: '...' }
  setXAxisData(response.data || [])

    } catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAreaNames();
    fetchLAT();
    fetchLON();
  }, [])

  // useEffect(() => {
  //
  // }, [searchType])

  return (
    <div>
      <nav className='nav-cont'>
        <span><h1 id = "title" >Crime Data Explorer</h1></span>
      </nav>

      <div className='main'>
        {/* <Building xAxis={xAxis} /> */}
        {/*<button onClick={() => handleFetch()}>call node api</button>*/}
        {/*<p>message: {message}</p>*/}





        <div className='map'>
          {xAxisLoading && <div>Loading chart…</div>}
          {xAxisError && <div style={{ color: 'red' }}>Error loading data: {xAxisError}</div>}
          {!xAxisLoading && !xAxisError && (
            <BarGraph groupedData={xAxisData} x_axis_label={xAxis} y_axis_label={"Count"} datasetLabel={`LA Crime Data`} />
          )}
        </div>



        <div className='x-axis-select'>
          <label> Select X-Axis:
            <select id = "dropDown"  onChange={(e) => { setXAxis(e.target.value); }}>
              <option id = "hiddenOption" value="select">--Select--</option>
              <option value="area_name">Area Name</option>
              <option value="area">Area</option>
              {/*<option value="crm_cd_desc">Crime Committed</option>*/}
              <option value="vict_sex">Victim Sex</option>
              <option value="vict_age">Victim Age</option>
              {/*<option value="premis_desc">Premise Description</option>*/}
              {/*<option value="weapon_desc">Weapon Used</option>*/}
              <option value="status_desc">Case Status</option>
              {/*  is it possible to add location?*/}
              {/*  <option value="area_name">Area Name</option>*/}
              {/*  <option value="area">Area</option>*/}
              {/*  <option value="crm_cd_desc">Crime Committed</option>*/}
              {/*  <option value="vict_sex">Victim Sex</option>*/}
              {/*  <option value="vict_age">Victim Age</option>*/}
              {/*  <option value="premis_desc">Premise Description</option>*/}
              {/*  <option value="weapon_desc">Weapon Used</option>*/}
              {/*  <option value="status_desc">Case Status</option>*/}
              {/*  is it possible to add location?*/}
            </select>
          </label>
        </div>

        <div className='search-buttons'>
          <button className = "searchButton" onClick={() => setSearchType("dfs")}>DFS Search</button>
          <button className = "searchButton" onClick={() => setSearchType("bfs")}>BFS Search</button>
          {/* <button onClick={() => buildGraph("dfs")}>DFS Search</button>
          <button onClick={() => buildGraph("bfs")}>BFS Search</button> */}
        </div>

        <div>
          <button id = "displayButton" onClick={() => handleDisplay()}>Display!</button>
        </div>

            </div>
            {/*<div className='x-axis-results'>*/}
            {/*  <h3>Grouped Data Preview:</h3>*/}
            {/*  <pre>{JSON.stringify(xAxisData, null, 2)}</pre>*/}
            {/*</div>*/}
    </div>
  )
}

export default App
