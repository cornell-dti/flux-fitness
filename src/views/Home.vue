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
    <button v-on:click="handler">Submit</button> <br> 
    <button v-on:click="download">Download Gym Data</button>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import * as firebase from 'firebase';
import * as axios from 'axios'; 
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
    },
    download() {
      const url = 'https://us-central1-campus-density-backend.cloudfunctions.net/getData?id=teagle';
      axios.get(url, {mode: 'no-cors'})
      .then((res) => {
        console.log(res.data); 
        const storage = firebase.storage(); 
        const gsref = storage.refFromURL(`gs:/${res.data}/teagle.xlsx/`); 
        gsref.getDownloadURL().then(url => {
          window.open(url); 
          // const xhr = new XMLHttpRequest(); 
          // xhr.responseType = 'blob'; 
          // xhr.onload = function(event) {
          //   const blob = xhr.response; 
          // }
          // xhr.open('GET', url); 
          // xhr.send(); 
        })
      })
      .catch((err) => {
        console.log(err); 
      })

    }
  }
};
</script>

<style lang="scss">
</style>

