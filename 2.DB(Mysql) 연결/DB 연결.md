# NODE + DB 연결  
* NODE + MYSQL
<br><br>
---   

### mysql 모듈
* mysql 모듈 설치 : <code>npm install --save mysql2</code>
* mysql 연결 설정
    ```javascript
    var mysql = require('mysql2');
    var connection = mysql.createConnection({
        host: 'localhost',
        user : 'userid',
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

    //결과
    PS C:\Users\hji\Desktop\node\DB\02_nodejs-mysql> node .\nodejs\mysql.js   
    connected as id 20
    [
    {
        id: 1,
        title: 'MySQL',
        description: 'MTsql is ..',
        created: 2024-01-11T23:38:00.000Z,
        author_id: 1
    },
    {
        id: 2,
        title: 'Oracle',
        description: 'Oracle is ...',
        created: 2024-01-11T23:38:00.000Z,
        author_id: 1
    },
    {
        id: 3,
        title: 'SQL server',
        description: 'SQL server is ..',
        created: 2024-01-11T23:38:00.000Z,
        author_id: 2
    },
    {
        id: 4,
        title: 'PostgreSQL',
        description: 'PostgreSQL is ..',
        created: 2024-01-11T23:38:00.000Z,
        author_id: 3
    },
    {
        id: 5,
        title: 'MongDB',
        description: 'MongDB is ...',
        created: 2024-01-11T23:38:00.000Z,
        author_id: 1
    }
    ]
    ```
    > * 유저 확인 : <code>select host,user from mysql.user;</code><Br>
    > * 새 유저 생성 : <code>create user 'nodejs'@'%' identified by 'password';</code><br/>
    > * 권한 부여 : <code>grant all privileges on opentutorials.* to 'nodejs'@'%';</code><br>
    > * 적용 : <code>flush privileges;</code>


####  적용<br>

* 전체 조회
    ```javascript
    db.query(`SELECT * FROM topic`, function(err, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        console.log(topics);
        response.writeHead(200);
        response.end(html);
    })
    ```

* 개별 조회
```javascript
db.query(`SELECT * FROM topic`, function(err, topics){
    if(err){ // 실패시 처리 -> 즉시 중지
        throw err;
    }
    db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic){ // [queryData.id] : ?에 치환되며, 공격 의도가 있는 코드를 알아서 걸러주는 역할을 한다.
        if(error2){
            throw error2;
        }
        console.log(topic[0]); // 배열에 담겨서 오기 떄문에 배열로 취급해야함.
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.HTML(title, list, `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="submit" value="delete">
            </form>`);
        response.writeHead(200);
        response.end(html);
    })
 })

```

