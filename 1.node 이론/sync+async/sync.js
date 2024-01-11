var fs = require('fs');

//readFileSync => 동기 처리 방식으로 동작
console.log('A');
var result = fs.readFileSync('./sample.txt', 'utf-8');
console.log(result);
console.log('C');
/* 결과
A
B
C
*/

console.log('================================')

//readFileSync => 비동기 처리 방식으로 동작
console.log('A');
fs.readFile('./sample.txt', 'utf-8', function(err, result){
    console.log(result);
}); // 파일 읽기를 마치면 callback 함수를 자동으로 호출해서 함수의 본문을 실행한다.
console.log('C');
/* 결과
A
C
B
*/
// 결과 이유 : readFild 처리를 완료하기 전에 다음 명령을 실행해서 'C'를 출력한다.