<template>
  <div class="container">
    <div class="columns col-gapless fullh">
      <div class="column col-auto fullh left-side">

        <ul class="tab tab-block">
          <li class="tab-item" :class="{active:tab == 0}" @click="tab = 0">
            <a class="c-hand"><i class="icon icon-people"></i> 收藏</a>
          </li>
          <li class="tab-item" :class="{active:tab == 1}" @click="tab = 1">
            <a class="c-hand"><i class="icon icon-time"></i> 历史记录</a>
          </li>
        </ul>
        <div class="left-tab-content">
          <ul class="menu" v-if="tab == 0">
            <li class="menu-item" v-for="(f,i) in favlist" :key="f.time">
              <a class="c-hand" @click="req.history = f;refresh=Date.now()">
                <span class="label mr-1 tooltip tooltip-right" 
                :data-tooltip="f.type"
                :class="{'label-success':f.type == 'get',
                'label-primary':f.type == 'post',
                'label-secondary':f.type == 'put',
                'label-warning':f.type == 'delete'
              }">
              {{firstUpperCase(f.type)}}</span>
                {{prettyName(f)}}
              </a>
              <div class="menu-badge tooltip tooltip-left" data-tooltip="取消收藏" @click="delFav(i)">
                <label class="form-checkbox">
                  <input type="checkbox" checked disabled><i class="form-icon c-hand"></i>
                </label>
              </div>
            </li>
          </ul>
          <ul class="menu" v-else>
            <li class="menu-item tooltip tooltip-bottom" v-for="(h,i) in history" 
            :key="h.time"
            :data-tooltip="new Date(h.time).format('yyyy-MM-dd HH:mm:ss')">
              <a class="c-hand" @click="req.history = h;refresh=Date.now()">
                <span class="label mr-1 tooltip tooltip-right" 
                :data-tooltip="h.type"
                :class="{'label-success':h.type == 'get',
                'label-primary':h.type == 'post',
                'label-secondary':h.type == 'put',
                'label-warning':h.type == 'delete'
              }">
              {{firstUpperCase(h.type)}}</span>
                {{prettyName(h)}}
              </a>
              <div class="menu-badge tooltip tooltip-left" data-tooltip="收藏" @click="addFav(i)">
                <label class="form-checkbox">
                  <input type="checkbox" disabled><i class="form-icon c-hand"></i>
                </label>
              </div>
            </li>
          </ul>
        </div>
        

      </div>
      <div class="column fullh p-2 main-container">
        <component :is="RequestPanel" :refresh="refresh" :req="req.history" @sendReq="sendReq"></component>
        <component :is="ResponsePanel" :resp="resp.data"></component>
      </div>
    </div>
  </div>
</template>

<script>
import { ref,reactive } from 'vue'
import RequestPanel from './components/RequestPanel.vue'
import ResponsePanel from './components/ResponsePanel.vue'
import {clone,cache,firstUpperCase} from './scripts/tools.js'
import {API_HISTORY,API_FAV} from './scripts/const.js'

export default {
  setup() {

    const history = ref(cache(API_HISTORY))
    const favlist = ref(cache(API_FAV))

    const req = reactive({history:{}})

    const resp = reactive({data:{}})

    const refresh = ref(Date.now())

    const tab = ref(0)

    const prettyName = req => {
      let name = req.name || req.url;
      return name.length < 20 ? name : (name.substr(0,22)+'...')
    }

    const sendReq = fetchData => {
      resp.data = fetchData.resp
      if(!!fetchData.req){
        if(history.value.unshift(clone(fetchData.req)) > 15){
          history.value.length = 15
        }
        cache(API_HISTORY,history.value)
        tab.value = 1
      }
    }

    const addFav = i => {
      favlist.value.unshift(history.value.splice(i,1)[0])
      cache(API_FAV,favlist.value)
      cache(API_HISTORY,history.value)
    }

    const delFav = i => {
      favlist.value.splice(i,1)
      cache(API_FAV,favlist.value)
    }

    return {
      refresh,
      tab,
      req,
      resp,
      RequestPanel,
      ResponsePanel,
      history,
      favlist,
      sendReq,
      firstUpperCase,
      prettyName,
      addFav,
      delFav,
    }
  }
}

</script>

<style>
.container{padding:0}
.left-side,.main-container{max-height:100%;}
.left-side .menu{box-shadow: none;}
.left-side{width:250px;box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.4);z-index:1}
.main-container{background:#F8F8F8;}
i.c-hand{cursor: pointer !important;}
.left-side,.main-container{display: flex;flex-flow: column;overflow: hidden;}
.left-side>div{flex: 1;overflow-y: auto;}
.left-tab-content{position: relative;}
</style>
  