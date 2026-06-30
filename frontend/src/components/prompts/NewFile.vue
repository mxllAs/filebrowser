<template>
  <div>
    <h3 class="text-lg font-semibold">{{ t("prompts.newFile") }}</h3>

    <p class="py-4">{{ t("prompts.newFileMessage") }}</p>
    <input
      id="focus-prompt"
      class="input input-bordered w-full"
      type="text"
      @keyup.enter="submit"
      v-model.trim="name"
    />
    <CreateFilePath :name="name" />

    <div class="modal-action">
      <button
        class="btn btn-ghost btn-sm"
        @click="layoutStore.closeHovers"
        :aria-label="t('buttons.cancel')"
        :title="t('buttons.cancel')"
      >
        {{ t("buttons.cancel") }}
      </button>
      <button
        class="btn btn-ghost btn-sm text-primary"
        @click="submit"
        :aria-label="t('buttons.create')"
        :title="t('buttons.create')"
      >
        {{ t("buttons.create") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";
import CreateFilePath from "@/components/prompts/CreateFilePath.vue";

import { files as api } from "@/api";
import url from "@/utils/url";

const $showError = inject<IToastError>("$showError")!;

const fileStore = useFileStore();
const layoutStore = useLayoutStore();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const name = ref<string>("");

const submit = async (event: Event) => {
  event.preventDefault();
  if (name.value === "") return;

  // Build the path of the new directory.
  let uri = fileStore.isFiles ? route.path + "/" : "/";

  if (!fileStore.isListing) {
    uri = url.removeLastDir(uri) + "/";
  }

  uri += encodeURIComponent(name.value);
  uri = uri.replace("//", "/");

  try {
    await api.post(uri);
    router.push({ path: uri });
  } catch (e) {
    if (e instanceof Error) {
      $showError(e);
    }
  }

  layoutStore.closeHovers();
};
</script>
