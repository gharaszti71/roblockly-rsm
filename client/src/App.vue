<template>
  <div id="app">
    <Head />
    <Menu v-if="isLoggedIn()" />
    <router-view></router-view>
    <Foot />
  </div>
</template>

<script>
import Head from './components/Head'
import Menu from './components/Menu'
import Foot from './components/Foot'
import api from './util/service'

export default {
  name: 'app',
  components: {
    Head,
    Menu,
    Foot
  },
  methods: {
    isLoggedIn: function() { 
      return api.isLoggedIn()
    }
  }
} 
</script>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: inherit; 
}

html {
  box-sizing: border-box;
  font-size: 62.5%; 
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1.6rem;
  text-align: center;
  color: #2c3e50;
}

#app {
  display: grid;
  grid-gap: 1rem;
  height: 100vh;
  row-gap: 0.5rem;
  grid-template-rows: 2rem auto minmax(20rem, 1fr) 2rem;
}
</style>
