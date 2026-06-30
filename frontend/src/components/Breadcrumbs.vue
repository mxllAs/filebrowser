<template>
  <div
    class="breadcrumbs text-xs sticky top-12 z-20 bg-base-100 border-b border-base-300/50 px-3 py-1"
  >
    <ul>
      <li>
        <component
          :is="element"
          :to="base || ''"
          :aria-label="t('files.home')"
          :title="t('files.home')"
          class="inline-flex items-center gap-1 link link-hover"
        >
          <i class="material-icons text-base">home</i>
        </component>
      </li>

      <li v-for="(link, index) in items" :key="index">
        <component :is="element" :to="link.url" class="link link-hover">{{
          link.name
        }}</component>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();

const route = useRoute();

const props = defineProps<{
  base: string;
  noLink?: boolean;
}>();

const items = computed(() => {
  const relativePath = route.path.replace(props.base, "");
  const parts = relativePath.split("/");

  if (parts[0] === "") {
    parts.shift();
  }

  if (parts[parts.length - 1] === "") {
    parts.pop();
  }

  const breadcrumbs: BreadCrumb[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i === 0) {
      breadcrumbs.push({
        name: decodeURIComponent(parts[i]),
        url: props.base + "/" + parts[i] + "/",
      });
    } else {
      breadcrumbs.push({
        name: decodeURIComponent(parts[i]),
        url: breadcrumbs[i - 1].url + parts[i] + "/",
      });
    }
  }

  if (breadcrumbs.length > 3) {
    while (breadcrumbs.length !== 4) {
      breadcrumbs.shift();
    }

    breadcrumbs[0].name = "...";
  }

  return breadcrumbs;
});

const element = computed(() => {
  if (props.noLink) {
    return "span";
  }

  return "router-link";
});
</script>

<style></style>
