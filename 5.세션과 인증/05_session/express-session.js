var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session'); // express-session 미들웨어를 모듈로 불러와 session이라는 객체에 저장
var FileStore = require('session-file-store')(session); // 세션 파일 스토어를 불러와 미들웨어로 추가함.

var app = express();

app.use(session({ // 사용자의 요청이 있을 때마다 app.use 안에 session함수가 호출되어 세션이 시작된다. => 그러면 내부적으로 express-session 미들웨어가 개입해서 애플리케이션이 세션을 사용할 수 있게 처리한다.
    secret: 'keyboard cat', // 옵션 1 : secret : 필수 옵션으로, 다른 사람이 봐서는 안되는 내용이라서 노출하면 안되고 자신만 아는 내용으로 입력한다. 따라서 git 등을 이용해 버전 관리를 한다면 소스 코드에 포함시키면 안되고 별도의 파일에 저장해서 관리해야한다. 실제 서버에 올릴 때는 이 코드를 변수 등으로 처리하는 것이 좋음 
    resave: false, // 옵션 2 : resave : 데이터를 세션 저장소에 저장할지를 설정한다. false 시 세션 데이터가 바뀌지 않는 한 세션 저장소에 저장하지 않고, true 시 세션 데이터의 변경 여부와 상관없이 무조건 세션 저장소에 저장한다.(false default)
    saveUninitialized: true, // 옵션 3 :  세션의 구동 여부를 설정한다. true 시 세션이 필요하기 전까지는 세션을 구동하지 않고, false 시 세션의 필요 여부와 상관없이 무조건 세션을 구동한다.  => 따라서 false로 설정하면 서버에 부담이 될 수 있다.
    store: new FileStore()
}));

app.use(function(req, res, next) {
    if (!req.session.views) {
        req.session.views = {};
    }

    // get the url pathname
    var pathname = parseurl(req).pathname;

    // count the views
    req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;

    next();
});

app.get('/', function(req, res, next) {
    console.log(req.session); // Session { cookie: { path: '/', _expires: null, originalMaxAge: null, httpOnly: true }} => session 미들웨어는 req 객체의 속성으로 session 객체를 추가한다.
    if(req.session.num === undefined){ // num값이 정의되어있지 않다면 1로 설정
        req.session.num = 1;
    } else { // 정의되어 있다면 기존 값에 1을 더한 다음 req.session.num값을 출력한다.
        req.session.num = req.session.num + 1;
    }
    res.send(`Views : ${req.session.num}`); // 웹 페이지를 새로고침하면 숫자가 1씩 중가한다. => 세션 데이터는 서버의 메모리에 저장되므로 Node.js 서버를 종료하면 세션이 지워진다. 따라서 Node.js 서버를 재구동하면 웹 페이지에 표시되는 숫자는 다시 1부터 시작된다.
});
app.get('/foo', function(req, res, next) {
    res.send('you viewed this page ' + req.session.views['/foo'] + ' times');
});

app.get('/bar', function(req, res, next) {
    res.send('you viewed this page ' + req.session.views['/bar'] + ' times');
});

app.listen(3000, function() {
    console.log('3000!');
});