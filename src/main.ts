import {createApp} from "vue";
import App from "@/App.vue";
import "primevue/resources/themes/nano/theme.css";
import "primevue/resources/primevue.min.css";
import "primeflex/primeflex.css"
import {createStore} from "vuex";
import { reactive } from "vue";

// @ts-ignore
const store = createStore({
    state: reactive({
        issues: {}
    }),
    mutations: {
        // @ts-ignore
        addIssues: (state, data) => state.issues = data
    },
    getters: {
        issues: (state) => state.issues
    }
});
createApp(App)
    .use(store)
    .mount('#app')
