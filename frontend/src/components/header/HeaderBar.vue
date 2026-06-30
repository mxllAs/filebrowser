<template>
  <header
    class="navbar bg-base-100/85 backdrop-blur-xl border-b border-base-300/50 sticky top-0 z-30 px-4 h-12 min-h-0"
  >
    <div class="navbar-start gap-2">
      <img v-if="showLogo" :src="logoURL" class="h-7" />
      <span v-if="showMenu" class="md:hidden">
        <Action
          icon="menu"
          :label="t('buttons.toggleSidebar')"
          @action="layoutStore.showHover('sidebar')"
        />
      </span>
    </div>

    <div class="flex-1 px-4">
      <slot />
    </div>

    <div class="navbar-end gap-0.5">
      <div class="hidden md:flex gap-0.5">
        <slot name="actions" />
      </div>

      <div
        v-if="ifActionsSlot"
        class="dropdown dropdown-end"
        :class="{ 'dropdown-open': layoutStore.currentPromptName === 'more' }"
      >
        <Action
          icon="more_vert"
          :label="t('buttons.more')"
          @action="layoutStore.showHover('more')"
        />
        <div
          class="dropdown-content menu menu-sm bg-base-200 rounded-box w-52 shadow mt-2 z-50 p-2 md:hidden"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div
      class="overlay"
      v-show="layoutStore.currentPromptName == 'more'"
      @click="layoutStore.closeHovers"
    />
  </header>
</template>

<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";

import { logoURL } from "@/utils/constants";

import Action from "@/components/header/Action.vue";
import { computed, useSlots } from "vue";
import { useI18n } from "vue-i18n";

defineProps<{
  showLogo?: boolean;
  showMenu?: boolean;
}>();

const layoutStore = useLayoutStore();
const slots = useSlots();

const { t } = useI18n();

const ifActionsSlot = computed(() => (slots.actions ? true : false));
</script>

<style></style>
