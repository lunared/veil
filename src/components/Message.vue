<template>
    <div class="message">
        <label>
            <mark v-if="remote">stranger</mark>
            <i v-else>you</i>
        </label>
        <span>{{text}}</span>
    </div>
</template>

<script>
function scramble(text) {
    let out = "";
    const choice = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.!?, ";
    for (let i = 0; i < text.length; i++) {
        out += choice[Math.floor(Math.random()*choice.length)];
    }
    return out;
}

function descramble(text, goal, distance = 15, step = 0) {
    if (step > distance) {
        return goal;
    }

    let flip = goal.length / distance;
    let count = 0;
    let out = "";
    const choice = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.!?, ";
    for (let i = 0; i < text.length; i++) {
        if (text[i] != goal[i] && count < flip) {
            if (Math.random() > .5) {
                count++;
                out += goal[i];
            } else {
                out += choice[Math.floor(Math.random()*choice.length)];
            }
        } else {
            out += text[i];
        }
    }
    return out;
}

export default {
    name: 'Message',
    props: ['remote', 'content'],
    data() {
        return {
            text: "",
        };
    },
    mounted() {
        if (this.remote) {
            this.text = scramble(this.content);
            let step = 0;
            const id = setInterval(() => {
                this.text = descramble(this.text, this.content, 15, step++);
                if (this.text === this.content) {
                    clearInterval(id);
                }
            }, 50);
        } else {
            this.text = this.content;
        }
    },
};
</script>

<style scoped>
.message {
    flex: 1;
    display: flex;
    margin-bottom: 0.5rem;
}

.message:last-child > span::after {
    content: "█";
    -webkit-animation: 2s linear infinite condemned_blink_effect;
    animation: 2s linear infinite condemned_blink_effect;
    display: inline;
}

label {
    min-width: 100px;
    vertical-align: top;
    margin: 0;
}

span {
    flex: 1;
    overflow: hidden;
    white-space: normal;
    overflow-wrap: break-word;
    vertical-align: top;
}

@keyframes condemned_blink_effect {
    0% {
        visibility: hidden;
    }
    50% {
        visibility: hidden;
    }
    100% {
        visibility: visible;
    }
}

</style>
