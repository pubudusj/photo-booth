import Vue from 'vue'
import App from './App.vue'
import WebCam from 'vue-web-cam'
import { BootstrapVue } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  WebCam,
  render: h => h(App),
}).$mount('#app')
