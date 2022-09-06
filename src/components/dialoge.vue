<template>
  <div id="dialoge">
    <iframe width="350" height="430" allow="microphone;" src="https://console.dialogflow.com/api-client/demo/embedded/c1603611-8396-42d4-8809-bb9ed3178372"></iframe>
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
        color: white;
    }
    #dialoge iframe{
        position:absolute;
    }
</style>