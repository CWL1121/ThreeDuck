<template>
  <div id="cross">
    <div class="row"></div>
    <div class="cloum"></div>
  </div>
</template>

<script>
export default {
    name: 'crossHair'
}
</script>

<style scoped>
#cross{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}
.row{
    position:absolute;
    width: 10px;
    height: 2px;
    background-color: rgb(136, 220, 136);
}
.cloum{
    position:absolute;
    width: 2px;
    height: 10px;
    background-color: rgb(136, 220, 136);
}

#pos{
  align-self:flex-start;
	font-size: 30px;
  margin-left: -80%;
  background-color: rgba(51, 51, 51, 0.8);
}

</style>

