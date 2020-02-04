const CACHE = window.localStorage;
const API_HISTORY = "API_HISTORY";
const API_FAV = "API_FAV";
const API_ENV = "API_ENV";

const FORM_CONTENT_TYPE = 'x-www-form-urlencoded;charset=UTF-8'
const CONTENT_TYPE = {
    'FormData':FORM_CONTENT_TYPE,
    'JSON':'application/json',
    'XML':'application/xml',
    'TEXT':'text/plain',
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export {CACHE,API_HISTORY,API_FAV,API_ENV,FORM_CONTENT_TYPE,CONTENT_TYPE}