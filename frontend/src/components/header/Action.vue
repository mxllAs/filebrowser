<template>
  <button
    @click="action"
    :aria-label="label"
    :title="label"
    class="action btn btn-ghost btn-sm gap-1.5 h-auto min-h-0 px-2.5 py-1.5"
  >
    <i class="material-icons text-lg">{{ icon }}</i>
    <span class="hidden md:inline text-sm font-medium">{{ label }}</span>
    <span
      v-if="counter && counter > 0"
      class="badge badge-sm badge-primary ml-0.5"
      >{{ counter }}</span
    >
  </button>
</template>

<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";

const props = defineProps<{
  icon?: string;
  label?: string;
  counter?: number;
  show?: string;
}>();

const emit = defineEmits<{
  (e: "action"): any;
}>();

const layoutStore = useLayoutStore();

const action = () => {
  if (props.show) {
    layoutStore.showHover(props.show);
  }

  emit("action");
};
</script>