* 생성하기
```javascript
else if(pathname === '/create_process') {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, 1],
            function(error, result){
                if(error){
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`}) // 새로 추가한 id값
                response.end();
            }
        )
    });
}
```

* 수정하기
```javascript
else if(pathname === '/update_process') {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?`,
            [post.title, post.description, post.id],
            function (error, result) {
                response.writeHead(302, {Location: `/?id=${post.id}`});
                response.end();
            }
        )

    });
}
```

* 삭제하기
```javascript
else if(pathname === '/delete_process') {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`DELETE FROM topic WHERE id = ?`, [post.id], function(error, result) {
            if(error){
                throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
        })
    });
}
```
<br><br>
---   

### JOIN을 통한 상세 조회
* <code>SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id;</code> : topic 테이블을 왼쪽에 두고 author 테이블을 오른쪽에 나란히 붙이는 명령
    * 적용
        ```javascript
        db.query(`SELECT * FROM topic`, function(err, topics){
            if(err){ // 실패시 처리 -> 즉시 중지
                throw err;
            }
            db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic){ // [queryData.id] : ?에 치환되며, 공격 의도가 있는 코드를 알아서 걸러주는 역할을 한다.
                if(error2){
                    throw error2;
                }
                console.log(topic[0]); // 배열에 담겨서 오기 떄문에 배열로 취급해야함.
                var title = topic[0].title;
                var description = topic[0].description;
                var list = template.list(topics);
                var html = template.HTML(title, list, `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`,
                    `<a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>`);
                response.writeHead(200);
                response.end(html);
            })
        })
        ```
<br><br>
---   

### 2개의 entity 사용하기
* create
```javascript
// template.js
    authorSelect: function(authors) {
        var tag = '';
        var i = 0;
        while(i < authors.length){
            tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
            i++;
        }
        return `<select name="author">${tag}</select>`
    }

// =================================================
// main.js
else if(pathname === '/create') {
    db.query(`SELECT * FROM topic`, function(err, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'Create';
            var list = template.list(topics);
             var html = template.HTML(title, list, 
                `
                <form action="/create_process" method="post">
                     <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `, 
                `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
        })
    })
} else if(pathname === '/create_process') {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
            function(error, result){
                if(error){
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`}) // 새로 추가한 id값
                response.end();
            }
        )
    });
}
```

* update
```javascript
// template.js
    authorSelect: function(authors, author_id) { // author_id : 현재 author
        var tag = '';
        var i = 0;
        while(i < authors.length){
            var selected = '';
            if(authors[i].id === author_id){
                selected = ' selected';
            }

            tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
            i++;
        }
        return `<select name="author">${tag}</select>`
    }

// ========================
//  main.js
else if(pathname === '/update') {
    db.query(`SELECT * FROM topic`, function(err, topics){
        if(err){ // 실패시 처리 -> 즉시 중지
            throw err;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic){ // [queryData.id] : ?에 치환되며, 공격 의도가 있는 코드를 알아서 걸러주는 역할을 한다.
            if(error2){
                throw error2;
            }
            db.query(`SELECT * FROM author`, function(err2, authors){
                var list = template.list(topics);
                var html = template.HTML(topic[0].title, list, 
                    `<form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                        </p>
                        <p>
                            ${template.authorSelect(authors, topic[0].author_id)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>`,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                response.writeHead(200);
                response.end(html);
            })
        })
    })
} else if(pathname === '/update_process') {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
            [post.title, post.description, post.author, post.id],
            function (error, result) {
                response.writeHead(302, {Location: `/?id=${post.id}`});
                response.end();
            }
        )
    });
}
```
<br><br>
---   

### 소스 분리하기
* DB 분리하기
```javascript
// ./lib/db.js
var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user : 'user',
    password: 'password',
    database: 'dbName'
})
db.connect();
module.exports = db;

// ====================================
// main.js
var db = require('./lib/db.js');

var app = http.createServer(function(request, response) {
    ...
});
app.listen(3000);
```

* query 분리하기
```javascript
// ./lib/topic.js
var db = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(err, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        console.log(topics);
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, function(err, topics){
        if(err){ // 실패시 처리 -> 즉시 중지
            throw err;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic){ // [queryData.id] : ?에 치환되며, 공격 의도가 있는 코드를 알아서 걸러주는 역할을 한다.
            if(error2){
                throw error2;
            }
            console.log(topic[0]); // 배열에 담겨서 오기 떄문에 배열로 취급해야함.
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list, `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`,
                `<a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                </form>`);
            response.writeHead(200);
            response.end(html);
        })
    })
}
```

```javascript
// main.js
var db = require('./lib/db.js');
var topic = require('./lib/topic.js');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
        if(queryData.id === undefined) {
            topic.home(request, response);
        } else {
            topic.page(request, response);
        }
    } 
    ...
});
app.listen(3000);
```
<br><br>
---   

### 보안
* SQL 인젝션 : 사용자의 입력값을 이용해 데이터베이스에 SQL문을 주입해서 공격하는 기법
    * 예제 : input값에 <code>2;DROP TABLE topic</code>이라고 입력 시 topic 테이블이 삭제되는 것
    * 해결 방법 : []를 통해 문자 그대로 들어가게 설정한다.
        ```javascript
        db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], function(err3, author){ .. })
        ```
* 이스케이프 : 방어기법으로, 내부에 저장된 데이터가 사용자에게 전달(웹 페이지에 표시)될 때 발생할 수 있는 공격을 막아줌. 
    * 즉, DB에 저장된 정보를 사용자에게 출력할 때 공격 의도를 담을 수 있는 스크립트를 sanitizeHtml 라이브러리를 이용해서 막을 수 있다.
    * 사용 방법 : <code>npm install --save sanitize-html</code>
        ```javascript
        var sanitizeHtml = require('sanitize-html');
        
        // 예제 1
        exports.create = function(request, response){
            db.query(`SELECT * FROM topic`, function(err, topics){
                db.query(`SELECT * FROM author`, function(error2, authors){
                    var title = 'Create';
                    var list = template.list(topics);
                    var html = template.HTML(sanitizeHtml(title), list,  ... )
                }
            }
        }

        // 예제 2
        list:function(topics) {
            var list = '<ul>';
            var i = 0;
            while(i < topics.length) {
                list = list + `<li><a href="/?id=${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`;
                i = i + 1;
            }
            list = list+'</ul>';
            return list;
        },
        ```