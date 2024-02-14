var express = require('express');
var app = express();
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
app.use(helmet());
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(express.static('public'));
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg',
    resave: false,
    saveUninitialized: true,
    store:new FileStore()
}));

// 플래시 메시지 미들웨어는 내부적으로 세션을 이용하므로 반드시 세션 다음에 설치해야 한다.
app.use(flash());
// app.get('/flash', function (req, res) { // /flash로 들어왔을 때 실행
//     req.flash('msg', 'Flash is back!');
//     res.send('flash');
// })
// app.get('/flash-display', function (req, res) {
//     var fmsg = req.flash(); // flash에 어떤 값이 있는지 확인
//     res.send(fmsg); // 해당 메시지를 웹 브라우저로 보내기
//     // res.render('index', {message: req.flash('info')});
// })

var passport = require('./lib/passport')(app);
// var passport = require('passport')
// , LocalStrategy = require('passport-local').Strategy;

// var authData = {
//     email: 'a@n.c',
//     password: '11',
//     nickname: 'a'
// }

// app.use(passport.initialize()); // passport.initialize 미들웨어룰 익스프레스에 설치
// app.use(passport.session());


// // Passport.js가 세션을 처리할 수 없다는 에러 메세지 발생 시 적용
// passport.serializeUser(function(user, done){ // serialize 메서드는 로그인에 성공했을 때 전달한 authData객체를 콜백 함수의 첫 번째 인자로 전달받는다. => 즉, user = authData
//     done(null, user.email); // 식별자를 전달
// })

// passport.deserializeUser(function(id, done) { // serialize 메서드는 페이지에 방문할 때마다 호출된다. 1번째 : 식별자 값
//     done(null, authData);
// })

// passport.use(new LocalStrategy(
//     { // username과 password input창에서 사용한 name
//         usernameField: 'email', 
//         passwordField: 'pwd'
//     }, 
//     function(username, password, done){ // form으로 전송받은 데이터를 출력하는 코드
//         console.log('LocalStrategy', username, password)
//         // User.findOne({username: username}, function (err, user){ // username 값이 저장소(MongoDB)에 있는지 확인하는 코드
//         //     if(err){
//         //         return done(err);
//         //     }
//         //     if(!user){
//         //         return done(null, false, {message: 'Incorrect username'}) // user이 없다면(user=false) 해당 username의 사람이 없는 것
//         //     }
//         //     if(!user.validPassword(password)){ // 사용자 정보는 있지만, 비밀번호가 유효한지 검사
//         //         return done(null, false, {message: 'Incorrect password'});
//         //     }

//         //     // 여기서부터는 사용자가 있다는 뜻
//         //     return done(null, user);
//         // })
//     // }
//         if(username === authData.email){ // 이메일을 올바르게 입력했을 때
//             if(password === authData.password){ // 비밀번호를 올바르게 입력했을 때
//                 return done(null, authData, {
//                     message: 'Welcome'
//                 })
//             }
//             else {
//                 return done(null, false, { // 비밀번호를 올바르게 입력하지 않았을 때
//                     message: 'Incorrect password.'
//                 })
//             }
//         }
//         else{ // 이메일을 올바르게 입력하지 않았을 때
//             return done(null, false, {
//                 message: 'Incorrect username.'
//             })
//         }
        

//     }
// ))

// app.post('/auth/login_process', passport.authenticate('local', { // 사용하려는 전략, 로그인성공시와 실패시의 이동경로
//     successRedirect: '/',
//     failureRedirect: '/auth/login',
//     failureFlash: true,
//     successFlash: true
// }));



app.get('*', function(request, response, next) {
    fs.readdir('./data', function(error, filelist) {
        request.list = filelist;
        next();
    });
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});
