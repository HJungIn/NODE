const express = require('express'); // const : 상수(바뀌지 않는 값), require를 사용 : express도 결국 모듈이다.
const app = express(); // express()의 return 값 : express 프레임워크에서 제공하는 Application 객체
const fs = require('fs');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const qs = require('querystring');
const bodyParser = require('body-parser');
const compression = require('compression');
const topicRouter = require('./routes/topic');

app.use('/topic', topicRouter); // topic으로 시작하는 주소에 topicRouter라는 이름의 미들웨어를 적용하겠다는 의미

app.use(bodyParser.urlencoded({
    extended: false
})); //익스프레스의 use메서드에 body-parser라는 미들웨어 전달 : 해당 미들웨어가 실행되고 그 결과를 전달받는다. => 즉, main.js가 실행될 떄마다(사용자의 요청이 있을 때마다) 미들웨어가 실행된다.
app.use(compression());
app.get('*', function(request, response, next){ //get 방식 일 때만 해당 미드웨어 부르기
    fs.readdir('./data', function(error, filelist){
        request.list = filelist;
        next();
    })
});
app.use(express.static('public')); // public 폴더에서 파일을 찾겠다는 의미

// app.get('/', (req, res) => res.send('Hello World!')) // express 프레임워크 API 중 get 메서드 형태
// app.get('/page', function(req, res){
//     return res.send('/page') 
// }); // send한 텍스트 그대로 띄워짐

app.get('/', (request, response) => {
    // fs.readdir('./data', function (error, filelist) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `<h2>${title}</h2><p>${description}</p>
            <img src="/images/hello.png" style="width:300px; display: block; margin-top:10px;">
            `,
            `<a href="/create">create</a>`
        );
        response.send(html);
    // });
})

app.get('/page/:pageId', (req, res, next) => { // 사용자가 page 다음에 입력한 경올가 pageID로 들어오게 된다.
    // res.send(req.params); // 키:값 형태로 가져올 수 있다.
    // fs.readdir('./data', function (error, filelist) {
        var filteredId = path.parse(req.params.pageId).base; // 매개변수 이용
        fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
            if(err){
                next(err); // next() : 정상, next('route') : 정상, next(err) : next함수에 'route'이외의 인자 전달 시 에러가 발생한 것으로 간주함.
            }
            else{
                var title = req.params.pageId;
                var sanitizedTitle = sanitizeHtml(title);
                var sanitizedDescription = sanitizeHtml(description, {
                    allowedTags: ['h1']
                });
                var list = template.list(req.list);
                var html = template.HTML(sanitizedTitle, list,
                    `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                    `<a href="/create">create</a>
                            <a href="/update/${sanitizedTitle}">update</a>
                            <form action="/delete_process" method="post">
                                <input type="hidden" name="id" value="${sanitizedTitle}">
                                <input type="submit" value="delete">
                            </form>`
                );
                res.send(html);
            }
        });
    // });
})

// app.get('/create', function (request, response) {
//     // fs.readdir('./data', function (error, filelist) {
//         var title = 'WEB - create';
//         var list = template.list(request.list);
//         var html = template.HTML(title, list, `
//             <form action="/create_process" method="post">
//                 <p><input type="text" name="title" placeholder="title"></p>
//                 <p>
//                     <textarea name="description" placeholder="description"></textarea>
//                 </p>
//                 <p>
//                     <input type="submit">
//                 </p>
//             </form>
//         `, '');
//         response.send(html);
//     // });
// })

// app.post('/create_process', function (request, response) {
//     var post = request.body;
//     var title = post.title;
//     var description = post.description;
//     fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
//         response.writeHead(302, {
//             Location: `/page/${title}`
//         });
//         response.end();
//     });

//     // var body = '';
//     // request.on('data', function(data) {
//     //     body = body + data;
//     // });
//     // request.on('end', function() {
//     //     var post = qs.parse(body);
//     //     var title = post.title;
//     //     var description = post.description;
//     //     fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
//     //         response.writeHead(302, {Location: `/page/${title}`});
//     //         response.end();
//     //     });
//     // });
// })

// app.get('/update/:pageId', function (request, response) {
//     // fs.readdir('./data', function (error, filelist) {
//         var filteredId = path.parse(request.params.pageId).base;
//         fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
//             var title = request.params.pageId;
//             var list = template.list(request.list);
//             var html = template.HTML(title, list,
//                 `
//                 <form action="/update_process" method="post">
//                     <input type="hidden" name="id" value="${title}">
//                     <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//                     <p>
//                         <textarea name="description" placeholder="description">${description}</textarea>
//                     </p>
//                     <p>
//                         <input type="submit">
//                     </p>
//                 </form>
//                 `,
//                 `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
//             );
//             response.send(html);
//         });
//     // });
// })

// app.post('/update_process', function (request, response) {

//         var post = request.body;
//         var id = post.id;
//         var title = post.title;
//         var description = post.description;
//         fs.rename(`data/${id}`, `data/${title}`, function (error) {
//             fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
//                 response.writeHead(302, {
//                     Location: `/page/${title}`
//                 });
//                 response.end();
//             });
//         });

//     // var body = '';
//     // request.on('data', function (data) {
//     //     body = body + data;
//     // });
//     // request.on('end', function () {
//     //     var post = qs.parse(body);
//     //     var id = post.id;
//     //     var title = post.title;
//     //     var description = post.description;
//     //     fs.rename(`data/${id}`, `data/${title}`, function (error) {
//     //         fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
//     //             response.writeHead(302, {
//     //                 Location: `/page/${title}`
//     //             });
//     //             response.end();
//     //         });
//     //     });
//     // });
// })

// app.post('/delete_process', function (request, response) {

//         var post = request.body;
//         var id = post.id;
//         var filteredId = path.parse(id).base;
//         fs.unlink(`data/${filteredId}`, function (error) {
//             response.redirect('/'); // express의 redirect 처리 방법
//         });


//     // var body = '';
//     // request.on('data', function (data) {
//     //     body = body + data;
//     // });
//     // request.on('end', function () {
//     //     var post = qs.parse(body);
//     //     var id = post.id;
//     //     var filteredId = path.parse(id).base;
//     //     fs.unlink(`data/${filteredId}`, function (error) {
//     //         response.redirect('/'); // express의 redirect 처리 방법
//     //     });
//     // });
// })

app.use(function(req,res, next){ // 404 처리
    res.status(404).send('Sorry cant find that!');
})

app.use(function(err, req, res, next){ // 에러 핸들러를 위한 미들웨어는 다른 미들웨어와 다른게 매개변수가 4개이다. => 이처럼 매개변수가 4개면 익스프레스 프레임워크는 에러 핸들러로 인식한다. => 따라서 next 함수로 미들웨어를 호출할 때 인자를 전달하면 첫번 째 매개변수 인 err에 전달된다.
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))





























/*
console.log('Hello no deamon');
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
        if(queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2><p>${description}</p>`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, {
                        allowedTags:['h1']
                    });
                    var list = template.list(filelist);
                    var html = template.HTML(sanitizedTitle, list,
                        `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                        `<a href="/create">create</a>
                        <a href="/update?id=${sanitizedTitle}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                        </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create') {
        fs.readdir('./data', function(error, filelist) {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            });
        });
    } else if(pathname === '/update') {
        fs.readdir('./data', function(error, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        });
    } else if(pathname === '/delete_process') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(error) {
                response.writeHead(302, {Location: `/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
*/