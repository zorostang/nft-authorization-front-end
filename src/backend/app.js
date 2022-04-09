const http = require('http');
const cors = require('cors');

const express = require('express')
const app = express()
const port = 3001

//query client

app.use(express.static('src'))
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/login', async(req, res) => {
  console.log(req.body);
  


  res.send('Login endpoint!')
})

/*
console.log('try:');
console.log('  GET /hello.txt');
console.log('  GET /js/app.js');
console.log('  GET /css/style.css');

*/