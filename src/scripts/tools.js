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

const parseFormData = (arr,fn=o=>o) => {
    let form = new FormData()
    arr.filter(item => item.key)
        .forEach(item => form.append(fn(item.key),fn(item.val)));
    return form;
}
const parseQueryStr = (arr,fn=o=>o) => arr
    .filter(item => item.key)
    .map(item => `${fn(item.key)}=${fn(item.val)}`)
    .join('&')

const parseText = (arr) => 
    arr.filter(item => item.key||item.val)
        .map(item => item.key+':'+item.val)
        .join('\n')

const parseObject = (arr,fn=o=>o) => {
    let obj = {};
    arr.filter(item => item.key)
    .forEach(item => obj[fn(item.key)] = fn(item.val));
    return obj;
}


const firstUpperCase = (str) => str.substr(0,1).toUpperCase();


const prettyText = (str,len) => {
    return str.length <= len?str:str.substr(0,len-1)+'...'
}

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
    firstUpperCase,prettyText,
    addItem,checkArr
}