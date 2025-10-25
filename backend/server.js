//https://www.w3schools.com/nodejs/nodejs_get_started.asp

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/test', (req, res) => {
  res.send('Backend is working!');
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));