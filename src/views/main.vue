<template>
    <cross/>
    <div id="blocker">
      <div id="instructions">
        <p>
          click me to start
        </p>
      </div>
    </div>
  </template>
  <script>
    import { reactive,onMounted } from '@vue/runtime-core'
    import test from '../utils/test.js'
    import cross from '../components/crosshair.vue'
    export default{
      components:{
        cross
      },
      setup(){
        let obj,pos
        onMounted(()=>{
          obj = reactive(new test())
          pos = reactive(obj.position)
          // console.log(pos)
        })
        return{
          obj,pos
        }
      }
    }
  </script>