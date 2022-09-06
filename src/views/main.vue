<template>
    <cross/>
    <dialoge/>
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
    import dialoge from '../components/dialoge.vue'
    export default{
      components:{
        cross,dialoge
      },
      setup(){
        let obj,pos
        onMounted(()=>{
          obj = reactive(new test())
          pos = reactive(obj.position)
        })
        return{
          obj,pos
        }
      }
    }
  </script>