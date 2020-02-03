<template>
  <div>

  <div class="input-group">
    <input class="form-input reqname" v-model="req.name" type="text" placeholder="接口名称" maxlength="10"/>
    <select class="form-select reqmethod" v-model="req.type">
      <option value="get">GET</option>
      <option value="post">POST</option>
      <option value="put">PUT</option>
      <option value="delete">DELETE</option>
    </select>
    <input class="form-input" type="text" v-model="req.url" placeholder="接口地址" maxlength="300"/>
    <button class="btn btn-primary input-group-btn" @click="sendReq"><i class="icon icon-check"></i> 发 送</button>
    <button class="btn input-group-btn ml-2" @click="mixin(req,emptyReq())"><i class="icon icon-refresh"></i> 重 置</button>
    <!--  
    <div class="dropdown dropdown-right ml-2"><a class="btn dropdown-toggle" tabindex="0">{{currEnv.name||'设置环境变量'}} <i class="icon icon-caret"></i></a>
      <ul class="menu">
        <li class="menu-item" @click="clear(currEnv)"><a href="#"><i class="icon icon-stop"></i> 禁用环境变量</a></li>
        <li class="menu-item" v-for="e in env" @click="mixin(currEnv,e)"><a href="#"><i class="icon icon-flag"></i> {{e.name}}</a></li>
        <li class="menu-item"><a href="#"><i class="icon icon-edit"></i> 管理环境变量</a></li>
      </ul>
    </div>
    -->
  </div>

  <ul class="tab">
    <li class="tab-item" :class="{active:tab == 0}" @click="tab = 0">
      <a href="#">请求头</a>
    </li>
    <li class="tab-item" :class="{active:tab == 1}" @click="tab = 1">
      <a href="#">请求参数</a>
    </li>
    <li class="tab-item tab-action" v-if="tab == 0 || req.type == 'get' || req.paramsType == FORM_CONTENT_TYPE">
      <button class="btn btn-link btn-sm" @click="openBatchEditor"><i class="icon icon-edit"></i> 批量编辑</button>
    </li>
  </ul>
  <div class="tab-content bb">
      <div v-if="tab == 0">
          <table class="table">
              <thead>
                  <tr>
                    <td class="p_key p-1">Header Key</td>
                    <td class="p_val p-1">Header Value</td>
                    <td class="p_ops p-1"><button class="btn btn-link btn-sm"
                      @click="addItem(reqParam.headers)"><i class="icon icon-plus"></i> 添加</button></td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(h,i) in reqParam.headers" :key="h">
                    <td class="p-1"><input type="text" v-model="h.key" class="form-input input-sm"></td>
                    <td class="p-1"><input type="text" v-model="h.val" class="form-input input-sm"></td>
                    <td class="p-1"><button type="button" class="btn btn-link btn-sm" @click="reqParam.headers.splice(i,1)"><i class="icon icon-cross"></i> 删除</button></td>
                  </tr>
                </tbody>
          </table>
      </div>
      <div v-else>
          <div v-if="req.type != 'get'" class="bb py-1">
            请求数据类型:
              <label class="form-inline">
                <select class="form-select select-sm" v-model="req.paramsType">
                    <option v-for="(val,name) in CONTENT_TYPE" :value="val">{{name}}</option>
                </select>
              </label>
          </div>

          <table class="table" v-if="req.type == 'get' || req.paramsType == FORM_CONTENT_TYPE">
              <thead>
                  <tr>
                    <td class="p_key p-1">Param Key</td>
                    <td class="p_val p-1">Param Value</td>
                    <td class="p_ops p-1"><button class="btn btn-link btn-sm"
                      @click="addItem(reqParam.params)"><i class="icon icon-plus"></i> 添加</button></td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p,i) in reqParam.params" :key="p">
                    <td class="p-1"><input type="text" v-model="p.key" class="form-input input-sm"></td>
                    <td class="p-1"><input type="text" v-model="p.val" class="form-input input-sm"></td>
                    <td class="p-1"><button type="button" class="btn btn-link btn-sm" @click="reqParam.params.splice(i,1)"><i class="icon icon-cross"></i> 删除</button></td>
                  </tr>
                </tbody>
          </table>
          <textarea v-else class="form-input input-sm my-1" rows="6" v-model="req.body"></textarea>
      </div>
  </div>
  <component 
  :is="BatchEdit" 
  v-if="batch.switch" 
  v-bind="batch"
  @saveEdit="saveBatchContent"
  ></component>
  </div>
