const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const myconn = require('express-myconnection');
const db_config = require('./configuration/mysql');


const app = express();
const port = 8081;


app.use(myconn(mysql, db_config, 'single'))
app.use(express.json());
// app.use(express.urlencoded());
app.use(cors());


app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/auth', require('./routes/auth'));


app.listen(port, () => {
    console.log(`App corriendo en http://localhost:${port}`);
});