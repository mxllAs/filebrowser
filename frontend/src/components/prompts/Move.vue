<template>
  <div>
    <h3 class="text-lg font-semibold">{{ $t("prompts.move") }}</h3>

    <p class="py-4">{{ $t("prompts.moveMessage") }}</p>
    <file-list
      ref="fileList"
      @update:selected="(val) => (dest = val)"
      :exclude="excludedFolders"
      tabindex="1"
    />

    <div
      class="modal-action"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <template v-if="user.perm.create">
        <button
          class="btn btn-ghost btn-sm text-primary"
          @click="$refs.fileList.createDir()"
          :aria-label="$t('sidebar.newFolder')"
          :title="$t('sidebar.newFolder')"
          style="justify-self: left"
        >
          <span>{{ $t("sidebar.newFolder") }}</span>
        </button>
      </template>
      <div>
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
          id="focus-prompt"
          class="btn btn-ghost btn-sm text-primary"
          @click="move"
          :disabled="$route.path === dest"
          :aria-label="$t('buttons.move')"
          :title="$t('buttons.move')"
          tabindex="2"
        >
          {{ $t("buttons.move") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";
import { useAuthStore } from "@/stores/auth";
import FileList from "./FileList.vue";
import { files as api } from "@/api";
import buttons from "@/utils/buttons";
import * as upload from "@/utils/upload";
import { removePrefix } from "@/api/utils";

export default {
  name: "move",
  components: { FileList },
  data: function () {
    return {
      current: window.location.pathname,
      dest: null,
    };
  },
  inject: ["$showError"],
  computed: {
    ...mapState(useFileStore, ["req", "selected"]),
    ...mapState(useAuthStore, ["user"]),
    ...mapWritableState(useFileStore, ["reload", "preselect"]),
    excludedFolders() {
      return this.selected
        .filter((idx) => this.req.items[idx].isDir)
        .map((idx) => this.req.items[idx].url);
    },
  },
  methods: {
    ...mapActions(useLayoutStore, ["showHover", "closeHovers"]),
    move: async function (event) {
      event.preventDefault();
      const items = [];

      for (const item of this.selected) {
        items.push({
          from: this.req.items[item].url,
          to: this.dest + encodeURIComponent(this.req.items[item].name),
          name: this.req.items[item].name,
          size: this.req.items[item].size,
          isDir: this.req.items[item].isDir,
          modified: this.req.items[item].modified,
          overwrite: false,
          rename: false,
        });
      }

      const action = async (overwrite, rename) => {
        buttons.loading("move");

        await api
          .move(items, overwrite, rename)
          .then(() => {
            buttons.success("move");
            this.preselect = removePrefix(items[0].to);
            if (this.user.redirectAfterCopyMove)
              this.$router.push({ path: this.dest });
            else this.reload = true;
          })
          .catch((e) => {
            buttons.done("move");
            this.$showError(e);
          });
      };

      const conflict = await upload.checkConflict(items, this.dest, true);

      if (conflict.length > 0) {
        this.showHover({
          prompt: "resolve-conflict",
          props: {
            conflict: conflict,
            files: items,
          },
          confirm: (event, result) => {
            event.preventDefault();
            this.closeHovers();
            for (let i = result.length - 1; i >= 0; i--) {
              const item = result[i];
              if (item.checked.length == 2) {
                items[item.index].rename = true;
              } else if (
                item.checked.length == 1 &&
                item.checked[0] == "origin"
              ) {
                items[item.index].overwrite = true;
              } else {
                items.splice(item.index, 1);
              }
            }
            if (items.length > 0) {
              action();
            }
          },
        });

        return;
      }

      action(false, false);
    },
  },
};
</script>
