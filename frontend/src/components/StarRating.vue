<template>
  <div class="flex items-center gap-2">
    <div class="flex gap-1">
      <button
        v-for="star in 5"
        :key="star"
        @click="!readonly && handleClick(star)"
        @mouseenter="!readonly && handleHover(star)"
        @mouseleave="!readonly && handleHover(0)"
        :disabled="readonly"
        :class="[
          'transition-transform duration-200',
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        ]"
      >
        <StarIcon
          :class="[
            'transition-colors duration-200',
            star <= (hoveredStar || modelValue)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300',
            `w-${size} h-${size}`
          ]"
        />
      </button>
    </div>
    <span v-if="showValue" class="text-lg font-semibold text-gray-700">
      {{ modelValue.toFixed(1) }}
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { StarIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 6  // Tailwind size (w-6 h-6 = 24px)
  },
  readonly: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const hoveredStar = ref(0)

const handleClick = (star) => {
  emit('update:modelValue', star)
}

const handleHover = (star) => {
  hoveredStar.value = star
}
</script>