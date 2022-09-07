<template>
    <div id="container">
        <p>Loading items</p>
        <progress id="progress" max="100" value="0"></progress>
        <label id="label" for="progress">File progress:</label>
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
        color: #c2f4ee;
        position: absolute;
        font-size: 200%;
        background-color: rgba(51, 51, 51,0.5);
    }
    #label{
        font: .7rem sans-serif;
    }
    p{
        font: 3rem sans-serif;
    }
    progress {
        border-radius: .3rem;
        margin-bottom: 30px; 
        width: 50%;
        height: 3%;
    }
    progress::-webkit-progress-bar {
        background-color: rgba(51, 51, 51,0.5);
        border-radius: .3rem; 
    }
    progress::-webkit-progress-value {
        background-color: #74EBD5;
        background-image: linear-gradient(90deg, #74EBD5 0%, #9FACE6 100%);
        border-radius: .3rem; 
    }

</style>