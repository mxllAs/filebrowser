<template>
  <div>
    <h3 class="text-lg font-semibold">{{ t("prompts.upload") }}</h3>

    <p class="py-4">{{ t("prompts.uploadMessage") }}</p>

    <div class="modal-action justify-center">
      <div class="flex gap-4">
        <div
          @click="uploadFile"
          @keypress.enter="uploadFile"
          class="action flex flex-col items-center cursor-pointer p-4 rounded-box border border-base-300 hover:bg-base-200 transition"
          id="focus-prompt"
          tabindex="1"
        >
          <i class="material-icons text-4xl text-primary">insert_drive_file</i>
          <div class="title text-lg font-semibold mt-2">
            {{ t("buttons.file") }}
          </div>
        </div>
        <div
          @click="uploadFolder"
          @keypress.enter="uploadFolder"
          class="action flex flex-col items-center cursor-pointer p-4 rounded-box border border-base-300 hover:bg-base-200 transition"
          tabindex="2"
        >
          <i class="material-icons text-4xl text-primary">folder</i>
          <div class="title text-lg font-semibold mt-2">
            {{ t("buttons.folder") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useLayoutStore } from "@/stores/layout";

import * as upload from "@/utils/upload";

const { t } = useI18n();
const route = useRoute();

const layoutStore = useLayoutStore();

// TODO: this is a copy of the same function in FileListing.vue
const uploadInput = async (event: Event) => {
  const files = (event.currentTarget as HTMLInputElement)?.files;
  if (files === null) return;

  const folder_upload = !!files[0].webkitRelativePath;

  const uploadFiles: UploadList = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = folder_upload ? file.webkitRelativePath : undefined;
    uploadFiles.push({
      file,
      name: file.name,
      size: file.size,
      isDir: false,
      fullPath,
    });
  }

  const path = route.path.endsWith("/") ? route.path : route.path + "/";

  const conflict = await upload.checkConflict(uploadFiles, path);

  if (conflict.length > 0) {
    layoutStore.showHover({
      prompt: "resolve-conflict",
      props: {
        conflict: conflict,
        isUploadAction: true,
      },
      confirm: (event: Event, result: Array<ConflictingResource>) => {
        event.preventDefault();
        layoutStore.closeHovers();
        for (let i = result.length - 1; i >= 0; i--) {
          const item = result[i];
          if (item.checked.length == 2) {
            continue;
          } else if (item.checked.length == 1 && item.checked[0] == "origin") {
            uploadFiles[item.index].overwrite = true;
          } else {
            uploadFiles.splice(item.index, 1);
          }
        }
        if (uploadFiles.length > 0) {
          upload.handleFiles(uploadFiles, path);
        }
      },
    });

    return;
  }

  upload.handleFiles(uploadFiles, path);
};

const openUpload = (isFolder: boolean) => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.webkitdirectory = isFolder;
  // TODO: call the function in FileListing.vue instead
  input.onchange = uploadInput;
  input.click();
};

const uploadFile = () => {
  openUpload(false);
};
const uploadFolder = () => {
  openUpload(true);
};
</script>
