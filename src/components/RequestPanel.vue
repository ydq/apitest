<template>
    <div class="request-panel">

        <div class="input-group">
            <input class="form-input reqname" v-model="req.name" type="text" placeholder="接口名称" maxlength="10" />
            <select class="form-select reqmethod" v-model="req.type">
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="put">PUT</option>
                <option value="delete">DELETE</option>
            </select>
            <input class="form-input" type="text" v-model="req.url" placeholder="接口地址" maxlength="300" />
            <button class="btn btn-primary input-group-btn" @click="sendReq"><i class="icon icon-check"></i> 发 送</button>
            <button class="btn input-group-btn ml-2 tooltip tooltip-bottom" data-tooltip="清空所有内容" @click="resetRequest"><i class="icon icon-refresh"></i> 重 置</button>
            <div class="dropdown dropdown-right ml-2 tooltip tooltip-left" data-tooltip="可以在URL以及请求头和参数中使用"><a class="btn dropdown-toggle" tabindex="0">{{env.curr.name||'设置环境变量'}} <i class="icon icon-caret"></i></a>
                <ul class="menu">
                    <li class="menu-item" @click="env.curr = {}"><a class="c-hand"><i class="icon icon-stop"></i> 停用环境变量</a></li>
                    <li class="menu-item" v-for="item in env.list" @click="env.curr = item" :key="item"><a class="c-hand"><i class="icon icon-flag"></i> {{item.name}}</a></li>
                    <li class="menu-item" @click="env.show = true"><a class="c-hand"><i class="icon icon-edit"></i> 管理环境变量</a></li>
                </ul>
            </div>
        </div>

        <ul class="tab">
            <li class="tab-item" :class="{active:tab == 0}" @click="tab = 0">
                <a class="c-hand">请求参数</a>
            </li>
            <li class="tab-item" :class="{active:tab == 1}" @click="tab = 1">
                <a class="c-hand">请求头</a>
            </li>
            <li class="tab-item tab-action">
                <label class="form-switch form-inline c-hand">
                    <input type="checkbox" v-model="req.cookie">
                    <i class="form-icon"></i> Cookie
                </label>
                <button class="btn btn-link btn-sm tooltip tooltip-left" @click="openBatchEditor" v-if="tab == 1 || req.type == 'get' || req.paramsType == FORM_CONTENT_TYPE" :data-tooltip="'批量编辑请求'+(tab==1?'头':'参数')">
                    <i class="icon icon-edit"></i> 批量编辑
                </button>
            </li>
        </ul>
        <div class="req-tab-content bb">
            <div v-if="tab == 0">
                <div v-if="req.type != 'get'" class="bb py-1">
                    请求数据类型:
                    <label class="form-inline">
                        <select class="form-select select-sm" v-model="req.paramsType">
                            <option v-for="(val,name) in CONTENT_TYPE" :value="val" :key="name">{{name}}</option>
                        </select>
                    </label>
                </div>
                <table class="table p-relative" v-if="req.type == 'get' || req.paramsType == FORM_CONTENT_TYPE">
                    <thead>
                        <tr>
                            <td class="p-sticky p_key p-1">Param Key</td>
                            <td class="p-sticky p_val p-1">Param Value</td>
                            <td class="p-sticky p_ops p-1"><button class="btn btn-link btn-sm" @click="addItem(reqParam.params)"><i class="icon icon-plus"></i> 添加</button></td>
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
                <textarea v-else class="form-input input-sm my-1" rows="5" v-model="req.body"></textarea>
            </div>
            <div v-else>
                <table class="table p-relative">
                    <thead>
                        <tr>
                            <td class="p-sticky p_key p-1">Header Key</td>
                            <td class="p-sticky p_val p-1">Header Value</td>
                            <td class="p-sticky p_ops p-1"><button class="btn btn-link btn-sm" @click="addItem(reqParam.headers)"><i class="icon icon-plus"></i> 添加</button></td>
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
        </div>
        <component :is="BatchEdit" v-if="batch.show" v-bind="batch" @saveEdit="saveBatchContent"></component>

        <component :is="Environment" v-if="env.show" @refreshEnv="refreshEnv"></component>

    </div>
</template>

<script>
import { ref, reactive, watchEffect, watch } from "vue";
import {
    cache,
    clone,
    mixin,
    parseArr,
    parseText,
    parseObject,
    parseQueryStr,
    parseFormData,
    addItem,
    checkArr
} from "../js/tools.js";
import { FORM_CONTENT_TYPE, CONTENT_TYPE, API_ENV } from "../js/const.js";
import BatchEdit from "./BatchEdit.vue";
import Environment from "./Environment.vue";

