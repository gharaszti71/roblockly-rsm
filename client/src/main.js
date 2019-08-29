import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueRouter from 'vue-router'
import api from './util/service'
import Home from './components/Home.vue'
import LoginForm from './components/login.vue'
import HelloWorld from './components/HelloWorld'
import Users from './components/Users.vue'

// axios felkonfigurálása
// Ha már  be vagyunk jelentkezve, akkor a token-t mellékelni kell a header-ben!
axios.interceptors.request.use(
  (config) => {
      const token = sessionStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config;
  },
  (error) => {
      return Promise.reject(error)
  }
)

Vue.use(VueRouter)

const routes = [
  { name: 'home', path: '/', component: Home },
  { name: 'login', path: '/login', component: LoginForm },
  { name: 'hello', path: '/helloworld', component: HelloWorld },
  { name: 'useradmin', path: '/useradmin', component: Users },
  { name: 'sessionadmin', path: '/sessionadmin', component: Home },
]

const router = new VueRouter({routes})

// Guard
router.beforeEach((to, from, next) => {
  if (api.isLoggedIn() || to.path == '/login') {
    next()
  } else {
    next('/login')
  }
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
