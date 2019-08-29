<template>
 <div class="login">
   <form class="loginForm" @submit.prevent="login">
     <h1>Sign in</h1>
     <label>User name</label>
     <input required v-model="username" type="text" placeholder="Username"/>
     <label>Password</label>
     <input required v-model="password" type="password" placeholder="Password"/>
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
  height: calc(100vh - 30rem);
  padding-top: 5rem;
}
.loginForm {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loginForm > * {
  margin-bottom: 1rem;
}

h1 {
  padding-bottom: 5rem;
}
</style>