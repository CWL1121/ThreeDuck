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
<script setup>
  import { onMounted } from '@vue/runtime-core'
  import test from './utils/test.js'
  import cross from './components/crosshair.vue'
  components:{
    cross
  }
  onMounted(()=>{
    new test()
  })
</script>
