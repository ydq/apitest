<template>
    <div class="modal active">
        <a class="modal-overlay"></a>
        <div class="modal-container p-2">
            <div class="modal-header p-2">
                <div class="modal-title h5">{{title}}</div>
            </div>
            <div class="modal-body p-2">
                <div class="content">
                    <textarea class="form-input input-sm" rows="8" v-model="content" placeholder="key:value"></textarea>
                </div>
            </div>
            <div class="modal-footer p-2">
                <div class="btn-group">
                    <button class="btn btn-primary" @click="save">确 定</button>
                    <button class="btn" @click="cancel">取 消</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ref } from "vue";
import { FORM_CONTENT_TYPE, CONTENT_TYPE } from "../js/const.js";

export default {
    props: {
        title: {
            type: String,
            default: ""
        },
        content: {
            type: String,
            default: ""
        }
    },
    setup(props, { emit }) {
        const title = ref(props.title);
        const content = ref(props.content);
        const save = () => {
            emit("saveEdit", { state: true, content: content.value });
        };
        const cancel = () => {
            emit("saveEdit", { state: false });
        };
        return {
            title,
            content,
            save,
            cancel
        };
    }
};
</script>