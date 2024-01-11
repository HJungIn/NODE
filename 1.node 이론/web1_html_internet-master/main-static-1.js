var http = require('http');
var fs = require('fs');
var url = require('url'); // url이라는 모듈을 Node.js에게 요구
console.log(__dirname);
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    console.log(_url);
    console.log(queryData);
    if(_url == '/'){
      _url = '/index.html';
    }
    if(_url == '/favicon.ico'){
        response.writeHead(404);
        response.end(); // 응답 본문을 종료하고 전송
        return;
    }
    response.writeHead(200);
    // response.end(fs.readFileSync(__dirname + _url)); // response.end() : 웹 서버가 웹 브라우저의 요청에 응답하는 명령
    response.end(queryData.id); // response.end() : 웹 서버가 웹 브라우저의 요청에 응답하는 명령

});
app.listen(3000);

// main.js 파일 : Node.js를 웹 서버로서 동작하게 하고 웹 브라우저로 해당 웹서버에 있는 웹 페이지를 불러옴.