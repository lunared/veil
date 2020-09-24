<template>
    <div>
        <vue-recaptcha 
            sitekey="6LcGyM8ZAAAAABc8HtI7W-CYC8G_46SacoM7NVXW"
            :loadRecaptchaScript="true"
            @verify="exchange"
        >
        </vue-recaptcha>
    </div>
</template>

<script>
import * as axios from 'axios';
import VueRecaptcha from 'vue-recaptcha';

export default {
    components: { VueRecaptcha },
    methods: {
        async exchange(data) {
            console.log(data);

            // Do stuff with the received token.
            const { 
                data: {
                    token,
                } 
            } =  await axios.post(
                '/auth/token',
                {
                    'g-recaptcha-response': `${data}`,
                },
            );

            this.$emit('success', token);
        }
    }
}
</script>