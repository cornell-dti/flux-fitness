<template>
  <div class="full">
    <div class="middle">
      <slot/>
    </div>
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

  @media (max-width: 500px) {
    width: 80%;
    margin: 20% auto;
  }
}
</style>

