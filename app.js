const express = require('express');
const port = 3000;

const app = express();

app.use('/', express.static( __dirname));
app.use(express.json({limit:'1mb'}));

app.post('/', function (req, res) {
    res.end();
  })
  
app.listen(port);