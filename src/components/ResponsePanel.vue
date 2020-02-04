<template>
  <div class="response-panel">
    <ul class="tab">
        <li class="tab-item" :class="{active:tab.curr == 0}" @click="tab.curr = 0">
          <a class="c-hand">响应主体</a>
        </li>
        <li class="tab-item" :class="{active:tab.curr == 1}" @click="tab.curr = 1">
          <a class="c-hand">响应头</a>
        </li>
        <li class="tab-item" :class="{active:tab.curr == 2}" @click="tab.curr = 2">
          <a class="c-hand">Cookie</a>
        </li>
        <li class="tab-item tab-action">
          <button class="btn btn-link btn-sm" @click="tab.hide = !tab.hide">
            <span v-if="tab.hide"><i class="icon icon-arrow-up"></i> 展开</span>
            <span v-else><i class="icon icon-arrow-down"></i> 收起</span>
          </button>
        </li>
    </ul>
    
    <div class="resp-tab-content ani" :class="{hide:tab.hide}">
      <div v-if="tab.curr == 0">
        <pre class="code">{{fullResp.resp}}</pre>
      </div>
      <div v-else-if="tab.curr == 1">
        <table class="table p-relative">
          <thead>
            <tr>
              <th class="p-1 p-sticky">Name</th>
              <th class="p-1 p-sticky">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in fullResp.headers" :key="h.key">
              <td class="p-1">{{h.key}}</td>
              <td class="p-1">{{h.val}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="tab.curr == 2">
        <table class="table p-relative">
          <thead>
            <tr>
              <th class="p-1 p-sticky">Name</th>
              <th class="p-1 p-sticky">Value</th>
              <th class="p-1 p-sticky">Domain</th>
              <th class="p-1 p-sticky">HostOnly</th>
              <th class="p-1 p-sticky">Path</th>
              <th class="p-1 p-sticky">Secure</th>
              <th class="p-1 p-sticky">HttpOnly</th>
              <th class="p-1 p-sticky">Session</th>
              <th class="p-1 p-sticky">ExpirationDate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cookie in fullResp.cookies" :key="cookie.name" class="cookie">
              <td class="p-1 text-break">{{cookie.name}}</td>
              <td class="p-1 text-break">{{cookie.value}}</td>
              <td class="p-1">{{cookie.domain}}</td>
              <td class="p-1">
                <label class="form-checkbox">
                  <input type="checkbox" :checked="cookie.hostOnly" disabled>
                  <i class="form-icon"></i>
                </label>
              </td>
              <td class="p-1">{{cookie.path}}</td>
              <td class="p-1">
                <label class="form-checkbox">
                  <input type="checkbox" :checked="cookie.secure" disabled>
                  <i class="form-icon"></i>
                </label>
              </td>
              <td class="p-1">
                <label class="form-checkbox">
                  <input type="checkbox" :checked="cookie.httpOnly" disabled>
                  <i class="form-icon"></i>
                </label>
              </td>
              <td class="p-1">
                <label class="form-checkbox">
                  <input type="checkbox" :checked="cookie.session" disabled>
                  <i class="form-icon"></i>
                </label>
              </td>
              <td class="p-1">{{cookie.expirationDate?new Date(cookie.expirationDate*1000).format('yyyy/MM/dd HH:mm:ss'):'Session'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
  
<script>
import {ref,reactive,watch } from 'vue'

export default { 
  props:['resp'],
  setup(props) {
      const tab = reactive({
        curr:0,
        hide:false
      })
      const fullResp = reactive({resp:'',headers:[],cookies:[]})


      const parseRespData = (resp) => {
        if(resp.error){
          fullResp.resp = resp.error
        } else if(resp.status >= 200 && resp.status < 300){
          resp.text().then(text=>fullResp.resp = text)
        } else {
          fullResp.resp = resp.statusText
        }
      }

    watch(()=>props.resp,resp=>{
      tab.curr = 0
      tab.hide = false
      parseRespData(resp)
      if(!!resp.headers){
        resp.headers.forEach((val,key) => fullResp.headers.push({key,val}))
      } else {
        fullResp.header = []
      }
      //利用Chrome的扩展接口去获取Cookie
      if(!!resp.url && !!chrome && !!chrome.cookies){
        chrome.cookies.getAll({url:resp.url},cookies => fullResp.cookies = cookies)
      } else {
        fullResp.cookies = [];
      }
    })
    return {
      tab,
      parseRespData,
      fullResp,
    }
  }
}

</script>
  
<style scoped>
.reqname,.reqmethod{flex:none;width:120px}
.p_key{width:20%}
.p_ops{width:5%}
.bb{border-bottom: .05rem solid #dadee4;}
.resp-tab-content{max-height:293px;height:293px;overflow-y: auto;}
.resp-tab-content.hide{height:0;overflow: hidden;}
.cookie td{font-size:.5rem;padding:.2rem !important;}
</style>
    