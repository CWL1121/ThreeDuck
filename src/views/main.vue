<template>
  <div>

  </div>
    <!-- <cross/>
    <dialoge/>
    <progressBar/> -->
    <!-- <div id="blocker">
      <div id="instructions">
        <p>
          click me to start
        </p>
      </div>
    </div> -->
  </template>
  <script>
    import { reactive,onMounted } from '@vue/runtime-core'
    import test from '../utils/test.js'
    import cross from '../components/crosshair.vue'
    import dialoge from '../components/dialoge.vue'
    import progressBar from '../components/progress.vue'
    export default{
      components:{
        cross,dialoge,progressBar
      },
      setup(){
        let obj,pos
        onMounted(()=>{
          obj = reactive(new test())
        })
        return{
          obj,pos
        }
      }
    }
  </script>