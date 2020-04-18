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
                <label class="form-switch form-inline c-hand">
                    <input type="checkbox" v-model="wordwrap">
                    <i class="form-icon"></i> 自动换行
                </label>
                <button class="btn btn-link btn-sm" @click="tab.full = !tab.full;tab.hide = false">
                    <span v-if="tab.full"><i class="icon icon-resize-vert"></i> 恢复</span>
                    <span v-else><i class="icon icon-arrow-up"></i> 全屏</span>
                </button>
                <button class="btn btn-link btn-sm" @click="tab.hide = !tab.hide;tab.full = false">
                    <span v-if="tab.hide"><i class="icon icon-resize-vert"></i> 恢复</span>
                    <span v-else><i class="icon icon-arrow-down"></i> 收起</span>
                </button>
            </li>
        </ul>

        <div class="resp-tab-content ani" :class="{hide:tab.hide,full:tab.full}">
            <div v-if="tab.curr == 0">
                <pre class="code m-1 apihl"><code v-html="fullResp.resp" :class="{'wordwrap':wordwrap}"></code></pre>
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
                            <td class="p-1 text-primary">{{h.val}}</td>
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
                            <td class="p-1 text-break text-primary">{{cookie.name}}</td>
                            <td class="p-1 text-break text-primary">{{cookie.value}}</td>
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
import { ref, reactive, watch } from "vue";
import apihl from "../js/apihl.js";

export default {
    props: ["resp"],
    setup(props) {
        const tab = reactive({
            curr: 0,
            hide: false,
            full: false
        });
        const wordwrap = ref(true)
        const fullResp = reactive({ resp: "", headers: [], cookies: [] });

        const parseHTML = text =>
            text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        const parseRespData = resp => {
            if (resp.error) {
                fullResp.resp = resp.error;
            } else if (resp.status) {
                if (
                    resp.headers &&
                    resp.headers.get("Content-Type") &&
                    resp.headers
                        .get("Content-Type")
                        .indexOf("application/json") >= 0
                ) {
                    resp.json()
                        .then(
                            json =>
                                (fullResp.resp = apihl(
                                    JSON.stringify(json, null, 4)
                                ))
                        )
                        .catch(
                            ex =>
                                (fullResp.resp = resp.statusText || ex.message)
                        );
                } else {
                    resp.text()
                        .then(
                            text =>
                                (fullResp.resp =
                                    text.length < 30000
                                        ? apihl(text)
                                        : parseHTML(text))
                        )
                        .catch(
                            ex =>
                                (fullResp.resp = parseHTML(
                                    resp.statusText ||
                                        ex.message ||
                                        "请求失败,请打开Chrome开发者工具(F12)进行调试"
                                ))
                        );
                }
            }
        };

        watch(
            () => props.resp,
            resp => {
                tab.curr = 0;
                tab.hide = false;
                tab.full = false;
                fullResp.headers = [];
                if (!!resp.headers) {
                    resp.headers.forEach((val, key) =>
                        fullResp.headers.push({ key, val })
                    );
                }
                parseRespData(resp);
                //利用Chrome的扩展接口去获取Cookie
                if (!!resp.url && !!chrome && !!chrome.cookies) {
                    chrome.cookies.getAll(
                        { url: resp.url },
                        cookies => (fullResp.cookies = cookies)
                    );
                } else {
                    fullResp.cookies = [];
                }
                document
                    .querySelector(".resp-tab-content.ani")
                    .scrollTo({ top: 0, behavior: "smooth" });
            }
        );
        return {
            tab,
            wordwrap,
            parseRespData,
            fullResp
        };
    }
};
</script>
  
<style scoped>
.reqname,
.reqmethod {
    flex: none;
    width: 120px;
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
.resp-tab-content {
    height: 50vh;
    overflow-y: auto;
}
.resp-tab-content.hide {
    height: 0;
    overflow: hidden;
}
.resp-tab-content.full {
    height: calc(100vh - 62px);
    overflow-y: auto;
}
.cookie td {
    font-size: 0.5rem;
    padding: 0.2rem;
}
.code code {
    padding: 0.1rem 0.2rem;
    background: #f7f7f7;
}
.wordwrap{

    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>
    