</template>

<script>
import {ref,reactive,effect,watch } from 'vue'
import {cache,clone,mixin,parseArr,parseText,parseObject,parseQueryStr,parseFormData,addItem,checkArr} from '../scripts/tools.js'
import {FORM_CONTENT_TYPE,CONTENT_TYPE,API_ENV} from '../scripts/const.js'
import BatchEdit from './BatchEdit.vue'

export default { 
  props:{
    refresh:{
      type: Number,
      default:0
    },
    req:{
      type: Object,
      default: {}
    },
    sendReq:{
      type: Function,
      default: ()=>{}
    }
  },
  setup(props,{emit}) {

    const emptyReq = () => {
      return {
          name:'',
          type:'get',
          url:'',
          headers:'',
          params:'',
          body:'',
          paramsType:FORM_CONTENT_TYPE,
          time:0
      }
    }

    const req = reactive(mixin(emptyReq(),props.req))

    const tab = ref(1);

    const reqParam = reactive({
      headers:parseArr(req.headers),
      params:req.paramsType==FORM_CONTENT_TYPE?parseArr(req.params):addItem([])
    });

    const batch = reactive({switch:false,title:'',content:''})

    const env = ref(cache(API_ENV));
    const currEnv = ref({});

    //打开批量编辑组件的方法
    const openBatchEditor = () => {
      batch.title = '批量编辑'+(tab.value == 0?'请求头':'请求参数')
      batch.content = parseText(reqParam[tab.value == 0?'headers':'params'])
      batch.switch= true
    }

    //批量编辑组件保存回调的方法
    const saveBatchContent = editor => {
      batch.switch= false
      if(editor.state){
        reqParam[tab.value == 0?'headers':'params'] = parseArr(editor.content);
      }
    }

    //发送API请求的方法
    const sendReq = async () => {
      if(!req.url){
        emit('sendReq',{resp:{error:'URL地址不能为空!'}})
      } else {
        req.params = parseText(reqParam.params)
        req.time = Date.now();
        let headers = parseObject(reqParam.headers);
        headers['Content-Type'] = req.paramsType;
        let resp,success = true;
        if(req.type == 'get'){
          let queryStr = parseQueryStr(reqParam.params)
          let url = !queryStr?req.url:(req.url + (req.url.indexOf('?')>0?'&':'?') + queryStr)
          resp = await fetch(url,{
            method:req.type,
            headers:headers,
            credentials: 'include'
          }).catch(ex => {
            emit('sendReq',{resp:{error:ex.message}})
            success = false
          })
        } else {
          resp = await fetch(req.url,{
            method:req.type,
            headers:headers,
            credentials: 'include',
            body:req.paramsType == FORM_CONTENT_TYPE ? parseFormData(reqParam.params):req.body
          }).catch(ex => {
            emit('sendReq',{resp:{error:ex.message}})
            success = false
          })
        }
        if(success){
          emit('sendReq',{resp,req})
        }
      }
    }
      
    //监听数组 当数组被删除到没有了自动增加一行
    effect(()=>checkArr(reqParam.headers))
    effect(()=>checkArr(reqParam.params))
    //监听 props中的req,当父组件传入新的req时覆盖当前的配置
    watch(()=> props.refresh,()=> mixin(req,clone(props.req)))

    return {
      tab,
      req,
      emptyReq,
      mixin,
      env,
      currEnv,
      addItem,
      reqParam,
      CONTENT_TYPE,
      FORM_CONTENT_TYPE,
      BatchEdit,
      batch,
      openBatchEditor,
      saveBatchContent,
      sendReq,
    }
  }
}

</script>
  
<style scoped>
.reqname,.reqmethod{flex:none;width:120px}
.p_key{width:20%}
.p_ops{width:5%}
.bb{border-bottom: .05rem solid #dadee4;}
.table tbody tr:last-child td{border:none}
</style>
  