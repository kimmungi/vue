<template>
    <div class="modal fade" id="suggestionModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">건의사항</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <textarea class="form-control" v-model="suggestion" rows="5" placeholder="건의사항을 입력해주세요"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
            <button type="button" class="btn btn-primary" @click="submitSuggestion">제출</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SuggestionModal',
    data() {
      return {
        suggestion: ''
      }
    },
    methods: {
      submitSuggestion() {
        this.$emit('submit-suggestion', this.suggestion)
        this.suggestion = ''
        // 모달을 닫습니다.
        if (typeof bootstrap !== 'undefined') {
          bootstrap.Modal.getInstance(document.getElementById('suggestionModal')).hide()
        }
      }
    }
  }
  </script>