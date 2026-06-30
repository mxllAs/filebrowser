<template>
  <component
    :is="isListView ? 'tr' : 'div'"
    class="item group transition-colors cursor-pointer user-select-none"
    :class="[
      isListView
        ? isSelected
          ? 'bg-primary text-primary-content hover:bg-primary/90'
          : 'hover:bg-base-200'
        : isMosaicGallery
          ? 'card image-full h-48'
          : 'card card-compact bg-base-100 shadow-sm border border-base-200 hover:shadow-md',
      {
        'ring-2 ring-primary ring-offset-2 ring-offset-base-100':
          !isListView && isSelected,
      },
    ]"
    role="button"
    tabindex="0"
    :draggable="isDraggable"
    @dragstart="dragStart"
    @dragover="dragOver"
    @drop="drop"
    @click="itemClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    @touchmove="handleTouchMove"
    :data-dir="isDir"
    :data-type="type"
    :aria-label="name"
    :aria-selected="isSelected"
    :data-ext="getExtension(name).toLowerCase()"
    @contextmenu="contextMenu"
  >
    <!-- List View Rendering -->
    <template v-if="isListView">
      <td class="w-1/2">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <img
              v-if="!readOnly && type === 'image' && isThumbsEnabled"
              v-lazy="thumbnailUrl"
              class="w-full h-full object-cover rounded"
            />
            <i
              v-else
              class="material-icons text-2xl"
              :class="
                isSelected
                  ? 'text-primary-content'
                  : isDir
                    ? 'text-primary'
                    : 'text-base-content/50'
              "
        ></i>
          </div>
          <span class="truncate font-medium">{{ name }}</span>
        </div>
      </td>
      <td class="w-1/4">
        <span
          v-if="isDir"
          class="text-base-content/50"
          :class="{ 'text-primary-content/70': isSelected }"
          >&mdash;</span
        >
        <span
          v-else
          class="text-sm text-base-content/70"
          :class="{ 'text-primary-content/80': isSelected }"
          >{{ humanSize() }}</span
        >
      </td>
      <td class="w-1/4">
        <time
          class="text-sm text-base-content/70"
          :class="{ 'text-primary-content/80': isSelected }"
          :datetime="modified"
          >{{ humanTime() }}</time
        >
      </td>
    </template>

    <!-- Mosaic (Grid) View Rendering -->
    <template v-else-if="!isMosaicGallery">
      <figure
        class="px-4 pt-4 pb-0 flex items-center justify-center h-32 bg-base-200/50"
      >
        <img
          v-if="!readOnly && type === 'image' && isThumbsEnabled"
          v-lazy="thumbnailUrl"
          class="w-full h-full object-cover rounded-box"
        />
        <i
          v-else
          class="material-icons text-6xl"
          :class="isDir ? 'text-primary' : 'text-base-content/30'"
        ></i>
      </figure>
      <div class="card-body p-3 gap-0">
        <h3
          class="card-title text-sm font-medium leading-tight truncate block w-full"
          :title="name"
        >
          {{ name }}
        </h3>
        <div class="flex justify-between items-center mt-1 opacity-70 text-xs">
          <span v-if="isDir">&mdash;</span>
          <span v-else>{{ humanSize() }}</span>
          <time :datetime="modified">{{ humanTime() }}</time>
        </div>
      </div>
    </template>

    <!-- Mosaic Gallery View Rendering -->
    <template v-else>
      <figure class="h-full w-full">
        <img
          v-if="!readOnly && type === 'image' && isThumbsEnabled"
          v-lazy="thumbnailUrl"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-base-200 flex items-center justify-center"
        >
          <i
            class="material-icons text-7xl"
            :class="isDir ? 'text-primary' : 'text-base-content/30'"
          ></i>
        </div>
      </figure>
      <div
        class="card-body justify-end p-4 bg-gradient-to-t from-black/80 to-transparent text-white"
      >
        <h3
          class="card-title text-sm font-medium truncate block w-full"
          :title="name"
        >
          {{ name }}
        </h3>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";

