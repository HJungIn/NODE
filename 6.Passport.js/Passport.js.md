# Passport.js
* 익스프레스 프레임워크에서 페이스북, 구글로 로그인하여 인증할 수 있는 라이브러리
* Passport.js 는 내부적으로 익스트레스의 session 미들웨어를 사용한다.
* Passport.js 사용 이유 : 인증 시스템의 복잡성과 위험성을 전문가가 아닌 사람이 감당하기는 쉽지 않아서 전문가들이 만들어 놓은 인증 전략을 이용하면 인증 기능을 쉽게 구현할 수 있다.
---   

### Passport.js
* 설치 : <code>npm install -s passport</code>
    * 아이디롸 비밀번호를 이용해 로그인 하는 전략 : <code>npm install -s passport-local</code>
* 적용 : Passport.js는 내부적으로 세션을 사용하므로 반드시 Passport와 관련된 코드를 세션을 활성화하는 코드 아래에 작성해야 한다.
    ```javascript
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
    ```
<br><br>
---   

### 인증과 구현 - 로그인
* Passport.js를 이용해서 로그인 기능을 구현하려면 로그인 데이터를 받아서 처리하는 login_process로직을 Password.js 체계로 바꿔야한다.
1. 익스프레스에 Passport.js를 설치하기
    ```javascript
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

    app.use(passport.initialize()); // passport.initialize 미들웨어룰 익스프레스에 설치
    app.use(passport.session());
    ```
2. 로그인에 성공하면 홈으로, 실패하면 다시 로그인 페이지로 이동
    ```javascript
    app.post('/auth/login_process', passport.authenticate('local', { // 사용하려는 전략, 로그인성공시와 실패시의 이동경로
        successRedirect: '/',
        failureRedirect: '/auth/login'
    }));
    ```
3. 로컬 전략
    ```javascript
    passport.use(new LocalStrategy(
        { // username과 password input창에서 사용한 name
            usernameField: 'email', 
            passwordField: 'pwd'
        }, 
        function(username, password, done){ // form으로 전송받은 데이터를 출력하는 코드
            console.log('LocalStrategy', username, password)
            if(username === authData.email){ // 이메일을 올바르게 입력했을 때
                if(password === authData.password){ // 비밀번호를 올바르게 입력했을 때
                    return done(null, authData, {
                        message: 'Welcome'
                    })
                }
                else {
                    return done(null, false, { // 비밀번호를 올바르게 입력하지 않았을 때
                        message: 'Incorrect password.'
                    })
                }
            }
            else{ // 이메일을 올바르게 입력하지 않았을 때
                return done(null, false, {
                    message: 'Incorrect username.'
                })
            }
            

        }
    ))
    ```
4. Passport.js가 세션을 처리할 수 없다는 에러 메세지 발생 시 적용하는 메서드
    * serializeUser() : 로그인이 성공했을 때 딱 한 번 호출된다.
    * deserializeUser() : 로그인 성공 이후에 사용자가 각 페이지에 방문할 때마다 세션에 기록된 데이터를 기준으로 deserializeUser()를 호출해 로그인 여부를 확인한다.
    ```javascript
    // Passport.js가 세션을 처리할 수 없다는 에러 메세지 발생 시 적용
    passport.serializeUser(function(user, done){ // serialize 메서드는 로그인에 성공했을 때 전달한 authData객체를 콜백 함수의 첫 번째 인자로 전달받는다. => 즉, user = authData
        done(null, user.email); // 식별자를 전달
    })

    passport.deserializeUser(function(id, done) { // deserializeUser 메서드는 페이지에 방문할 때마다 호출된다. 1번째 : 식별자 값
        done(null, authData);
    })
    ```
* 적용
    ```javascript
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;


    app.use(passport.initialize()); // passport.initialize 미들웨어룰 익스프레스에 설치
    app.use(passport.session());

    // Passport.js가 세션을 처리할 수 없다는 에러 메세지 발생 시 적용
    passport.serializeUser(function(user, done){ // serialize 메서드는 로그인에 성공했을 때 전달한 authData객체를 콜백 함수의 첫 번째 인자로 전달받는다. => 즉, user = authData
        done(null, user.email); // 식별자를 전달
    })

    passport.deserializeUser(function(id, done) { // serialize 메서드는 페이지에 방문할 때마다 호출된다. 1번째 : 식별자 값
        done(null, authData);
    })

    passport.use(new LocalStrategy(
        { // username과 password input창에서 사용한 name
            usernameField: 'email', 
            passwordField: 'pwd'
        }, 
        function(username, password, done){ // form으로 전송받은 데이터를 출력하는 코드
            console.log('LocalStrategy', username, password)

            if(username === authData.email){ // 이메일을 올바르게 입력했을 때
                if(password === authData.password){ // 비밀번호를 올바르게 입력했을 때
                    return done(null, authData, {
                        message: 'Welcome'
                    })
                }
                else {
                    return done(null, false, { // 비밀번호를 올바르게 입력하지 않았을 때
                        message: 'Incorrect password.'
                    })
                }
            }
            else{ // 이메일을 올바르게 입력하지 않았을 때
                return done(null, false, {
                    message: 'Incorrect username.'
                })
            }
        }
    ))

    app.post('/auth/login_process', passport.authenticate('local', { // 사용하려는 전략, 로그인성공시와 실패시의 이동경로
        successRedirect: '/',
        failureRedirect: '/auth/login'
    }));
    ```
