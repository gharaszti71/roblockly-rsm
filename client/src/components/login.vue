<template>
 <div class="login">
   <form class="login" @submit.prevent="login">
     <h1>Sign in</h1>
     <label>User name</label>
     <input required v-model="username" type="text" placeholder="Username"/>
     <label>Password</label>
     <input required v-model="password" type="password" placeholder="Password"/>
     <hr/>
     <button type="submit">Login</button>
   </form>
 </div>
</template>

<script>
import api from './../util/service'

export default {
    name: 'LoginForm',
    methods: {
        login: async function () {
          const { username, password } = this
          const token = await api.login(username, password)
          if (token) {
            this.$router.push('/')
          }
        }
    }
}
</script>

<style>
.login {
  margin-top: 2rem;
}
</style>