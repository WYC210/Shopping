<template>
    <div class="not-found">
        <div class="container">
            <div class="item" id="pink">
                <div class="chewing">
                    <div class="eye left"><span></span></div>
                    <div class="eye right"><span></span></div>
                    <div class="mounth"></div>
                    <div class="arm left"></div>
                    <div class="arm right"></div>
                </div>
                <div class="shadow"></div>
            </div>
            <div class="item" id="orange">
                <div class="chewing">
                    <div class="eye left"><span></span></div>
                    <div class="eye right"><span></span></div>
                    <div class="mounth"></div>
                    <div class="arm left"></div>
                    <div class="arm right"></div>
                </div>
                <div class="shadow"></div>
            </div>
            <div class="item" id="blue">
                <div class="chewing">
                    <div class="eye left"><span></span></div>
                    <div class="eye right"><span></span></div>
                    <div class="mounth"></div>
                    <div class="arm left"></div>
                    <div class="arm right"></div>
                </div>
                <div class="shadow"></div>
            </div>
            <div class="text-container">
                <h1>404</h1>
                <p>哎呀...页面走丢了</p>
                <el-button @click="goHome" type="primary">返回首页</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = (): void => {
    router.push('/')
}
</script>

<style scoped>
.not-found {
    background: #3cb464;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    position: relative;
    width: 800px;
    height: 400px;
    margin-top: -250px;
}

.container div,
.container span {
    position: absolute;
}

.text-container {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: 90px;
    color: #fff;
    transform: translateY(100%);
}

.text-container h1 {
    font-size: 72px;
    margin: 0;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
}

.text-container p {
    font-size: 24px;
    margin: 0 0 25px;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
}

.text-container .el-button {
    background: transparent;
    border: 2px solid #fff;
    color: #fff;
    font-size: 18px;
    padding: 10px 30px;
    transition: all 0.3s ease;
}

.text-container .el-button:hover {
    background: #fff;
    color: #3cb464;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.item {
    width: 200px;
    height: 200px;
    bottom: 190px;
    left: 50%;
    margin-left: -50px;
    transform-origin: center bottom;
}

.item .chewing {
    width: 100px;
    height: 100px;
    bottom: 0;
    left: 50%;
    margin-left: -50px;
    box-shadow: inset 10px -6px 10px rgba(0, 0, 0, 0.1);
    border-radius: 50% 50% 50% 50%/60% 60% 40% 40%;
    animation: bounce 0.6s ease-in-out infinite;
}

.item .chewing .eye {
    background: #fff;
    border-radius: 50%;
    border-top: 2px solid #111;
}

.item .chewing .eye span {
    width: 4px;
    height: 4px;
    background: #232323;
    border-radius: 2px;
}

.item .chewing .eye.left {
    top: 30px;
    left: 20px;
    width: 30px;
    height: 29px;
    transform: rotate(-10deg);
}

.item .chewing .eye.left span {
    top: 14px;
    left: 15px;
}

.item .chewing .eye.right {
    top: 35px;
    right: 20px;
    width: 20px;
    height: 20px;
    transform: rotate(10deg);
}

.item .chewing .eye.right span {
    top: 9px;
    left: 7px;
}

.item .chewing .mounth {
    width: 16px;
    height: 4px;
    bottom: 20px;
    background: #fff;
    border-radius: 50% 50% 100% 100%;
}

.item .chewing .arm {
    width: 15px;
    height: 16px;
    bottom: 28px;
    border-radius: 7px;
    z-index: -1;
    animation: arm-bounce 0.7s ease-in infinite;
}

.item .chewing .arm.left {
    left: -13px;
    transform: rotate(-20deg);
}

.item .chewing .arm.right {
    right: -13px;
    transform: rotate(20deg);
}

.item .shadow {
    width: 70px;
    height: 10px;
    bottom: -10px;
    left: 0;
    right: 0;
    margin: auto;
    border-radius: 50%;
    background: #37a45b;
    box-shadow: 0 0 5px #37a45b;
    animation: shadow 0.7s ease-in-out infinite;
    animation-delay: 0.3s;
    opacity: 0.7;
}

.item#pink {
    left: 44%;
    z-index: 30;
    bottom: 210px;
}

.item#pink .chewing {
    background: #faa8d7;
}

.item#pink .mounth {
    left: 43px;
}

.item#pink .arm {
    background: #faa8d7;
}

.item#orange {
    left: 31%;
    z-index: 20;
    transform: scale(1.1);
    bottom: 200px;
}

.item#orange .chewing {
    background: #f0a524;
    animation-delay: 0.2s;
}

.item#orange .mounth {
    left: 37px;
    transform: rotate(5deg);
    animation: mounth 0.7s ease-in-out infinite;
}

.item#orange .arm {
    background: #f0a524;
}

.item#blue {
    left: 64%;
    z-index: 20;
    transform: scale(1.4);
    bottom: 220px;
}

.item#blue .chewing {
    background: royalblue;
    animation-delay: 0.4s;
}

.item#blue .mounth {
    left: 37px;
    width: 20px;
    height: 5px;
    transform: rotate(5deg);
    animation: mounth 0.7s ease-in-out infinite;
}

.item#blue .arm {
    background: royalblue;
}

@keyframes bounce {
    0% {
        bottom: 0;
    }

    65% {
        bottom: 8px;
    }

    100% {
        bottom: 0;
        border-radius: 49% 47% 42% 40%/60% 60% 40% 40%;
    }
}

@keyframes arm-bounce {

    0%,
    100% {
        bottom: 28px;
    }

    33% {
        bottom: 23px;
    }

    40% {
        transform: scale(0.8);
    }

    66% {
        transform: scale(1);
    }
}

@keyframes shadow {

    0%,
    100% {
        transform: scaleX(1);
    }

    50% {
        transform: scaleX(0.9);
    }
}

@keyframes mounth {

    0%,
    100% {
        height: 4px;
        border-radius: 50% 50% 100% 100%;
    }

    50% {
        height: 8px;
        bottom: 17px;
        border-radius: 30% 30% 100% 100%;
    }
}
</style>