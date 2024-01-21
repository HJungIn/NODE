var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user : 'nodejs',
    password: 'password',
    database: 'opentutorials',
    // multipleStatements: true // 여러 SQL문이 실행되게 해주는 코드 : SQL 인젝션의 위험으로 안쓰는게 좋음
})
db.connect();
module.exports = db;