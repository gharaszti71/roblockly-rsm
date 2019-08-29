<template>
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/useradmin">Users</a></li>
        <li><a href="/sessionadmin">Sessions</a></li>
        <li><a href="#" @click="logout">Logout</a></li>
    </ul>
</nav>
</template>

<script>
import api from '../util/service'

export default {
    name: 'menu',
    methods: {
        logout: function() {
            api.logout()
            this.$router.push('/login')
        }
    }
}
</script>

<style>
nav {
    background-color: #eeee;
    height: minmax(auto, 3rem);
    grid-row: 2 / 3;
}

ul {
    margin-left: 1rem;
}

ul li {
  font-size: 2rem;
  list-style: none; 
  float: left; 
  display:block; 
  text-align: center;
  padding-right: 1rem;
  margin: 0.2rem 0;
}
</style>