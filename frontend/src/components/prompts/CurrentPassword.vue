<template>
  <div>
    <h3 class="text-lg font-semibold">{{ $t("prompts.currentPassword") }}</h3>

    <p class="py-4">{{ $t("prompts.currentPasswordMessage") }}</p>
    <input
      id="focus-prompt"
      class="input input-bordered w-full"
      type="password"
      @keyup.enter="submit"
      v-model="password"
    />

    <div class="modal-action">
      <button
        class="btn btn-ghost btn-sm"
        @click="cancel"
        :aria-label="$t('buttons.cancel')"
        :title="$t('buttons.cancel')"
      >
        {{ $t("buttons.cancel") }}
      </button>
      <button
        @click="submit"
        class="btn btn-ghost btn-sm text-primary"
        type="submit"
        :aria-label="$t('buttons.ok')"
        :title="$t('buttons.ok')"
      >
        {{ $t("buttons.ok") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLayoutStore } from "@/stores/layout";
const layoutStore = useLayoutStore();

const { currentPrompt } = layoutStore;

const password = ref("");

const submit = (event: Event) => {
  currentPrompt?.confirm(event, password.value);
};

const cancel = () => {
  layoutStore.closeHovers();
};
</script>
