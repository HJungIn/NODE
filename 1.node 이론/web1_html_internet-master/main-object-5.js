var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
    HTML: function(title, list, body, control){
        return `
        <!doctype html>
        <html>
        <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
        </head>
        <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control} 
        ${body}
        </body>
        </html>
        `;
    },
    list: function(filelist){
        var list = '<ul>';
        var i = 0;
        while(i < filelist.length){
            list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
            i = i+1;
        }
        list += '</ul>';
        return list;
    }
}


// Node.js에서 웹 브라우저로  접속할 때마다 createServer의 콜백 함수를 호출함.
// request : 요청할 때 웹 브라우저가 보낸 정보 (ex) POST 정보)
// response : 응답할 때 웹 브라우저가 전송할 정보
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname; // 쿼리 스트링을 제외한 경로 이름
    var title = queryData.id;
 
    if(pathname === '/'){
        if(title === undefined){
            fs.readdir('./data', function(error, filelist){
                console.log(filelist);
            
            title = 'Welcome';
            var description = 'Hello, Node.js';
            let list = template.list(filelist);
            var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`)
            response.writeHead(200);
            response.end(html);
        })
        }
        else {
            fs.readdir('./data', function(error, filelist){
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                    let list = template.list(filelist);
                    var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a> <a href="/update?id=${title}">update</a> <form action="/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?');"><input type="hidden" name="id" value="${title}"}> <input type="submit" value="delete"></form>`)
                    response.writeHead(200);
                    response.end(html);
                });
            })
        }
    } else if(pathname === '/create'){
        fs.readdir('./data', function(error, filelist){
            title = 'Web - create';
            var description = 'Hello, Node.js';
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
                <form action="http://localhost:3000/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `);
            response.writeHead(200);
            response.end(html);
        })
    } else if(pathname === '/create_process'){ // form 처리 시의 url
        var body = '';
        request.on('data', function(data){  // 데이터를 수신할 때마다 발생
            // 조각조각 나눠서  데이터를 수신할 떄마다 호출되는 콜백 함수
            // 데이터를 처리하는 기능을 정의
            body = body + data; // 누적
        })
        request.on('end', function(){  // 데이터 수신을 완료하면 발생
            // 더이상 수신할 정보가 없으면 호출되는 콜백 함수
            // 데이터 처리를 마무리 하는 기능을 정의
            var post = qs.parse(body);
            console.log(post);
            title = post.title;
            description = post.description;
            console.log(title);
            console.log(description);
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){ // 파일 생성 함수 : fs.writeFile(파일 이름, 파일 내용, 인코딩 방식, 콜백 함수: 파일 쓰기를 마쳤을 때 내부적으로 자동 호출되는 함수) 
                response.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션
                response.end();
            })
        })
    } else if(pathname === '/update'){
        fs.readdir('./data', function(error, filelist){ // 수정하고자 하는 데이터를 미리 넣어줘야 하므로 파일을 읽는 기능이 필요함
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                console.log(description);
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.HTML(title, list, `${description}
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value=${title}></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200);
                response.end(html);
            })
        })
    }else if(pathname === '/update_process'){ 
        var body = '';
        request.on('data', function(data){  // 데이터를 수신할 때마다 발생
            // 조각조각 나눠서  데이터를 수신할 떄마다 호출되는 콜백 함수
            // 데이터를 처리하는 기능을 정의
            body = body + data; // 누적
        })
        request.on('end', function(){  // 데이터 수신을 완료하면 발생
            // 더이상 수신할 정보가 없으면 호출되는 콜백 함수
            // 데이터 처리를 마무리 하는 기능을 정의
            var post = qs.parse(body);
            var id = post.id;
            console.log(post);
            var title = post.title;
            var description = post.description;
            console.log(title);
            console.log(description);
            fs.rename(`data/${id}`, `data/${title}`, function(error){ // 파일 이름 변경 함수 : fs.rename (기존 파일 이름, 수정 파일 내용, 에러 발생 시 호출되는 함수) 
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    console.log(description)
                    response.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션
                    response.end();
                })
            })
        })
    } else if(pathname === '/delete_process'){ 
        var body = '';
        request.on('data', function(data){  
            body = body + data;
        })
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function(err){
                response.writeHead(302, {Location: `/`}); // 리다이렉션
                response.end();
            })
        })
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
 
 
});
app.listen(3000);