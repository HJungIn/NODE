var db = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

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

exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, function(err, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(sanitizeHtml(title), list, 
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
}

exports.create_process = function (request, response) {
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

            // var title = post.title;
            // var description = post.description;
            // fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            //     response.writeHead(302, {Location: `/?id=${title}`});
            //     response.end();
            // });
        });
}

exports.update = function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
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
                        <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
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
}

exports.update_process = function(request, response){
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

        // var id = post.id;
        // var title = post.title;
        // var description = post.description;
        // fs.rename(`data/${id}`, `data/${title}`, function(error) {
        //     fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        //         response.writeHead(302, {Location: `/?id=${title}`});
        //         response.end();
        //     });
        // });
    });
}

exports.delete_process = function (request, response) {
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

            // var id = post.id;
            // var filteredId = path.parse(id).base;
            // fs.unlink(`data/${filteredId}`, function(error) {
            //     response.writeHead(302, {Location: `/`});
            //     response.end();
            // });
        });
}