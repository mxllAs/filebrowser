<template>
  <div>
    <p class="py-4">{{ $t("prompts.discardEditorChanges") }}</p>

    <div class="modal-action">
      <button
        class="btn btn-ghost btn-sm"
        @click="closeHovers"
        :aria-label="$t('buttons.cancel')"
        :title="$t('buttons.cancel')"
        tabindex="3"
      >
        {{ $t("buttons.cancel") }}
      </button>
      <button
        class="btn btn-ghost btn-sm text-primary"
        @click="currentPrompt.saveAction"
        :aria-label="$t('buttons.saveChanges')"
        :title="$t('buttons.saveChanges')"
        tabindex="1"
      >
        {{ $t("buttons.saveChanges") }}
      </button>
      <button
        id="focus-prompt"
        @click="currentPrompt.confirm"
        class="btn btn-ghost btn-sm text-error"
        :aria-label="$t('buttons.discardChanges')"
        :title="$t('buttons.discardChanges')"
        tabindex="2"
      >
        {{ $t("buttons.discardChanges") }}
      </button>
    </div>
  </div>
</template>

<script>
import { useLayoutStore } from "@/stores/layout";
import { mapActions, mapState } from "pinia";

export default {
  name: "discardEditorChanges",
  computed: {
    ...mapState(useLayoutStore, ["currentPrompt"]),
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers"]),
  },
};
</script>
