<template>
    <div id="container">
        <label for="file">File progress:</label>
        <progress id="progress" max="100" value="0"></progress>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
    #container{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-radius: 5%;
        color: #fcfcfc;
        position: absolute;
        font-size: 200%;
    }
    lable{

    }
    #progress::-webkit-progress-bar{
        border-radius: .3rem;
        background-color: #fcfcfc;
    }

</style>