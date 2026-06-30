<template>
  <div>
    <h3 class="text-lg font-semibold">{{ $t("prompts.rename") }}</h3>

    <p class="py-4">
      {{ $t("prompts.renameMessage") }} <code>{{ oldName }}</code
      >:
    </p>
    <input
      id="focus-prompt"
      class="input input-bordered w-full"
      type="text"
      @keyup.enter="submit"
      v-model.trim="name"
    />

    <div class="modal-action">
      <button
        class="btn btn-ghost btn-sm"
        @click="closeHovers"
        :aria-label="$t('buttons.cancel')"
        :title="$t('buttons.cancel')"
      >
        {{ $t("buttons.cancel") }}
      </button>
      <button
        @click="submit"
        class="btn btn-ghost btn-sm text-primary"
        type="submit"
        :aria-label="$t('buttons.rename')"
        :title="$t('buttons.rename')"
        :disabled="name === '' || name === oldName"
      >
        {{ $t("buttons.rename") }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";
import url from "@/utils/url";
import { files as api } from "@/api";
import { removePrefix } from "@/api/utils";

export default {
  name: "rename",
  data: function () {
    return {
      name: "",
    };
  },
  created() {
    this.name = this.oldName;
  },
  inject: ["$showError"],
  computed: {
    ...mapState(useFileStore, [
      "req",
      "selected",
      "selectedCount",
      "isListing",
    ]),
    ...mapWritableState(useFileStore, ["reload", "preselect"]),
    oldName() {
      if (!this.isListing) {
        return this.req.name;
      }

      if (this.selectedCount === 0 || this.selectedCount > 1) {
        // This shouldn't happen.
        return "";
      }

      return this.req.items[this.selected[0]].name;
    },
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers"]),
    cancel: function () {
      this.closeHovers();
    },
    submit: async function () {
      if (this.name === "" || this.name === this.oldName) {
        return;
      }
      let oldLink = "";
      let newLink = "";

      if (!this.isListing) {
        oldLink = this.req.url;
      } else {
        oldLink = this.req.items[this.selected[0]].url;
      }

      newLink =
        url.removeLastDir(oldLink) + "/" + encodeURIComponent(this.name);

      try {
        await api.move([{ from: oldLink, to: newLink }]);
        if (!this.isListing) {
          this.$router.push({ path: newLink });
          return;
        }

        this.preselect = removePrefix(newLink);

        this.reload = true;
      } catch (e) {
        this.$showError(e);
      }

      this.closeHovers();
    },
  },
};
</script>
