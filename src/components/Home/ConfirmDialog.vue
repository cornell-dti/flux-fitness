<template>
  <v-dialog :value="value" max-width="350" @click:outside="exitDialog()">
    <v-card>
      <v-card-title>Please confirm</v-card-title>
      <v-card-text class="black--text">
        <v-row>
          <v-col>
            <div class="d-flex align-center">
              <v-icon left color="black">today</v-icon>
              <h4 class="body-2">{{ date }}</h4>
            </div>
            <div class="d-flex align-center mt-3">
              <v-icon left color="black">schedule</v-icon>
              <h4 class="body-2">{{ time }}</h4>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <h2>Cardio</h2>
            <p class="mt-2 body-1"><b>Total:</b> {{ cardioTotal }}</p>
          </v-col>
          <v-col>
            <p>Treadmills: {{ cardio.treadmills.count }}</p>
            <p>Ellipticals: {{ cardio.ellipticals.count }}</p>
            <p>Bikes: {{ cardio.bikes.count }}</p>
            <p>AMTs: {{ cardio.amts.count }}</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <h2>Weights</h2>
            <p class="mt-2 body-1"><b>Total:</b> {{ weightsTotal }}</p>
          </v-col>
          <v-col>
            <p>Power Racks: {{ weights.powerRacks.count }}</p>
            <p>Bench Press: {{ weights.benchPress.count }}</p>
            <p>Dumbbells: {{ weights.dumbbells.count }}</p>
            <p>Other: {{ weights.other.count }}</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h2 class="font-weight-regular">
              <b>{{ gymName }} Total:</b> {{ gymTotal }}
            </h2>
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
import moment from "moment";
import InputFields from "@/data/InputFields";

@Component({})
export default class ConfirmDialog extends Vue {
  @Prop({ default: false })
  readonly value!: boolean;

  @Prop()
  readonly weights!: InputFields;

  @Prop()
  readonly weightsTotal!: string;

  @Prop()
  readonly cardio!: InputFields;

  @Prop()
  readonly cardioTotal!: string;

  @Prop()
  readonly gymTotal!: string;

  @Prop({ default: new Date() })
  readonly dateTime!: Date;

  @Prop({ default: "Gym" })
  readonly gymName!: string;

  get date(): string {
    const date = moment(this.dateTime);
    return date.format("ddd MMM D, YYYY");
  }

  get time(): string {
    const time = moment(this.dateTime);
    return time.format("h:mm A");
  }

  exitDialog() {
    this.$emit("exit");
    this.$emit("input", false);
  }

  submit() {
    this.$emit("submit");
  }
}
</script>

<style lang="scss" scoped>
p {
  font-size: 16px;
}
</style>
