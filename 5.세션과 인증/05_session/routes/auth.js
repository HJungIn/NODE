var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

var authData = {
    email: 'a@n.c',
    password: '11',
    nickname: 'a'
}

router.get('/login', function(request, response) {
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/auth/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="pwd" placeholder="password">
            </p>
            <p>
                <input type="submit" value="login">
            </p>
        </form>
    `, '');
    response.send(html);
});
router.post('/login_process', function(request, response) {
    console.log(request.list);
    var post = request.body;
    var email = post.email;
    var password = post.pwd;
    if( email === authData.email && password === authData.password){
        // 일반적으로 세션 데이터에는 이메일과 비밀번호와 같은 정보는 저장하지 않고, 사용자가 로그인했는지 알려주는 정보와 닉네임처럼 페이지에 접근할 때마다 필요한 사용자 정보를 저장한다.
        // 이렇게 세션에 사용자의 정보를 담아 두면 데이터베이스나 파일에 다시 접근할 필요가 없어서 효율적이다.
        request.session.is_logined = true;
        request.session.nickname = authData.nickname;
        request.session.save(function(){
            response.redirect(`/`);
        })
    } else{
        response.send('Who?')
    }
});
router.get('/logout', function(request, response) {
    request.session.destroy(function(err){
        response.redirect('/');
    })
});
// router.get('/update/:pageId', function(request, response) {
//     var filteredId = path.parse(request.params.pageId).base;
//     fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
//         var title = request.params.pageId;
//         var list = template.list(request.list);
//         var html = template.HTML(title, list,
//             `
//             <form action="/topic/update_process" method="post">
//                 <input type="hidden" name="id" value="${title}">
//                 <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//                 <p>
//                     <textarea name="description"
//                         placeholder="description">${description}</textarea>
//                 </p>
//                 <p>
//                     <input type="submit">
//                 </p>
//             </form>
//             `,
//             `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
//         );
//         response.send(html);
//     });
// });
// router.post('/update_process', function(request, response) {
//     var post = request.body;
//     var id = post.id;
//     var title = post.title;
//     var description = post.description;
//     fs.rename(`data/${id}`, `data/${title}`, function(error) {
//         fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
//             response.redirect(`/topic/${title}`);
//             response.end();
//         });
//     });
// });
// router.post('/delete_process', function(request, response) {
//     var post = request.body;
//     var id = post.id;
//     var filteredId = path.parse(id).base;
//     fs.unlink(`data/${filteredId}`, function(error) {
//         response.redirect('/');
//     });
// });
// router.get('/:pageId', function(request, response, next) {
//     var filteredId = path.parse(request.params.pageId).base;
//     fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
//         if(err) {
//             next(err);
//         } else {
//             var title = request.params.pageId;
//             var sanitizedTitle = sanitizeHtml(title);
//             var sanitizedDescription = sanitizeHtml(description, {
//                 allowedTags:['h1']
//             });
//             var list = template.list(request.list);
//             var html = template.HTML(sanitizedTitle, list,
//                 `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
//                 ` <a href="/topic/create">create</a>
//                     <a href="/topic/update/${sanitizedTitle}">update</a>
//                     <form action="/topic/delete_process" method="post">
//                         <input type="hidden" name="id" value="${sanitizedTitle}">
//                         <input type="submit" value="delete">
//                     </form>`
//             );
//             response.send(html);
//         }
//     });
// });
module.exports = router;
