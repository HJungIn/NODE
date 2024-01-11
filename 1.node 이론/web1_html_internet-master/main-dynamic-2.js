var http = require('http');
var fs = require('fs');
var url = require('url'); // url이라는 모듈을 Node.js에게 요구
console.log(__dirname);
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    console.log(_url);
    console.log(queryData);
    if(_url == '/'){
      title = 'Welcome'
    }
    if(_url == '/favicon.ico'){
        response.writeHead(404);
        response.end(); // 응답 본문을 종료하고 전송
        return;
    }
    response.writeHead(200);
    fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
    var template = `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <ul>
        <li><a href="/">HTML</a></li>
        <li><a href="/?id=CSS">CSS</a></li>
        <li><a href="/?id=JavaScript">JavaScript</a></li>
      </ul>
      <h2>${title}</h2>
      <p>${description}</p>
    </body>
    </html>
    `;
    response.end(template); // response.end() : 웹 서버가 웹 브라우저의 요청에 응답하는 명령
    });
});
app.listen(3000);

// main.js 파일 : Node.js를 웹 서버로서 동작하게 하고 웹 브라우저로 해당 웹서버에 있는 웹 페이지를 불러옴.