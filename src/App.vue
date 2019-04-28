<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
$mainAccent: #039be5;
$mainAccentFocus: #1976d2;
$altAccent: #87e9ba;
$altAccentFocus: #7ae4b3;
$buttonHover: #f0f0f0;

html,
body {
  padding: 0;
  margin: 0;
}

#app {
  font-family: Roboto, "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.full {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background: #767676;
}

.middle {
  padding: 20px 0px 0 30px;
  background: white;
  width: 400px;
  margin: 5% auto;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (max-width: 500px) {
  .middle {
    width: 80%;
    margin: 20% auto;
  }
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.button {
  width: 100px;
  padding: 7px 10px;
  border-width: 0;
  font-family: inherit;
  font-size: 16px;
  font-weight: bold;
  color: $mainAccent;
  border-radius: 3.5px;
  background-color: white;
}

.button:hover {
  background-color: $buttonHover;
}

.button-boxed {
  width: 100px;
  // margin: 100;
  padding: 7px 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border-width: 0;
  font-family: inherit;
  font-size: 16px;
  border-radius: 3.5px;
  background-color: $altAccent;
}

.button-boxed:hover {
  background-color: $altAccentFocus;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

input {
  max-width: 70%;
  margin-bottom: 15px;
  font-size: 16px;
  padding: 10px 10px 10px 5px;
  border: none;
  border-bottom: 1px solid #000;
  margin-inline-start: 5%;
}

.input {
  white-space: nowrap;
}
</style>
