<template>
  <dialog class="modal modal-open" @click="backgroundClick" @cancel.prevent>
    <div class="modal-box">
      <slot></slot>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

const emit = defineEmits(["closed"]);

onMounted(() => {
  const element = document.querySelector("#focus-prompt") as HTMLElement | null;
  element?.focus();
});

const backgroundClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.tagName === "DIALOG") {
    emit("closed");
  }
};
</script>
