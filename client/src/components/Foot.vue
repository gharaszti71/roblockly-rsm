<template>
<footer>
    <p class="copyright">
        &copy; Copyright 2019 by Gabor Haraszti. This is a master thesis project, feel free to use this for your own purposes.
    </p>
</footer>
</template>

<script>
export default {
    name: 'foot'
}
</script>

<style>
footer {
    background-color:#101d2c;
    grid-row: 4 / 5;
    height: 2rem;
}

.copyright {
    font-size: 0.6rem;
    color: #aaa;
    margin-top: 0.5rem;
    margin-right: auto;
    margin-left: auto;
    text-align: center;
    width: 70%;
}
</style>