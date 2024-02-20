var db = require('../lib/db');
var bcrypt = require('bcrypt');

module.exports = function (app) {
    var passport = require('passport')
        , LocalStrategy = require('passport-local').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        console.log('serializeUser', user);
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        var user = db.get('users').find({id:id}).value();
        console.log('deserializeUser', id, user);
        done(null, user);
    });

    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function(email, password, done) {
            console.log('LocalStrategy', email, password);
            var user = db.get('users').find({
                email: email
            }).value();
            if (user) {
                bcrypt.compare(password, user.password, function(err, result) {
                    if(result) {
                        return done(null, user, {
                            message: 'Welcome.'
                        });
                    } else {
                        return done(null, false, {
                            message: 'Password is not correct.'
                        });
                    }
                });
            } else {
                return done(null, false, {
                    message: 'There is no email.'
                });
            }
        }
    ));

    // 사용자가 /auth/google로 가면 인증 과정을 거치게 해주는 코드 => 따라서 이 라우터와 함께 구글로 로그인하기 버튼을 추가해야 한다.
    app.get('/auth/google', 
    passport.authentication('google', {
        scope: ['https://www.google.com/m8/feeds', 'email'],
        failureRedirect: '/login'
            }),
            function(req, res){
                res.redirect('/');
            }
        );

    var googleCredentials = require('../config/google.json'); // 다른 사람에게 노출되지 않도록 파일 분리
    console.log(googleCredentials.web.client_id)
    passport.use(new GoogleStrategy({
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0]
        },
        function (accessToken, refreshToken, profile, done) {
            var email = profile.emails[0].value;

            // 구글에서 가져온 이메일과 일치하는 사용자가 있는지 db.json에서 검색
            var user = db.get('users').find({email: email}).value();

            // 사용자가 있다면 이 사용자의 정보에 googleId값을 추가한다.
            if(user){
                user.googleId = profile.id;
                db.get('users').find({id:user.id}).assign(user).write(); // 변경된 user의 값을 DB에 반영한다.
            } else { // 없다면 사용자 추가함으로써 회원가입 절차 진행하기
                user = {
                    id: shortid.generate(),
                    email: email,
                    displayNmae: profile.displayName,
                    googleId: profile.id
                }
                db.get('users').push(user).write();
            }

            done(null, user);

            // User.findOrCreate({
            //     googleId: profile.id
            // }), function (err, user){
            //     return done(err, user);
            // }
        }
    ));
    
    return passport
}
