var mysql = require('mysql2');
var connection = mysql.createConnection({
    host: 'localhost',
    user : 'nodejs',
    password: 'password',
    database: 'opentutorials'
})

connection.connect(function(err) {
    if(err){
        console.error('error connecting: '+ err.stack);
        return;
    }

    console.log('connected as id '+ connection.threadId);
})

connection.query('select * from topic', function (err, results, fields) {
    if(err){
        console.log(err);
    }
    console.log(results);
})

connection.end();