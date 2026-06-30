<template>
  <div>
    <p class="py-4">{{ $t("prompts.deleteMessageShare", { path: "" }) }}</p>

    <div class="modal-action">
      <button
        @click="closeHovers"
        class="btn btn-ghost btn-sm"
        :aria-label="$t('buttons.cancel')"
        :title="$t('buttons.cancel')"
        tabindex="2"
      >
        {{ $t("buttons.cancel") }}
      </button>
      <button
        id="focus-prompt"
        @click="submit"
        class="btn btn-ghost btn-sm text-error"
        :aria-label="$t('buttons.delete')"
        :title="$t('buttons.delete')"
        tabindex="1"
      >
        {{ $t("buttons.delete") }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useLayoutStore } from "@/stores/layout";

export default {
  name: "share-delete",
  computed: {
    ...mapState(useLayoutStore, ["currentPrompt"]),
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers"]),
    submit: function () {
      this.currentPrompt?.confirm();
    },
  },
};
</script>
