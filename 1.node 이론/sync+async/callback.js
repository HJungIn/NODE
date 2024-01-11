var a = function (){ // 익명 함수 : 변수를 선언하여 대입해야 함수를 호출할 수 있다.
   console.log('A');
} 

a(); // a라는 변수 뒤에 함수 호출 연산자 ()를 지정함으로써 a 변수에 담긴 함수를 호출할 수 있다.

// slowfunc() : 처리시간이 오래 걸리는 함수
function slowfunc(callback){ // 콜백을 매개변수로 받아서 호출한다.
    callback();
}

slowfunc(a);