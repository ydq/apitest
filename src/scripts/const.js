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

export {CACHE,API_HISTORY,API_FAV,API_ENV,FORM_CONTENT_TYPE,CONTENT_TYPE}