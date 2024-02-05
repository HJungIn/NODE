module.exports = {
    authIsOwner:function (request, response) {
        if(request.session.is_logined){
            return true;
        } else {
            return false;
        }
    },
    
    authStatusUI:function (request, response) {
        var authStatusUI = '<a href="/auth/login">login</a>'
        if(this.authIsOwner(request, response)){ // 로그인 된 상태라면 로그아웃 링크가 나오도록
            authStatusUI = `${request.session.nickname} | <a href="/auth/logout">logout</a>`
        }
        return authStatusUI;
    }
}