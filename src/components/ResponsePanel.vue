<template>
    <ul class="tab">
        <li class="tab-item" :class="{active:tab == 0}" @click="tab = 0">
            <a href="#">响应主体</a>
        </li>
        <li class="tab-item" :class="{active:tab == 1}" @click="tab = 1">
            <a href="#">响应头</a>
        </li>
        <li class="tab-item" :class="{active:tab == 2}" @click="tab = 2">
            <a href="#">Cookie</a>
        </li>
    </ul>
    
    <div>
      <div v-if="tab == 0">
        <textarea class="form-input input-sm" :value="fullResp.resp" rows="15" readonly></textarea>
      </div>
      <div v-else-if="tab == 1">
        <table class="table">
          <thead>
            <tr>
              <th class="p-1">Name</th>
              <th class="p-1">Value</th>
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
      <div v-else-if="tab == 2">
        <table class="table">
          <thead>
            <tr>
              <th class="p-1">Name</th>
              <th class="p-1">Value</th>
              <th class="p-1">Domain</th>
              <th class="p-1">HostOnly</th>
              <th class="p-1">Path</th>
              <th class="p-1">Secure</th>
              <th class="p-1">HttpOnly</th>
              <th class="p-1">Session</th>
              <th class="p-1">ExpirationDate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cookie in fullResp.cookies" :key="cookie.name" class="cookie">
              <td class="p-1 wb">{{cookie.name}}</td>
              <td class="p-1 wb">{{cookie.value}}</td>
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
              <td class="p-1">{{cookie.expirationDate}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
</template>
  
  <script>
  import {ref,reactive,effect,watch } from 'vue'
  
  export default { 
    props:['resp'],
    setup(props) {
        const tab = ref(0)
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

      effect(()=>{
        parseRespData(props.resp)
        if(!!props.resp.headers){
          props.resp.headers.forEach((val,key) => fullResp.headers.push({key,val}))
        } else {
          fullResp.header = []
        }
        //利用Chrome的扩展接口去获取Cookie
        if(!!props.resp.url && !!chrome && !!chrome.cookies){
          chrome.cookies.getAll({url:props.resp.url},cookies => fullResp.cookies = cookies)
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
  .table{background: #fff;}
  .table tbody tr:last-child td{border:none}
  .wb{word-break:break-all;}
  .cookie td{font-size:.5rem;padding:.2rem !important;}
  </style>
    