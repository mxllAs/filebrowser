<template>
  <div class="help">
    <h3 class="text-lg font-semibold">{{ $t("help.help") }}</h3>

    <ul class="py-4 space-y-1">
      <li><strong>F1</strong> - {{ $t("help.f1") }}</li>
      <li><strong>F2</strong> - {{ $t("help.f2") }}</li>
      <li><strong>DEL</strong> - {{ $t("help.del") }}</li>
      <li><strong>ESC</strong> - {{ $t("help.esc") }}</li>
      <li><strong>CTRL + S</strong> - {{ $t("help.ctrl.s") }}</li>
      <li><strong>CTRL + SHIFT + F</strong> - {{ $t("help.ctrl.f") }}</li>
      <li><strong>CTRL + Click</strong> - {{ $t("help.ctrl.click") }}</li>
      <li><strong>Click</strong> - {{ $t("help.click") }}</li>
      <li><strong>Double click</strong> - {{ $t("help.doubleClick") }}</li>
    </ul>

    <div class="modal-action">
      <button
        id="focus-prompt"
        type="submit"
        @click="closeHovers"
        class="btn btn-ghost btn-sm text-primary"
        :aria-label="$t('buttons.ok')"
        :title="$t('buttons.ok')"
        tabindex="1"
      >
        {{ $t("buttons.ok") }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useLayoutStore } from "@/stores/layout";

export default {
  name: "help",
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers"]),
  },
};
</script>
