import {CACHE} from './const.js'
const cache = (key,val) => {
    if(!val){
        return JSON.parse(CACHE[key]||'[]');
    } else {
        CACHE[key] = typeof val == 'string'?val:JSON.stringify(val);
    }
}
const clear = (obj) => {for(let key in obj) obj[key] = null}
const mixin = (target,obj) => {
    for(let key in obj){
        target[key] = obj[key]
    }
    return target;
}
const clone = (obj) => mixin({},obj)

const parseArr = (str) => str.split(/[\r|\n]+/)
    .filter(item => !!item.length)
    .map(item => {
    let key = item.split(':')[0]
    return {key,val:item.substr(key.length+1)}
})

const parseFormData = (arr) => {
    let form = new FormData()
    arr.filter(item => item.key && item.val)
        .forEach(item => form.append(item.key,item.val));
    return form;
}
const parseQueryStr = (arr) => arr
    .filter(item => item.key && item.val)
    .map(item => `${item.key}=${item.val}`)
    .join('&')

const parseText = (arr) => 
    arr.filter(item => item.key||item.val)
        .map(item => item.key+':'+item.val)
        .join('\n')

const parseObject = (arr) => {
    let obj = {};
    arr.filter(item => item.key||item.val)
    .forEach(item => obj[item.key] = item.val);
    return obj;
}


const firstUpperCase = (str) => str.substr(0,1).toUpperCase();

const addItem = arr => {
    arr.push({key:'',val:''})
    return arr;
}

const checkArr = arr => {
    if(arr.length == 0){
        addItem(arr)
    }
}

export {
    cache,clear,clone,mixin,
    parseArr,parseFormData,parseText,parseObject,parseQueryStr,
    firstUpperCase,
    addItem,checkArr
}