export default {
    props: {
        refresh: {
            type: Number,
            default: 0
        },
        req: {
            type: Object,
            default: {}
        },
        sendReq: {
            type: Function,
            default: () => {}
        }
    },
    setup(props, { emit }) {
        const emptyReq = () => {
            return {
                name: "",
                type: "get",
                url: "",
                headers: "",
                params: "",
                body: "",
                cookie: true,
                paramsType: FORM_CONTENT_TYPE,
                time: 0
            };
        };

        const req = reactive(mixin(emptyReq(), props.req));

        const tab = ref(0);

        const reqParam = reactive({
            headers: parseArr(req.headers),
            params:
                req.paramsType == FORM_CONTENT_TYPE
                    ? parseArr(req.params)
                    : addItem([])
        });

        const batch = reactive({ show: false, title: "", content: "" });

        const env = reactive({
            list: cache(API_ENV),
            curr: {},
            show: false
        });

        //刷新环境变量的方法
        const refreshEnv = () => {
            env.list = cache(API_ENV);
            env.curr = {};
            env.show = false;
        };

        //打开批量编辑组件的方法
        const openBatchEditor = () => {
            batch.title = "批量编辑请求" + (tab.value == 0 ? "参数" : "头");
            batch.content = parseText(
                reqParam[tab.value == 0 ? "params" : "headers"]
            );
            batch.show = true;
        };

        //批量编辑组件保存回调的方法
        const saveBatchContent = editor => {
            batch.show = false;
            if (editor.state) {
                reqParam[tab.value == 0 ? "params" : "headers"] = parseArr(
                    editor.content
                );
            }
        };

        //环境变量转换函数
        const parseEnv = val => {
            if (!env.curr.name) return val;
            if (typeof val == "string") {
                let reg = /\{\{([^}]+)\}\}/g;
                if (!reg.test(val) || !env.curr.items.length) return val;
                let envObj = parseObject(env.curr.items);
                return val.replace(reg, (g0, g1) => envObj[g1] || g0);
            }
        };

        //发送API请求的方法
        const sendReq = async () => {
            if (!req.url) {
                emit("sendReq", { resp: { error: "URL地址不能为空!" } });
            } else {
                req.params =
                    req.type == "get" || req.paramsType == FORM_CONTENT_TYPE
                        ? parseText(reqParam.params)
                        : "";
                req.headers = parseText(reqParam.headers);
                req.time = Date.now();
                let url = parseEnv(req.url);
                let headers = parseObject(reqParam.headers, parseEnv);
                let opts = {
                    method: req.type,
                    headers,
                    credentials: req.cookie ? "include" : "omit"
                };
                if (req.type == "get") {
                    let queryStr = parseQueryStr(reqParam.params, parseEnv);
                    url = !queryStr
                        ? url
                        : url + (url.indexOf("?") > 0 ? "&" : "?") + queryStr;
                } else {
                    let hasparam = false;
                    if (req.paramsType == FORM_CONTENT_TYPE) {
                        if (reqParam.params.filter(el => el.key).length) {
                            opts.body = parseFormData(
                                reqParam.params,
                                parseEnv
                            );
                            hasparam = true;
                        }
                    } else if (!!req.body) {
                        opts.body = parseEnv(req.body);
                        hasparam = true;
                    }
                    let ct = reqParam.headers.filter(
                        el => el.key.toLowerCase() == "content-type"
                    );
                    if (!ct.length && hasparam) {
                        headers["Content-Type"] = req.paramsType;
                    }
                }
                let success = true;
                if (!/^https?:\/\//i.test(url)) {
                    url = "http://" + url;
                }
                let resp = await fetch(url, opts).catch(ex => {
                    emit("sendReq", { resp: { error: ex.message }, req });
                    success = false;
                });
                if (success) {
                    emit("sendReq", { resp, req });
                }
            }
        };

        const resetRequest = () => {
            mixin(req, emptyReq());
            emit("sendReq", { resp: { error: " " } });
        };

        //监听数组 当数组被删除到没有了自动增加一行
        watchEffect(() => checkArr(reqParam.headers));
        watchEffect(() => checkArr(reqParam.params));
        //监听 props中的req,当父组件传入新的req时覆盖当前的配置
        watch(
            () => props.refresh,
            () => mixin(req, clone(props.req))
        );

        return {
            tab,
            req,
            emptyReq,
            mixin,
            env,
            addItem,
            reqParam,
            CONTENT_TYPE,
            FORM_CONTENT_TYPE,
            Environment,
            refreshEnv,
            BatchEdit,
            batch,
            openBatchEditor,
            saveBatchContent,
            sendReq,
            resetRequest
        };
    }
};
</script>
  
<style lang="scss" scoped>
.input-group{

    .reqname,
    .reqmethod {
        flex: none;
        width: 120px;
    }
}
.p_key {
    width: 20%;
}
.p_ops {
    width: 5%;
}
.bb {
    border-bottom: 0.05rem solid #dadee4;
}
.request-panel {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-flow: column;
}
.req-tab-content {
    flex: 1;
    overflow-y: auto;
}
</style>
  