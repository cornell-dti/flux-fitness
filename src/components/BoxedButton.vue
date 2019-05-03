<template>
  <button class="boxed-button" v-on:click="$emit('click')">
    <i class="material-icons">{{materialIcon}}</i>
    {{buttonText}}
  </button>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component
export default class BoxedButton extends Vue {
  @Prop({
    default: "DOWNLOAD"
  })
  buttonText!: string;
  @Prop({
    default: "file_download"
  })
  materialIcon!: string;
}
</script>

<style lang="scss" scoped>
@import "../scss/variables";

.boxed-button {
  display: inline-block;
  padding: 7px 16px 7px 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border-width: 0;
  font-family: inherit;
  font-size: 16px;
  border-radius: 3.5px;
  background-color: $mainAccent;
  color: white;
  text-align: center;

  .material-icons {
    color: white;
    vertical-align: middle;
    font-size: 20px;
  }

  &:hover {
    background-color: $mainAccentFocus;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }

  &:disabled {
    color: white;
    background-color: $mainAccentDisable;

    &:hover {
      background-color: $mainAccentDisable;
    }
  }
}
</style>

