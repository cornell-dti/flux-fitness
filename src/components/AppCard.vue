<template>
  <div class="full">
    <v-container class="middle">
      <slot />
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class AppCard extends Vue {}
</script>

<style lang="scss" scoped>
.full {
  position: fixed;
  overflow: scroll;
  min-height: 100vh;
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

  @media (max-width: 500px) {
    width: 80%;
    margin: 20% auto;
  }
}
</style>

