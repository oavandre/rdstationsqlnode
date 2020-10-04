const express = require('express');
const app         = express();
const port        = process.env.PORT || 5000;
const mysql = require('mysql');

app.use(express.json());

function handleEvent(event) {
    if (event.body != null) return JSON.parse(event.body);
  
    return null;
  }
  
  function handleCallback(callback, error, status_code, message) {
    callback(error, {
      statusCode: status_code,
      body: message,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
  
  exports.handler = function(event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
  
    let response = handleEvent(event);
  
    if (response && response.hasOwnProperty('leads')) {
      let lead = response.leads[0];
      setTimeout(function() {
        // Esta sintaxe do comando INSERT é válida no MySQL mas não é padrão da linguagem
        connection.query('INSERT INTO leads SET ?', {name: lead.name, email: lead.email}, function(error, results, fields) {
          connection.release();
  
          if (error) throw error;
  
          handleCallback(callback, null, 200, 'ok');
        });
      }, 1000);
    } else handleCallback(callback, null, 200, 'Script ended');
  };

app.listen(port, () => {
    console.log(`Servidor NodeJS esta na porta: ${port}`);
});