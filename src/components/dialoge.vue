<template>
  <div id="dialoge">
    <iframe width="350" height="430" allow="microphone;" src="https://console.dialogflow.com/api-client/demo/embedded/c1603611-8396-42d4-8809-bb9ed3178372"></iframe>
    <div id="button">
        exit
    </div>
  </div>
</template>

<script>
import { onMounted } from '@vue/runtime-core'
export default {
    setup(){
        onMounted(()=>{
            console.log("dialoge")
        })
    }
}
</script>

<style scoped>
    #dialoge{
        position:absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.7);
        background-color: rgba(51, 51, 51,0.5);
    }
    #dialoge iframe{
        opacity: .7;
        position:absolute;
    }
    #dialoge #button{
        position: absolute;
        bottom: 20px;
        padding: 12px 6px;
        border: 1px solid rgb(255, 255, 255);
        border-radius: 4px;
        color: rgb(255, 255, 255);
        font: 1rem sans-serif;
        text-align: center;
        opacity: 0.5;
        cursor: pointer;
        width: 100px;
    }
    #dialoge #button:hover{
        transition: all .25s;
        opacity: 1;
        width: 102px;
    }
</style>