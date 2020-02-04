<template>
    <div class="modal active">
        <a class="modal-overlay"></a>
        <div class="modal-container p-2">
            <div class="modal-header p-2">
                <a class="btn btn-clear float-right" @click="close"></a>
                <div class="modal-title h5">环境变量</div>
            </div>
            <div class="modal-body p-2 env-mgr">
                <div class="content columns fullh">
                    <div class="column col-3 env-mgr-list fullh">
                        <ul class="menu p-0">
                            <li class="menu-item p-sticky add-env wbg" @click="addEnv">
                                <a class="c-hand"><i class="icon icon-plus"></i> 新增环境变量</a>
                            </li>
                            <li class="menu-item" v-for="(env,i) in envlist" :key="env.name" @click="editEnv(i)">
                                <a class="c-hand text-ellipsis">{{env.name}}
                                    <div class="menu-badge">
                                        <label class="label label-primary">{{env.items.length}}</label>
                                    </div>
                                </a>
                            </li>

                        </ul>
                    </div>
                    <div class="column col-9 env-mgr-edit fullh">
                        <div class="input-group env-mgr-name"><span class="input-group-addon addon-sm">环境变量</span>
                            <input class="form-input input-sm" maxlength="10" type="text" placeholder="变量名称" v-model="env.name">
                            <button class="btn input-group-btn btn-sm" @click="saveEnv" :disabled="!env.name"><i class="icon icon-check"></i> 保存</button>
                            <button class="btn input-group-btn btn-sm" v-if="env.index >= 0" @click="delEnv">删除</button>
                        </div>
                        <div class="env-mgr-kv p-relative">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th class="p-1 p-sticky wbg env-key">变量参数</th>
                                        <th class="p-1 p-sticky wbg env-val">变量值</th>
                                        <th class="p-1 p-sticky wbg env-ops" @click="addItem(env.items)"><button class="btn btn-link btn-sm"><i class="icon icon-plus"></i></button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in env.items" :key="item">
                                        <td class="p-1"><input type="text" class="form-input input-sm" v-model="item.key"/></td>
                                        <td class="p-1"><input type="text" class="form-input input-sm" v-model="item.val"/></td>
                                        <td class="p-1"><button class="btn btn-link btn-sm" @click="env.items.splice(i,1)"><i class="icon icon-cross"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ref,reactive,effect } from 'vue'
import {API_ENV} from '../scripts/const.js'
import {cache,clone,mixin,checkArr,addItem} from '../scripts/tools.js'


export default {
    setup(props,{emit}) {

        const envlist = ref(cache(API_ENV))

        const emptyEnv = {
            name:'',
            items:[],
            index:-1
        }

        const env = reactive(clone(emptyEnv))
        
        const addEnv = () => mixin(env,emptyEnv)
        const editEnv = (i) => {
            let sel = envlist.value[i]
            env.name = sel.name
            env.items = sel.items.filter(el => el.key || el.val)
            env.index = i;
        }

        const saveEnv = () => {
            let curr = {
                name:env.name,
                items:env.items.filter(el => el.key || el.val)
            };
            if(env.index == -1){
                envlist.value.push(curr)
            } else {
                envlist.value[env.index] = curr;
            }
            mixin(env,emptyEnv)
            cache(API_ENV,envlist)
        }
        const delEnv = () => {
            if(env.index >= 0){
                envlist.value.splice(env.index,1)
                mixin(env,emptyEnv)
                cache(API_ENV,envlist)
            }
        }

        const close = () => emit('refreshEnv')

        effect(()=>checkArr(env.items))
        

        return {
            env,
            envlist,
            addEnv,
            editEnv,
            addItem,
            saveEnv,
            delEnv,
            close,
        }
    }
}
</script>
<style>
.env-mgr{height:380px;}
.env-mgr-list,.env-mgr-edit{display:flex;flex-flow: column;}
.env-mgr-list ul,.env-mgr-kv{min-width:auto;box-shadow: none;flex: 1;overflow-y: auto;}
.env-mgr-name{flex:none;}
.wbg{background:#fff;}
.env-key{width:40%}
.env-val{width:50%}
.env-ops{width:10%}
</style>