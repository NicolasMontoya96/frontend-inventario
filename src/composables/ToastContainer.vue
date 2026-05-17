<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col space-y-3 w-full max-w-sm pointer-events-none">
    <transition-group 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center p-4 rounded-xl shadow-lg border bg-white max-w-md transition-all duration-300"
        :class="{
          'border-l-4 border-l-green-500 border-gray-100': toast.type === 'success',
          'border-l-4 border-l-red-500 border-gray-100': toast.type === 'error',
          'border-l-4 border-l-amber-500 border-gray-100': toast.type === 'warning'
        }"
      >
        <span class="text-xl mr-3">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️' }}
        </span>

        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-800">{{ toast.message }}</p>
        </div>

        <button @click="removeToast(toast.id)" class="ml-4 text-gray-400 hover:text-gray-600 text-lg font-bold leading-none">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'
const { toasts, removeToast } = useToast()
</script>