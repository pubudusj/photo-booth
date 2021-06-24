<template>
  <div class="container">
    <div class="row">
      <div v-show="!img" class="col-md-12">
        <h2>Serverless PhotoBooth</h2>
        <div class="row">
          <div>
            <vue-web-cam
              ref="webcam"
              :device-id="deviceId"
              @started="onStarted"
              @stopped="onStopped"
              @error="onError"
              @cameras="onCameras"
              @camera-change="onCameraChange"
            />
          </div>
          <div>
            <select v-model="camera" class="">
              <option>-- Select Device --</option>
              <option
                v-for="device in devices"
                :key="device.deviceId"
                :value="device.deviceId"
                >{{ device.label }}</option
              >
            </select>
          </div>
          <div class="col-md-12">
            <button type="button" class="btn btn-primary" @click="onCapture">
              Capture Photo
            </button>
          </div>
        </div>
      </div>
      <div v-if="img" class="col-md-12">
        <h2>Captured Image</h2>
        <figure class="figure">
          <img :src="img" class="img-responsive" />
        </figure>
        <div>
          <input type="text" class="txt" v-model="userEmail" />
          <button type="button" class="btn btn-primary" @click="submitForm">
            Submit
          </button>
          <button type="button" class="btn btn-primary" @click="cancelCaptured">
            Cancel
          </button>
        </div>
      </div>
      <div v-if="message && !img" :class="'alert alert-' + message.type">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script>
import { WebCam } from "vue-web-cam";
import axios from "axios";

export default {
  name: "Home",
  components: {
    "vue-web-cam": WebCam,
  },
  data() {
    return {
      img: null,
      camera: null,
      deviceId: null,
      devices: [],
      userEmail: "",
      message: null,
    };
  },
  computed: {
    device: function() {
      return this.devices.find((n) => n.deviceId === this.deviceId);
    },
  },
  watch: {
    camera: function(id) {
      this.deviceId = id;
    },
    devices: function() {
      // Once we have a list select the first one
      const [first] = this.devices;

      if (first) {
        this.camera = first.deviceId;
        this.deviceId = first.deviceId;
      }
    },
  },
  methods: {
    onCapture() {
      this.img = this.$refs.webcam.capture();
    },
    onStarted(stream) {
      console.log("On Started Event", stream);
    },
    onStopped(stream) {
      console.log("On Stopped Event", stream);
    },
    onStop() {
      this.$refs.webcam.stop();
    },
    onStart() {
      this.$refs.webcam.start();
    },
    onError(error) {
      console.log("On Error Event", error);
    },
    onCameras(cameras) {
      this.devices = cameras;
      console.log("On Cameras Event", cameras);
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
      console.log("On Camera Change Event", deviceId);
    },
    uploadImage(image, userEmail) {
      let self = this;
      this.generatePresignedUrl(userEmail)
        .then(function(data) {
          let targetUrl = data.data.url;
          let buf = Buffer.from(
            image.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );
          axios
            .put(targetUrl, buf, {
              headers: {
                "Content-Type": "multipart/form-data",
                "x-amz-meta-user": userEmail,
              },
            })
            .then(function() {
              self.message = {
                text: "Successfully submitted",
                type: "success",
              };
              self.resetForm();
            })
            .catch(function(e) {
              console.log(e);
              self.resetForm();
            });
        })
        .catch(function(e) {
          console.log(e);
          this.resetForm();
        });
    },
    async generatePresignedUrl(userEmail) {
      return axios.post(process.env.VUE_APP_GENERATE_URL + "/upload", {
        email: userEmail,
      });
    },
    submitForm() {
      this.uploadImage(this.img, this.userEmail);
    },
    resetForm() {
      this.img = null;
      this.userEmail = "";
    },
    cancelCaptured() {
      this.resetForm();
    },
  },
};
</script>

<style scoped>
.btn {
  margin: 2px;
}
</style>
