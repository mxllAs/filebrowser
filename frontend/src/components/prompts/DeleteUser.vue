<template>
  <div>
    <p class="py-4">{{ t("prompts.deleteUser") }}</p>

    <div class="modal-action">
      <button
        id="focus-prompt"
        class="btn btn-ghost btn-sm"
        @click="layoutStore.closeHovers"
        :aria-label="t('buttons.cancel')"
        :title="t('buttons.cancel')"
        tabindex="1"
      >
        {{ t("buttons.cancel") }}
      </button>
      <button
        class="btn btn-ghost btn-sm text-primary"
        @click="layoutStore.currentPrompt?.confirm"
        tabindex="2"
      >
        {{ t("buttons.delete") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";
import { useI18n } from "vue-i18n";

const layoutStore = useLayoutStore();

const { t } = useI18n();

// const emit = defineEmits<{
//   (e: "confirm"): void;
// }>();
</script>
