<template>
  <div>
    <h3 class="text-lg font-semibold">{{ $t("prompts.replace") }}</h3>

    <p class="py-4">{{ $t("prompts.replaceMessage") }}</p>

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
        @click="currentPrompt.action"
        :aria-label="$t('buttons.continue')"
        :title="$t('buttons.continue')"
        tabindex="2"
      >
        {{ $t("buttons.continue") }}
      </button>
      <button
        id="focus-prompt"
        class="btn btn-ghost btn-sm text-error"
        @click="currentPrompt.confirm"
        :aria-label="$t('buttons.replace')"
        :title="$t('buttons.replace')"
        tabindex="1"
      >
        {{ $t("buttons.replace") }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useLayoutStore } from "@/stores/layout";

export default {
  name: "replace",
  computed: {
    ...mapState(useLayoutStore, ["currentPrompt"]),
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers"]),
  },
};
</script>
