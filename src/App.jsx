import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import "@fontsource/ibm-plex-sans";


function App() {
  // Fetch backend/C++ output
  // For reference, region is the value, setRegion is the function to update the value, San Ferando is the defaul
  const [areas, setAreas] = useState([]);
  const [lat, setLat] = useState([]);
  const [lon, setLon] = useState([]);
  const [data, setData] = useState([]);
  const [cppOutput, setCppOutput] = useState("");

  const APP_TOKEN = "JZStIfxvIBLxyqzrOs41hWlyx" // api token from making an account with City of Los Angeles
  const api = `https://data.lacity.org/api/v3/views/2nrs-mtv8/query.json/`; // api using SODA3

  // List of search types for buttons
  //const searchTypes = ["DFS", "BFS", "DISPLAY"];
  const [searchType, setSearchType] = useState(""); // using useState instead or array bc its easier to keep track when clicked (i.e onClick event)

  const search = (type) => {
    // Make HTTP request to backend
    fetch(`http://localhost:3001/run-cpp?type=${type}&region=${region}`)
      .then(res => res.text()) // Plain text response
      .then(console.log)
      .then(setCppOutput)   // Directly set state
      .catch(err => setCppOutput("Error: " + err));
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
        <label> Select region
          <select>
            {areas.map((item, key) => {
              return (
                <option key={key} value={item.area_name}>{item.area_name}</option>
              )})}
          </select>
        </label>


        <div className='map'>
          
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


      </div>

      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h1>Hello world this is me!!!</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
