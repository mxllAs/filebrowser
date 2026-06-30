<template>
  <div id="download">
    <h3 class="text-lg font-semibold">{{ t("prompts.download") }}</h3>

    <p class="py-4">{{ t("prompts.downloadMessage") }}</p>

    <div class="flex flex-col gap-2">
      <button
        id="focus-prompt"
        v-for="(ext, format) in formats"
        :key="format"
        class="btn btn-block"
        @click="layoutStore.currentPrompt?.confirm(format)"
      >
        {{ ext }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLayoutStore } from "@/stores/layout";

const layoutStore = useLayoutStore();

const { t } = useI18n();

const formats = {
  zip: "zip",
  tar: "tar",
  targz: "tar.gz",
  tarbz2: "tar.bz2",
  tarxz: "tar.xz",
  tarlz4: "tar.lz4",
  tarsz: "tar.sz",
  tarbr: "tar.br",
  tarzst: "tar.zst",
};
</script>
