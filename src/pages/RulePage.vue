<template>
  <TermsRule />
</template>

<script setup>
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import TermsRule from '@/components/templates/TermsRule.vue'

useFirebasePageView('view_rule', {})
</script>
