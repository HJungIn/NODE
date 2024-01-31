// 전제 조건 : 이 파일에 있는 url이 모두 /topic으로 시작한다고 했을 때 

var express = require('express');
var router = express.Router(); // 라우터 객체를 반환하므로, app.get()이 아닌 router.get()을 호출해야한다.
const fs = require('fs');
const template = require('../lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

router.get('/create', function (request, response) {
    // fs.readdir('./data', function (error, filelist) {
        var title = 'WEB - create';
        var list = template.list(request.list);
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
        response.send(html);
    // });
})

router.post('/create_process', function (request, response) {
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, {
            Location: `/page/${title}`
        });
        response.end();
    });

    // var body = '';
    // request.on('data', function(data) {
    //     body = body + data;
    // });
    // request.on('end', function() {
    //     var post = qs.parse(body);
    //     var title = post.title;
    //     var description = post.description;
    //     fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
    //         response.writeHead(302, {Location: `/page/${title}`});
    //         response.end();
    //     });
    // });
})

router.get('/update/:pageId', function (request, response) {
    // fs.readdir('./data', function (error, filelist) {
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
            var title = request.params.pageId;
            var list = template.list(request.list);
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
            response.send(html);
        });
    // });
})

router.post('/update_process', function (request, response) {

        var post = request.body;
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function (error) {
            fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                response.writeHead(302, {
                    Location: `/page/${title}`
                });
                response.end();
            });
        });

    // var body = '';
    // request.on('data', function (data) {
    //     body = body + data;
    // });
    // request.on('end', function () {
    //     var post = qs.parse(body);
    //     var id = post.id;
    //     var title = post.title;
    //     var description = post.description;
    //     fs.rename(`data/${id}`, `data/${title}`, function (error) {
    //         fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    //             response.writeHead(302, {
    //                 Location: `/page/${title}`
    //             });
    //             response.end();
    //         });
    //     });
    // });
})

router.post('/delete_process', function (request, response) {

        var post = request.body;
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function (error) {
            response.redirect('/'); // express의 redirect 처리 방법
        });


    // var body = '';
    // request.on('data', function (data) {
    //     body = body + data;
    // });
    // request.on('end', function () {
    //     var post = qs.parse(body);
    //     var id = post.id;
    //     var filteredId = path.parse(id).base;
    //     fs.unlink(`data/${filteredId}`, function (error) {
    //         response.redirect('/'); // express의 redirect 처리 방법
    //     });
    // });
})


module.exports = router;