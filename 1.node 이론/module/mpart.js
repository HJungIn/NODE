var M = {
    v: 'v',
    f: function(){
        console.log(this.v);
    }
}

module.exports = M; // 이 파일에 선언한 M 객체를 외부에서 사용할 수 있게 하는 코드