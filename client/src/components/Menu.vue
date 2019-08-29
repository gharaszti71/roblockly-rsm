<template>
<nav>
    <ul>
        <li><a href="#">Users</a></li>
        <li><a href="#">Sessions</a></li>
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
    background-color: orangered;
    height: minmax(auto, 2rem);
    grid-row: 2 / 3;
}

ul {
    margin-left: 1rem;
}

ul li {
  font-size: 1rem;
  list-style: none; 
  float: left; 
  display:block; 
  text-align: center;
  padding-right: 1rem;
  margin: 0.2rem 0;
}
</style>