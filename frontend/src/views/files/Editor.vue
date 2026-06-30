<template>
  <div id="editor-container" class="bg-base-100">
    <header-bar>
      <action icon="close" :label="t('buttons.close')" @action="close()" />
      <title>{{ fileStore.req?.name ?? "" }}</title>

      <action
        icon="add"
        @action="increaseFontSize"
        :label="t('buttons.increaseFontSize')"
      />
      <span class="mx-2 text-sm font-medium text-base-content/80 select-none"
        >{{ fontSize }}px</span
      >
      <action
        icon="remove"
        @action="decreaseFontSize"
        :label="t('buttons.decreaseFontSize')"
      />

      <action
        v-if="authStore.user?.perm.modify"
        id="save-button"
        icon="save"
        :label="t('buttons.save')"
        @action="save()"
      />

      <action
        icon="preview"
        :label="t('buttons.preview')"
        @action="preview()"
        v-show="isMarkdownFile"
      />
    </header-bar>

    <div
      class="loading delayed z-50 flex items-center justify-center bg-base-100/60 backdrop-blur-md absolute inset-0 transition-all duration-300"
      v-if="layoutStore.loading"
    >
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <!-- Modern Toolbar -->
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-base-300/50 bg-base-100/95 backdrop-blur-xl z-20 w-full shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-base-200/50 rounded-lg text-base-content/70">
            <i class="material-icons text-[1.1rem]">edit_document</i>
          </div>
          <Breadcrumbs
            base="/files"
            noLink
            class="text-sm font-semibold tracking-wide text-base-content/90"
          />
        </div>

        <div class="flex items-center gap-3">
          <!-- Action Buttons Group -->
          <div
            class="join bg-base-200/40 p-1 rounded-xl shadow-sm border border-base-300/40 backdrop-blur-sm"
          >
            <button
              class="btn btn-sm btn-ghost join-item hover:bg-base-100 hover:shadow-sm hover:text-primary transition-all duration-200 ease-out"
              :class="{ 'opacity-40 cursor-not-allowed': isSelectionEmpty }"
              :disabled="isSelectionEmpty"
              @click="executeEditorCommand('copy')"
              title="Copy"
            >
              <i class="material-icons text-[1.1rem]">content_copy</i>
            </button>
            <button
              class="btn btn-sm btn-ghost join-item hover:bg-base-100 hover:shadow-sm hover:text-primary transition-all duration-200 ease-out"
              :class="{ 'opacity-40 cursor-not-allowed': isSelectionEmpty }"
              :disabled="isSelectionEmpty"
              @click="executeEditorCommand('cut')"
              title="Cut"
            >
              <i class="material-icons text-[1.1rem]">content_cut</i>
            </button>
            <button
              class="btn btn-sm btn-ghost join-item hover:bg-base-100 hover:shadow-sm hover:text-primary transition-all duration-200 ease-out"
              @click="executeEditorCommand('paste')"
              title="Paste"
            >
              <i class="material-icons text-[1.1rem]">content_paste</i>
            </button>
          </div>

          <div class="w-[1px] h-6 bg-base-300/80 mx-1 rounded-full"></div>

          <!-- Settings Dropdown / Command Palette -->
          <button
            class="btn btn-sm btn-ghost btn-circle hover:bg-base-200 hover:text-primary transition-colors"
            @click="executeEditorCommand('openCommandPalette')"
            title="Command Palette"
          >
            <i class="material-icons text-[1.2rem]">more_vert</i>
          </button>
        </div>
      </div>

      <!-- Main Editor/Preview Area -->
      <div class="flex flex-1 w-full h-full overflow-hidden bg-base-200/20">
        <!-- Left: Ace Editor -->
        <form
          id="editor"
          class="flex-1 min-w-0 bg-base-100 shadow-[inset_-1px_0_10px_rgba(0,0,0,0.02)]"
          @mouseenter="hoveredPane = 'editor'"
        ></form>

        <!-- Divider -->
        <div
          class="w-1 bg-gradient-to-b from-base-200 via-base-300/50 to-base-200 z-10 cursor-col-resize hover:bg-primary/30 transition-colors"
          v-show="isPreview && isMarkdownFile"
        ></div>

        <!-- Right: Beautiful Markdown Preview -->
        <div
          v-show="isPreview && isMarkdownFile"
          ref="previewScrollContainer"
          class="flex-1 min-w-0 overflow-y-auto bg-base-100 shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)]"
          @mouseenter="hoveredPane = 'preview'"
          @scroll="onPreviewScroll"
        >
          <div
            id="preview-container"
            class="prose prose-sm md:prose-base lg:prose-lg max-w-4xl mx-auto py-8 px-6 lg:py-12 prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:decoration-primary/30 hover:prose-a:decoration-primary prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-base-300/50 prose-pre:text-base-content prose-pre:backdrop-blur-md prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg transition-all duration-300"
            v-html="previewContent"
          ></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { files as api } from "@/api";
