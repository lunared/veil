<template>
    <figure id="profile">
        <figcaption>Welcome</figcaption>
        <!-- <label style="word-wrap: anywhere;">Your access token is {{token}}</label><br> -->
        <fieldset>
            <legend>Identify your model type</legend>
            <label><input name="gender" type="radio" v-model="profileGender" value="m" checked>M</label>
            <label><input name="gender" type="radio" v-model="profileGender" value="f">F</label>
            <label><input name="gender" type="radio" v-model="profileGender" value="x">X</label>
        </fieldset>
        <br>
        <fieldset>
            <legend>Identify compatibility</legend>
            <label><input type="checkbox" v-model="searchGender" value="m">M</label>
            <label><input type="checkbox" v-model="searchGender" value="f" checked>F</label>
            <label><input type="checkbox" v-model="searchGender" value="x">X</label>
        </fieldset>
        <fieldset v-if="!isVerified">
            <legend>Please verify your humanity</legend>
            <Captcha />
        </fieldset>
        <form v-else @submit.prevent="proceed">
          <button type="submit">Proceed</button>
        </form>
    </figure>
</template>

<script>
import Captcha from './Verify';
import { mapGetters } from 'vuex'; 

export default {
  components: {
    Captcha,
  },
  data() {
    return {
      profileGender: 'm',
      searchGender: ['f'],
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isVerified',
    ]),
  },
  methods: {
    proceed() {
      this.$store.commit('profile/setDetails', {
        gender: this.profileGender,
      });
      this.$store.commit('profile/setPreferences', {
        gender: [...this.searchGender],
      });
      this.$emit('proceed');
    }
  }
};
</script>

<style>

</style>
