var http = require('http');
var cookie = require('cookie');

http.createServer(function(request, response){
    console.log(request.headers.cookie); // return : yummy_cookie=choco; tasty_cookie=strawberry
    var cookies = {};
    if(request.headers.cookie !== undefined){ // cookie가 없을 때 에러나지 않게 하기 위해
        cookies = cookie.parse(request.headers.cookie); // 쿠키값이 객체화 되어 다루기 쉬워진다. => return : { yummy_cookie:'choco', tasty_cookie: 'strawberry'}
    }
    
    console.log(cookies.yummy_cookie); // 부르는 방법 => return : choco

    response.writeHead(200, {
        // 'set-cookie':['yummy_cookie=choco', 'tasty_cookie=strawberry']
        'set-cookie':[
            'yummy_cookie=choco', // 세션 쿠키
            'tasty_cookie=strawberry', // 세션 쿠키
            `Permanent=cookies; Max-Age=${60*60*24*30}`, // 영구 쿠키
            'Secure_Cookie=Secure_value; Secure', // 세미콜론 뒤에 Secure 옵션 지정 : HTTPS 프로토콜로 콩신하는 경우에만 쿠키가 생성되게 함.
            'HttpOnly_Cookie=HttpOnly_value; HttpOnly', // 세미콜론 뒤에 HttpOnly 옵션 지정 : HTTP에서도 쿠키값을 가져올 수 있지만, 자바스크립트 코드로는 그 값을 가져올 수 없게 한다. 
            'Path_Cookie=Path_value; Path=/cookie', // 세미콜론 뒤에 Path 옵션 지정 : 특정 디렉터리(경로)에서만 쿠키가 활성화되게 하는 것
            'Domain_Cookie=Domain_value; Domain=o2.org' // 세미콜론 뒤에 Domain 옵션 지정 : 특정 도메인에서만 쿠키가 활성화되게 하는 것
        ]
    })
    response.end('Cookie!');
}).listen(3000);