import { enableThumbs } from "@/utils/constants";
import { filesize } from "@/utils";
import dayjs from "dayjs";
import { files as api } from "@/api";
import * as upload from "@/utils/upload";
import { computed, inject, ref } from "vue";
import { useRouter } from "vue-router";

const touches = ref<number>(0);

const longPressTimer = ref<number | null>(null);
const longPressTriggered = ref<boolean>(false);
const longPressDelay = ref<number>(500);
const startPosition = ref<{ x: number; y: number } | null>(null);
const moveThreshold = ref<number>(10);

const $showError = inject<IToastError>("$showError")!;
const router = useRouter();

const props = defineProps<{
  name: string;
  isDir: boolean;
  url: string;
  type: string;
  size: number;
  modified: string;
  index: number;
  readOnly?: boolean;
  path?: string;
}>();

const authStore = useAuthStore();
const fileStore = useFileStore();
const layoutStore = useLayoutStore();

const singleClick = computed(
  () => !props.readOnly && authStore.user?.singleClick
);

const isListView = computed(
  () => (authStore.user?.viewMode ?? "list") === "list"
);
const isMosaicGallery = computed(
  () => authStore.user?.viewMode === "mosaic gallery"
);
const isSelected = computed(
  () => fileStore.selected.indexOf(props.index) !== -1
);
const isDraggable = computed(
  () => !props.readOnly && authStore.user?.perm.rename
);

const canDrop = computed(() => {
  if (!props.isDir || props.readOnly) return false;

  for (const i of fileStore.selected) {
    if (fileStore.req?.items[i].url === props.url) {
      return false;
    }
  }

  return true;
});

const thumbnailUrl = computed(() => {
  const file = {
    path: props.path,
    modified: props.modified,
  };

  return api.getPreviewURL(file as Resource, "thumb");
});

const isThumbsEnabled = computed(() => {
  return enableThumbs;
});

const humanSize = () => {
  return props.type == "invalid_link" ? "invalid link" : filesize(props.size);
};

const humanTime = () => {
  if (!props.readOnly && authStore.user?.dateFormat) {
    return dayjs(props.modified).format("L LT");
  }
  return dayjs(props.modified).fromNow();
};

const dragStart = () => {
  if (fileStore.selectedCount === 0) {
    fileStore.selected.push(props.index);
    return;
  }

  if (!isSelected.value) {
    fileStore.selected = [];
    fileStore.selected.push(props.index);
  }
};

const dragOver = (event: Event) => {
  if (!canDrop.value) return;

  event.preventDefault();
  let el = event.target as HTMLElement | null;
  if (el !== null) {
    for (let i = 0; i < 5; i++) {
      if (!el?.classList.contains("item")) {
        el = el?.parentElement ?? null;
      }
    }

    if (el !== null) el.style.opacity = "1";
  }
};

