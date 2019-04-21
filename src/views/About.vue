<template>
  <div class="about">
    <h1>Please log in with the username and password provided by DTI</h1>
    <form action="">
    Username:<br>
    <input v-model='username' type="text" name="username">
    <br>
    Password:<br>
    <input v-model='password' type="password" name="password">
    </form>
    <br>
    <form>
      <input type="radio" name="gym" value="Teagle"> Teagle<br>
      <input type="radio" name="gym" value="Noyes"> Noyes<br>
      <input type="radio" name="gym" value="Helen Newman"> Helen Newman<br>
      <input type="radio" name="gym" value="Appel"> Appel
    </form>
    <br>
    <button v-on:click="handler">Log in</button>
  </div>
</template>

<script>
import * as firebase from 'firebase';

export default {
  name: "About",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    handler() {
      console.log("processing username and password")
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      firebase.auth().signInWithEmailAndPassword(this.username, this.password).then(() => {
        console.log("success")
        this.$router.push('/')
      }).catch(function(error) {
      console.log('error')
      var errorCode = error.code;
      var errorMessage = error.message;
    });
    }
  }
};
</script>

<style scoped>
.object .container .thing-a {
  background-color: blue;
}

.object .container .thing-b {
  background-color: red;
}
</style>

<style lang="scss" scoped>
$blue: #0f4363;

.object .container {
  .thing-a {
    background-color: $blue;
  }

  .thing-b {
    background-color: red;
  }
}
</style>
