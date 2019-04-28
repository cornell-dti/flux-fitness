<template>
  <div class="full">
    <div class="login middle">
      <div class="text">
        <h1>Flux Fitness</h1>
        <p>
          A simple webapp by the
          <a href="https://www.cornelldti.org/" target="_blank">DTI</a> Flux team
          to track people in gyms.
        </p>
        <p>Please log in with the username and password provided by DTI.</p>
      </div>
      <form>
        <div class="input">
          <i class="material-icons">email</i>
          <input v-model="username" type="text" name="username" required placeholder="Username">
        </div>
        <div class="input">
          <i class="material-icons">vpn_key</i>
          <input v-model="password" type="password" name="password" required placeholder="Password">
        </div>
        <div class="input">
          <i class="material-icons">location_on</i>
          <select v-model="gym" required>
            <option disabled value hidden>Select a gym</option>
            <option>Teagle</option>
            <option>Noyes</option>
            <option>Helen Newman</option>
            <option>Appel</option>
          </select>
          <i class="material-icons select-arrow">arrow_drop_down</i>
        </div>
      </form>
      <div id="error"></div>
      <div class="buttons">
        <button class="button" v-on:click="handler">LOGIN</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as firebase from "firebase";

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      gym: ""
    };
  },
  methods: {
    handler() {
      console.log("processing username and password");
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      if (this.gym != "") {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.username, this.password)
          .then(() => {
            console.log("success");
            this.$router.push({
              name: "home",
              component: "Home",
              params: { gym: this.gym }
            });
          })
          .catch(function(error) {
            console.log("error");
            var errorCode = error.code;
            var errorMessage = error.message;
            document.getElementById("error").innerHTML =
              "Please enter a valid login";
          });
      } else {
        document.getElementById("error").innerHTML = "Please select a gym";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

form {
  margin-top: 20px;
  text-align: left;
}

.text {
  padding-right: 30px;
}

.buttons {
  height: 50px;
  width: 100%;
  text-align: right;
}

.button {
  margin-right: 20px;
}

.material-icons {
  color: #000;
  font-size: 20px;
  vertical-align: middle;
}

.select-arrow {
  margin-left: -15px;
}

#error {
  text-align: center;
  margin-top: 20px;
  color: #fa4735;
}

select,
select option {
  color: #000;
  appearance: none;
  -webkit-appearance: none;
  margin-inline-start: 5%;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  padding: 10px 10px 10px 0px;
  border: none;
  border-bottom: 1px solid #000;
  max-width: 70%;
}

select:invalid,
select option[value=""] {
  color: #767676;
}

[hidden] {
  display: none;
}
</style>
