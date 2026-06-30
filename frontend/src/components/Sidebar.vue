<template>
  <!-- Overlay only on mobile -->
  <div
    v-if="isMobile && active"
    @click="closeHovers"
    class="overlay sidebar-overlay"
  ></div>
  <nav :class="{ active }" class="sidebar-nav">
    <div
      class="bg-base-200/90 backdrop-blur-xl flex flex-col p-3 gap-0.5 h-full"
    >
      <template v-if="isLoggedIn">
        <button
          @click="toAccountSettings"
          class="btn btn-ghost justify-start w-full"
        >
          <i class="material-icons">person</i>
          <span>{{ user.username }}</span>
        </button>
        <button
          class="btn btn-ghost justify-start w-full"
          @click="toRoot"
          :aria-label="$t('sidebar.myFiles')"
          :title="$t('sidebar.myFiles')"
        >
          <i class="material-icons">folder</i>
          <span>{{ $t("sidebar.myFiles") }}</span>
        </button>

        <div v-if="user.perm.create" class="divider my-1"></div>
        <template v-if="user.perm.create">
          <button
            @click="showHover('newDir')"
            class="btn btn-ghost justify-start w-full"
            :aria-label="$t('sidebar.newFolder')"
            :title="$t('sidebar.newFolder')"
          >
            <i class="material-icons">create_new_folder</i>
            <span>{{ $t("sidebar.newFolder") }}</span>
          </button>
          <button
            @click="showHover('newFile')"
            class="btn btn-ghost justify-start w-full"
            :aria-label="$t('sidebar.newFile')"
            :title="$t('sidebar.newFile')"
          >
            <i class="material-icons">note_add</i>
            <span>{{ $t("sidebar.newFile") }}</span>
          </button>
        </template>

        <div v-if="user.perm.admin" class="divider my-1"></div>
        <button
          v-if="user.perm.admin"
          class="btn btn-ghost justify-start w-full"
          @click="toGlobalSettings"
          :aria-label="$t('sidebar.settings')"
          :title="$t('sidebar.settings')"
        >
          <i class="material-icons">settings_applications</i>
          <span>{{ $t("sidebar.settings") }}</span>
        </button>

        <div class="grow"></div>

        <button
          v-if="canLogout"
          @click="logout"
          class="btn btn-ghost justify-start w-full"
          id="logout"
          :aria-label="$t('sidebar.logout')"
          :title="$t('sidebar.logout')"
        >
          <i class="material-icons">exit_to_app</i>
          <span>{{ $t("sidebar.logout") }}</span>
        </button>
      </template>
      <template v-else>
        <router-link
          v-if="!hideLoginButton"
          class="btn btn-ghost justify-start w-full"
          to="/login"
          :aria-label="$t('sidebar.login')"
          :title="$t('sidebar.login')"
        >
          <i class="material-icons">exit_to_app</i>
          <span>{{ $t("sidebar.login") }}</span>
        </router-link>

        <router-link
          v-if="signup"
          class="btn btn-ghost justify-start w-full"
          to="/login"
          :aria-label="$t('sidebar.signup')"
          :title="$t('sidebar.signup')"
        >
          <i class="material-icons">person_add</i>
          <span>{{ $t("sidebar.signup") }}</span>
        </router-link>
      </template>

      <div v-if="isFiles && !disableUsedPercentage" class="px-2 mt-4 mb-1">
        <progress
          class="progress progress-primary w-full h-1"
          :value="usage.usedPercentage"
          max="100"
        ></progress>
        <p class="text-xs text-base-content/50 mt-1.5">
          {{ $t("sidebar.diskUsed", { used: usage.used, total: usage.total }) }}
        </p>
      </div>

      <p
        class="px-2 mt-auto pt-4 text-xs text-base-content/30 text-center leading-relaxed"
      >
        <span>
          <span v-if="disableExternal">File Browser</span>
          <a
            v-else
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/filebrowser/filebrowser"
            class="link link-hover"
            >File Browser</a
          >
          <span> {{ " " }} {{ version }}</span>
        </span>
        <br />
        <span>
          <a @click="help" class="link link-hover">{{ $t("sidebar.help") }}</a>
        </span>
      </p>
    </div>
  </nav>
</template>

<script>
import { reactive } from "vue";
import { mapActions, mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";

import * as auth from "@/utils/auth";
import {
  version,
  signup,
  hideLoginButton,
  disableExternal,
  disableUsedPercentage,
  noAuth,
  logoutPage,
  loginPage,
} from "@/utils/constants";
import { files as api } from "@/api";
import prettyBytes from "pretty-bytes";

const USAGE_DEFAULT = { used: "0 B", total: "0 B", usedPercentage: 0 };

export default {
  name: "sidebar",
  setup() {
    const usage = reactive(USAGE_DEFAULT);
    return { usage, usageAbortController: new AbortController() };
  },
  components: {},
  inject: ["$showError"],
  computed: {
    ...mapState(useAuthStore, ["user", "isLoggedIn"]),
    ...mapState(useFileStore, ["isFiles", "reload"]),
    ...mapState(useLayoutStore, ["currentPromptName"]),
    active() {
      return this.currentPromptName === "sidebar";
    },
    isMobile() {
      return window.innerWidth <= 736;
    },
    signup: () => signup,
    hideLoginButton: () => hideLoginButton,
    version: () => version,
    disableExternal: () => disableExternal,
    disableUsedPercentage: () => disableUsedPercentage,
    canLogout: () => !noAuth && (loginPage || logoutPage !== "/login"),
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers", "showHover"]),
    abortOngoingFetchUsage() {
      this.usageAbortController.abort();
    },
    async fetchUsage() {
      const path = this.$route.path.endsWith("/")
        ? this.$route.path
        : this.$route.path + "/";
      let usageStats = USAGE_DEFAULT;
      if (this.disableUsedPercentage) {
        return Object.assign(this.usage, usageStats);
      }
      try {
        this.abortOngoingFetchUsage();
        this.usageAbortController = new AbortController();
        const usage = await api.usage(path, this.usageAbortController.signal);
        usageStats = {
          used: prettyBytes(usage.used, { binary: true }),
          total: prettyBytes(usage.total, { binary: true }),
          usedPercentage: Math.round((usage.used / usage.total) * 100),
        };
      } finally {
        return Object.assign(this.usage, usageStats);
      }
    },
    toRoot() {
      this.$router.push({ path: "/files" });
      this.closeHovers();
    },
    toAccountSettings() {
      this.$router.push({ path: "/settings/profile" });
      this.closeHovers();
    },
    toGlobalSettings() {
      this.$router.push({ path: "/settings/global" });
      this.closeHovers();
    },
    help() {
      this.showHover("help");
    },
    logout: auth.logout,
  },
  watch: {
    $route: {
      handler(to) {
        if (to.path.includes("/files")) {
          this.fetchUsage();
        }
      },
      immediate: true,
    },
  },
  unmounted() {
    this.abortOngoingFetchUsage();
  },
};
</script>

<style scoped>
@media (max-width: 736px) {
  .sidebar-overlay {
    z-index: 99998;
  }
  .sidebar-nav {
    z-index: 99999;
    overflow-y: auto;
  }
}
</style>
