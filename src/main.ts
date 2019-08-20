import Vue from 'vue';
import Element from 'element-ui';
import './index.styl';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue';

Vue.config.productionTip = false;

Vue.use(Element);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
