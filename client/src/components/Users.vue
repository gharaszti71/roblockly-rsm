<template>
    <div class="users">
        <p>users</p>
    </div>
</template>

<script>
export default {
    name: 'users'
}
</script>

<style lang="scss">
.users {
  grid-row: 3 / 4;
  height: calc(100vh - 11rem);

  &--1 {
      background-color: orangered;
  }
}
</style>