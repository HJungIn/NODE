var http = require('http');
var fs = require('fs');
var url = require('url');

function templateHTML(title, list, body){
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
    ${body}
    </body>
    </html>
    `;
}

function templateList(filelist){
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
        list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i = i+1;
    }
    list += '</ul>';
    return list;
}

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
            let list = templateList(filelist);
            var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`)
            response.writeHead(200);
            response.end(template);
        })
        }
        else {
            fs.readdir('./data', function(error, filelist){
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                    let list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`)
                    response.writeHead(200);
                    response.end(template);
                });
            })
        }
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
 
 
});
app.listen(3000);