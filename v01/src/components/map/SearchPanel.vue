<template>
    <div class="search-panel">
      <SearchComponent 
        :districts="districts"
        :centersByDistrict="centersByDistrict"
        :initialDistrict="initialDistrict"
        :initialCenter="initialCenter"
        @search="$emit('search', $event)"
        @select-hydrant="$emit('select-hydrant', $event)"
      />
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue'
  import SearchComponent from './map/SearchComponent.vue'
  
  export default defineComponent({
    name: 'SearchPanel',
    components: {
      SearchComponent
    },
    props: {
      districts: Array,
      centersByDistrict: Object,
      initialDistrict: String,
      initialCenter: String
    },
    emits: ['search', 'select-hydrant']
  })
  </script>
  
  <style scoped>
  .search-panel {
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-width: 300px;
  }
  </style>