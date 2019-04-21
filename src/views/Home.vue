<template>
  <div class="home">
    <button v-on:click="sign_out_handler">Sign Out</button>
    <br>
    <img alt="Vue logo" src="../assets/logo.png">
    <br>
    <h1>Please indicate how many people are currently in the gym.</h1>
    <input v-model="text" type="number">
    <br>
    <p>You indicated that {{text}} people are in the gym. Press submit if this is correct.</p>
    <br>
    <button v-on:click="handler">Submit</button>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import * as firebase from 'firebase';
// import "firebase/auth";

export default {
  name: "home",
  data() {
    return {
      text: ""
    };
  },
  components: {
    HelloWorld
  }, 
  methods: {
    handler () {
      if (this.text){
        
        var db = firebase.firestore()
        let current_gym = 'teagle'
        var addDoc = db.collection('gymdata').doc(current_gym).collection('counts').add({
          count: Number.parseInt(this.text),
          time: new Date
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        console.log(this.text)
      }
      else {
        window.alert("You didn't enter a value!");
      }
    },
    sign_out_handler() {
      firebase.auth().signOut().then(() => {
        console.log('signed out')
        // TODO add a procedure to redirect back to login just in case (this is already handled in router but be safe)
      })
    }
  }
};
</script>

<style lang="scss">
</style>

