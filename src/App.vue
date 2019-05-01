<template>
  <div id="app">
    <router-view/>
    <notifications group="default_group" position="bottom right"/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: "Roboto", "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
}
</style>