const drop = async (event: Event) => {
  if (!canDrop.value) return;
  event.preventDefault();

  if (fileStore.selectedCount === 0) return;

  let el = event.target as HTMLElement | null;
  for (let i = 0; i < 5; i++) {
    if (el !== null && !el.classList.contains("item")) {
      el = el.parentElement;
    }
  }

  const items: any[] = [];

  for (const i of fileStore.selected) {
    if (fileStore.req) {
      items.push({
        from: fileStore.req?.items[i].url,
        to: props.url + encodeURIComponent(fileStore.req?.items[i].name),
        name: fileStore.req?.items[i].name,
        size: fileStore.req?.items[i].size,
        isDir: fileStore.req?.items[i].isDir,
        modified: fileStore.req?.items[i].modified,
        overwrite: false,
        rename: false,
      });
    }
  }

  // Get url from ListingItem instance
  if (el === null) {
    return;
  }
  const path = el.__vue__.url;

  const action = (overwrite?: boolean, rename?: boolean) => {
    const action =
      (event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey
        ? api.copy
        : api.move;
    action(items, overwrite, rename)
      .then(() => {
        fileStore.reload = true;
      })
      .catch($showError);
  };

  const conflict = await upload.checkConflict(items, path, true);

  if (conflict.length > 0) {
    layoutStore.showHover({
      prompt: "resolve-conflict",
      props: {
        conflict: conflict,
      },
      confirm: (event: Event, result: Array<ConflictingResource>) => {
        event.preventDefault();
        layoutStore.closeHovers();
        for (let i = result.length - 1; i >= 0; i--) {
          const item = result[i];
          if (item.checked.length == 2) {
            items[item.index].rename = true;
          } else if (item.checked.length == 1 && item.checked[0] == "origin") {
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
};

const itemClick = (event: Event | KeyboardEvent) => {
  // If long press was triggered, prevent normal click behavior
  if (longPressTriggered.value) {
    longPressTriggered.value = false;
    return;
  }

  if (
    singleClick.value &&
    !(event as KeyboardEvent).ctrlKey &&
    !(event as KeyboardEvent).metaKey &&
    !(event as KeyboardEvent).shiftKey &&
    !fileStore.multiple
  )
    open();
  else click(event);
};

const contextMenu = (event: MouseEvent) => {
  event.preventDefault();
  if (
    fileStore.selected.length === 0 ||
    event.ctrlKey ||
    fileStore.selected.indexOf(props.index) === -1
  ) {
    click(event);
  }
};

const click = (event: Event | KeyboardEvent) => {
  if (!singleClick.value && fileStore.selectedCount !== 0)
    event.preventDefault();

  setTimeout(() => {
    touches.value = 0;
  }, 300);

  touches.value++;
  if (touches.value > 1) {
    open();
  }

  if (fileStore.selected.indexOf(props.index) !== -1) {
    if (
      (event as KeyboardEvent).ctrlKey ||
      (event as KeyboardEvent).metaKey ||
      fileStore.multiple
    ) {
      fileStore.removeSelected(props.index);
    } else {
      fileStore.selected = [props.index];
    }
    return;
  }

  if ((event as KeyboardEvent).shiftKey && fileStore.selected.length > 0) {
    let fi = 0;
    let la = 0;

    if (props.index > fileStore.selected[0]) {
      fi = fileStore.selected[0] + 1;
      la = props.index;
    } else {
      fi = props.index;
      la = fileStore.selected[0] - 1;
    }

    for (; fi <= la; fi++) {
      if (fileStore.selected.indexOf(fi) == -1) {
        fileStore.selected.push(fi);
      }
    }

    return;
  }

  if (
    !(event as KeyboardEvent).ctrlKey &&
    !(event as KeyboardEvent).metaKey &&
    !fileStore.multiple
  ) {
    fileStore.selected = [];
  }
  fileStore.selected.push(props.index);
};

const open = () => {
  router.push({ path: props.url });
};

const getExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return fileName;
  }
  return fileName.substring(lastDotIndex);
};

// Long-press helper functions
const startLongPress = (clientX: number, clientY: number) => {
  startPosition.value = { x: clientX, y: clientY };
  longPressTimer.value = window.setTimeout(() => {
    handleLongPress();
  }, longPressDelay.value);
};

const cancelLongPress = () => {
  if (longPressTimer.value !== null) {
    window.clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
  startPosition.value = null;
};

const handleLongPress = () => {
  if (singleClick.value) {
    longPressTriggered.value = true;
    click(new Event("longpress"));
  }
  cancelLongPress();
};

const checkMovement = (clientX: number, clientY: number): boolean => {
  if (!startPosition.value) return false;

  const deltaX = Math.abs(clientX - startPosition.value.x);
  const deltaY = Math.abs(clientY - startPosition.value.y);

  return deltaX > moveThreshold.value || deltaY > moveThreshold.value;
};

// Event handlers
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    startLongPress(event.clientX, event.clientY);
  }
};

const handleMouseUp = () => {
  cancelLongPress();
};

const handleMouseLeave = () => {
  cancelLongPress();
};

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    startLongPress(touch.clientX, touch.clientY);
  }
};

const handleTouchEnd = () => {
  cancelLongPress();
};

const handleTouchCancel = () => {
  cancelLongPress();
};

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 1 && startPosition.value) {
    const touch = event.touches[0];
    if (checkMovement(touch.clientX, touch.clientY)) {
      cancelLongPress();
    }
  }
};
</script>
