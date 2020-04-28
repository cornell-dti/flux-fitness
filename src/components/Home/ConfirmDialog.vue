<template>
  <v-dialog :value="value" max-width="500" @click:outside="exitDialog()">
    <v-card>
      <v-card-title>Please confirm</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <h4>Apr 28 2020 | 16:07</h4>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="5">
            <h2>Cardio</h2>
            <p><b>Total:</b> 0</p>
          </v-col>
          <v-col>
            <p>Treadmills: 0</p>
            <p>Ellipticals: 0</p>
            <p>Bikes: 0</p>
            <p>AMTs: 0</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="5">
            <h2>Weights</h2>
            <p><b>Total:</b> 0</p>
          </v-col>
          <v-col>
            <p>Power Racks: 0</p>
            <p>Benchpress: 0</p>
            <p>Dumbbells: 0</p>
            <p>Other: 0</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="5">
            <h2>Total</h2>
          </v-col>
          <v-col>
            <p>Noyes: 0</p>
          </v-col>
        </v-row>
      </v-card-text>
      <!-- <v-card-text>{{ confirm }}</v-card-text> -->
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="exitDialog()">Edit</v-btn>
        <v-btn
          text
          color="green"
          @click="
            exitDialog();
            submit();
          "
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import InputFields from "@/data/InputFields";

@Component({})
export default class ConfirmDialog extends Vue {
  @Prop({ default: false })
  readonly value!: boolean;

  @Prop({ default: "Confirm" })
  readonly confirm!: string;

  @Prop()
  readonly weights!: InputFields;

  @Prop()
  readonly cardio!: InputFields;

  exitDialog() {
    this.$emit("input", false);
  }

  submit() {
    this.$emit("submit");
  }
}
</script>