<br><br>
---   

### 인증과 구현 - 로그아웃
* 로그아웃
    * 방법 1 : 한참 있다가 새로 고침했을 때 로그아웃되는 현상이 있음.<br>
    => Passport.js를 이용해 로그아웃하고 현재 세션이 지원진 것까지 확인한 다음 리다이렉트한다.
        ```javascript
        router.get('/logout', function (request, response) {
            request.logout();
            response.redirect('/');
        });
        ```
    * 방법 2 : 즉시 로그아웃<br>
    => 현재 세션 상태를 세션 스토어에 저장하고, 저장 작업이 끝나면 리다이렉트 진행한다.
        ```javascript
        router.get('/logout', function (request, response) {
            request.logout();
            request.session.save(function(err){ // 현재 세션 상태를 세션 스토어에 저장하고, 저장 작업이 끝나면 리다이렉트 진행
                response.redirect('/');
            })
            // response.redirect('/');
        });
        ```
<br><br>
---   

### 플래시 메시지
* 플래시 메시지 : 한 번 출력되고 사라지는 메시지으로 즉, **일회용 메시지**
    * ex ) 로그인 실패 메시지
* 설치 : <code>npm install -s connect-flash</code>
* 특징 : 내부적으로 세션 스토어에 데이터를 저장했다가 사용 후에는 지우는 특성이 있다.
* 적용 : 미들웨어는 실행 순서가 중요하며, 적용 시 웹 페이지에서 사용자의 요청이 있을 때마다 내부적으로 플래시가 작동한다.
    ```javascript
    var flash = require('connect-flash');

    ...

    app.use(session({
        secret: 'asadlfkj!@#!@#dfgasdg',
        resave: false,
        saveUninitialized: true,
        store:new FileStore()
    }));

    // 플래시 메시지 미들웨어는 내부적으로 세션을 이용하므로 반드시 세션 다음에 설치해야 한다.
    app.use(flash());

    app.get('/flash', function (req, res) { // /flash로 들어왔을 때 실행
        req.flash('msg', 'Flash is back!');
        res.send('flash');
    })
    app.get('/flash-display', function (req, res) {
        var fmsg = req.flash(); // flash에 어떤 값이 있는지 확인
        res.send(fmsg); // 해당 메시지를 웹 브라우저로 보내기
    })
    ```
<br><br>
---   

#### 플래시 메시지 - 로그인 시 메시지 띄우기
1. /login_process 콜백에서 successFlash, failureFlash 속성 설정
    ```javascript
    app.post('/auth/login_process', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
        successFlash: true
    }));
   
    <!-- 저장되는 형식 -->
    {"cookie": {"originalMaxAge":null, "expires":null, "httpOnly":true, "path":"/"},
     "flash":{"error":["Incorrect username."]}, "__lastAccess":1533036504804 
    }
    ```
2. 로그인 실패의 경우, 플래시 메시지가 있다면 그 메시지를 콘솔에 출력하기
    ```javascript
    router.get('/login', function(request, response) {
        var fmsg = request.flash();
        console.log(fmsg);
        var feedback = '';
        if(fmsg.error){
            feedback = fmsg.error[0];
        }
        var title = 'WEB - login';
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
            <div style="color:red;">${feedback}</div>
            <form action="/auth/login_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p>
                    <input type="submit" value="login">
                </p>
            </form>
        `, '');
        response.send(html);
    });
    ```
3. 로그인 성공 시 안내 메시지 띄우기
    ```javascript
    router.get('/', function(request, response) {
        console.log('/', request.user); // Passport.js를 사용해 로그인을 구현했으므로 request.user가 존재한다.
        var fmsg = request.flash();
        var feedback = '';
        if(fmsg.success){
            feedback = fmsg.success[0];
        }
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `<div style="color:blue;">${feedback}</div>
            <h2>${title}</h2>${description}
            <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
            `,
            `<a href="/topic/create">create</a>`,
            auth.statusUI(request, response)
        );
        response.send(html);
    });
    ```