import buttons from "@/utils/buttons";
import url from "@/utils/url";
import ace, { Ace, version as ace_version } from "ace-builds";
import "ace-builds/src-noconflict/ext-language_tools";
import modelist from "ace-builds/src-noconflict/ext-modelist";
import DOMPurify from "dompurify";

import Breadcrumbs from "@/components/Breadcrumbs.vue";
import Action from "@/components/header/Action.vue";
import HeaderBar from "@/components/header/HeaderBar.vue";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";
import { getEditorTheme } from "@/utils/theme";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import {
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watchEffect,
  computed,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { read, copy } from "@/utils/clipboard";

const $showError = inject<IToastError>("$showError")!;

const fileStore = useFileStore();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const editor = ref<Ace.Editor | null>(null);
const fontSize = ref(parseInt(localStorage.getItem("editorFontSize") || "14"));

const isPreview = ref(false);
const previewContent = ref("");
const hoveredPane = ref<string | null>(null);
const previewScrollContainer = ref<HTMLElement | null>(null);

const isMarkdownFile = computed(() => {
  return (
    fileStore.req?.name.endsWith(".md") ||
    fileStore.req?.name.endsWith(".markdown")
  );
});

watch(
  isMarkdownFile,
  (isMd) => {
    if (isMd) {
      isPreview.value = true;
    }
  },
  { immediate: true }
);

const katexOptions = {
  output: "mathml" as const,
  throwOnError: false,
};
marked.use(markedKatex(katexOptions));

const isSelectionEmpty = ref(true);

const onPreviewScroll = (e: Event) => {
  if (hoveredPane.value !== "preview" || !editor.value) return;
  const el = e.target as HTMLElement;
  const maxPreviewScroll = el.scrollHeight - el.clientHeight;
  if (maxPreviewScroll <= 0) return;

  const scrollRatio = el.scrollTop / maxPreviewScroll;
  const renderer = editor.value.renderer;
  const maxEditorScroll =
    editor.value.session.getScreenLength() * renderer.lineHeight -
    (renderer as any).$size.scrollerHeight;

  if (maxEditorScroll > 0) {
    editor.value.session.setScrollTop(scrollRatio * maxEditorScroll);
  }
};

const updatePreview = async () => {
  if (!isMarkdownFile.value || !isPreview.value) return;
  const new_value = editor.value?.getValue() || "";
  try {
    previewContent.value = DOMPurify.sanitize(await marked(new_value));
  } catch (error) {
    console.error("Failed to convert content to HTML:", error);
    previewContent.value = "";
  }
};

const executeEditorCommand = (name: string) => {
  if (name == "paste") {
    read()
      .then((data) => {
        editor.value?.execCommand("paste", {
          text: data,
        });
      })
      .catch((e) => {
        if (
          document.queryCommandSupported &&
          document.queryCommandSupported("paste")
        ) {
          document.execCommand("paste");
        } else {
          console.warn("the clipboard api is not supported", e);
        }
      });
    return;
  }
  if (name == "copy" || name == "cut") {
    const selectedText = editor.value?.getCopyText();
    copy({ text: selectedText });
  }
  editor.value?.execCommand(name);
};

onMounted(() => {
  window.addEventListener("keydown", keyEvent);
  window.addEventListener("beforeunload", handlePageChange);

  const fileContent = fileStore.req?.content || "";

  watchEffect(() => {
    if (isPreview.value) {
      updatePreview();
    }
    setTimeout(() => {
      editor.value?.resize();
    }, 50);
  });

  ace.config.set(
    "basePath",
    `https://cdn.jsdelivr.net/npm/ace-builds@${ace_version}/src-min-noconflict/`
  );

  if (!layoutStore.loading) {
    initEditor(fileContent);
  } else {
    const unwatch = watchEffect(() => {
      // Initialize editor when layout is loaded
      if (!layoutStore.loading) {
        setTimeout(() => {
          initEditor(fileContent);
          unwatch();
        }, 50);
      }
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", keyEvent);
  window.removeEventListener("beforeunload", handlePageChange);
  editor.value?.destroy();
});

onBeforeRouteUpdate((to, from, next) => {
  if (editor.value?.session.getUndoManager().isClean()) {
    next();

    return;
  }

  layoutStore.showHover({
    prompt: "discardEditorChanges",
    confirm: (event: Event) => {
      event.preventDefault();
      next();
    },
    saveAction: async () => {
      await save();
      next();
    },
  });
});

const initEditor = (fileContent: string) => {
  editor.value = ace.edit("editor", {
    value: fileContent,
    showPrintMargin: false,
    readOnly: fileStore.req?.type === "textImmutable",
    theme: getEditorTheme(authStore.user?.aceEditorTheme ?? ""),
    mode: modelist.getModeForPath(fileStore.req!.name).mode,
    wrap: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  });

  editor.value.setFontSize(fontSize.value);
  editor.value.focus();

  const selection = editor.value?.getSelection();
  selection.on("changeSelection", function () {
    isSelectionEmpty.value = selection.isEmpty();
  });

  editor.value.session.on("change", () => {
    if (isMarkdownFile.value && isPreview.value) {
      updatePreview();
    }
  });

  editor.value.session.on("changeScrollTop", (scrollTop: number) => {
    if (
      hoveredPane.value !== "editor" ||
      !previewScrollContainer.value ||
      !editor.value
    )
      return;

    const renderer = editor.value.renderer;
    const maxEditorScroll =
      editor.value.session.getScreenLength() * renderer.lineHeight -
      (renderer as any).$size.scrollerHeight;

    if (maxEditorScroll <= 0) return;

    const scrollRatio = scrollTop / maxEditorScroll;
    const el = previewScrollContainer.value;
    const maxPreviewScroll = el.scrollHeight - el.clientHeight;

    el.scrollTop = scrollRatio * maxPreviewScroll;
  });
};

const keyEvent = (event: KeyboardEvent) => {
  if (event.code === "Escape") {
    close();
  }

  if (!event.ctrlKey && !event.metaKey) {
    return;
  }

  if (event.key !== "s") {
    return;
  }

  event.preventDefault();
  save();
};

const handlePageChange = (event: BeforeUnloadEvent) => {
  if (!editor.value?.session.getUndoManager().isClean()) {
    event.preventDefault();
    // returnValue is now depecrated, though keeping in for legacy browser support
    // https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent/returnValue
    event.returnValue = true;
  }
};

const save = async (throwError?: boolean) => {
  const button = "save";
  buttons.loading("save");

  try {
    await api.put(route.path, editor.value?.getValue());
    editor.value?.session.getUndoManager().markClean();
    buttons.success(button);
  } catch (e: any) {
    buttons.done(button);
    $showError(e);
    if (throwError) throw e;
  }
};

const increaseFontSize = () => {
  fontSize.value += 1;
  editor.value?.setFontSize(fontSize.value);
  localStorage.setItem("editorFontSize", fontSize.value.toString());
};

const decreaseFontSize = () => {
  if (fontSize.value > 1) {
    fontSize.value -= 1;
    editor.value?.setFontSize(fontSize.value);
    localStorage.setItem("editorFontSize", fontSize.value.toString());
  }
};

const close = () => {
  if (!editor.value?.session.getUndoManager().isClean()) {
    layoutStore.showHover({
      prompt: "discardEditorChanges",
      confirm: (event: Event) => {
        event.preventDefault();
        editor.value?.session.getUndoManager().reset();
        finishClose();
      },
      saveAction: async () => {
        try {
          await save(true);
          finishClose();
        } catch {}
      },
    });
    return;
  }
  finishClose();
};

const finishClose = () => {
  const uri = url.removeLastDir(route.path) + "/";
  router.push({ path: uri });
};

const preview = () => {
  isPreview.value = !isPreview.value;
};
</script>
