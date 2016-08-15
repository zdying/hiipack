<template>
  <p>Hello {{ name }}</p>
</template>

<script>
  module.exports = {
    data: function(){
      return {
        name: 'World'
      }
    },
    methods: {
      
    }
  }
</script>

<style>
  p{
    color: #69C;
  }
</style>