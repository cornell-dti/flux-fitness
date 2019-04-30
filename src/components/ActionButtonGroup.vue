<template>
  <div class="action-button-group">
    <button
      :hidden="active"
      class="action-button"
      id="submit"
      v-on:click="$emit('submitted')"
    >{{ actionButtonText }}</button>
    <button :hidden="!active" class="action-button" id="cancel" v-on:click="$emit('cancel')">CANCEL</button>
    <button
      :hidden="!active"
      class="action-button"
      id="confirm"
      v-on:click="$emit('confirm')"
    >CONFIRM</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component
export default class ActionButtonGroup extends Vue {
  @Prop({
    default: false
  })
  active!: boolean;
  @Prop({
    default: false
  })
  requireConfirmation!: boolean;
  @Prop({
    default: ""
  })
  actionButtonText!: string;
}
</script>

<style lang="scss" scoped>
@import "../scss/variables";

.action-button-group {
  margin-top: 20px;
  height: 50px;
  width: 100%;
  text-align: right;
}

.action-button {
  margin-right: 20px;
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

.action-button:hover {
  background-color: $buttonHover;
}

#cancel {
  margin-right: 10px;
}
</style>

