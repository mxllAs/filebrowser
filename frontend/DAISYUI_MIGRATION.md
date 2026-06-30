# FileBrowser Frontend — DaisyUI 迁移改造指南

> **目标**：将原生手写 CSS 逐步替换为 Tailwind CSS + DaisyUI 组件类，减少自定义 CSS 代码量，统一设计语言。

---

## 一、当前架构总览

```
┌─────────────────────────────────────────────────────────┐
│                     CSS 体系（改造前）                     │
├──────────────┬──────────────────────────────────────────┤
│ tailwind.css │ @tailwind base/components/utilities       │
│ _variables.css│ :root / :root.dark CSS 变量 (74行)        │
│ base.css     │ body/nav/main/button 全局样式 (281行)      │
│ header.css   │ header/search 样式 (291行)                 │
│ login.css    │ 登录页全量样式 (248行)                     │
│ listing.css  │ 文件列表样式 (299行)                       │
│ mdPreview.css│ Markdown 预览样式 (112行)                  │
│ 其他 .css    │ 分享/设置等模块样式                         │
├──────────────┴──────────────────────────────────────────┤
│ ✅ 已部分 DaisyUI: Editor.vue (btn, join, loading-spinner) │
│ ✅ 已配置: tailwind.config.cjs (light/dark 主题)          │
└─────────────────────────────────────────────────────────┘
```

**DaisyUI 已安装并配置**，目前仅在 `Editor.vue` 中使用了少量组件类，其他所有页面和组件仍是纯手写 CSS。

---

## 二、DaisyUI 组件对照表

| 原生实现                 | 文件                              | DaisyUI 替代                                        | 复杂度 |
| ------------------------ | --------------------------------- | --------------------------------------------------- | ------ |
| 按钮 `.action`           | `header/Action.vue`               | `btn btn-ghost btn-sm`                              | ⭐     |
| 弹窗 `#modal-background` | `prompts/BaseModal.vue`           | `modal modal-open` + `modal-box`                    | ⭐⭐   |
| 登录页                   | `views/Login.vue`                 | `card` + `input input-bordered` + `btn btn-primary` | ⭐⭐⭐ |
| 侧边栏                   | `components/Sidebar.vue`          | `drawer` + `menu`                                   | ⭐⭐   |
| 顶部栏                   | `components/header/HeaderBar.vue` | `navbar`                                            | ⭐⭐   |
| 面包屑                   | `components/Breadcrumbs.vue`      | `breadcrumbs`                                       | ⭐     |
| 文件列表                 | `views/files/FileListing.vue`     | `table` / `card`                                    | ⭐⭐⭐ |
| 进度条                   | `components/ProgressBar.vue`      | `progress progress-primary`                         | ⭐     |
| 搜索框                   | `components/Search.vue`           | `input input-bordered` + `dropdown`                 | ⭐⭐   |
| Markdown 预览            | Editor.vue 中已用 `prose`         | **保留** ✅                                         | —      |
| 23 个弹窗内容            | `components/prompts/*.vue`        | `modal-box` 内 DaisyUI 表单                         | ⭐⭐   |
| Toast 提示               | `CustomToast.vue`                 | `toast` / `alert`                                   | ⭐     |
| 输入框                   | 各处 `.input`                     | `input input-bordered`                              | ⭐     |

---

## 三、分阶段改造计划

### Phase 1 — 基础配置：统一颜色方案

**策略**：用 DaisyUI 主题变量替换 `_variables.css` 中的自定义 CSS 变量。

**文件**：`tailwind.config.cjs`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#0071e3",
          "primary-content": "#ffffff",
          secondary: "#86868b",
          accent: "#34c759",
          neutral: "#1d1d1f",
          "base-100": "#ffffff",
          "base-200": "#f5f5f7",
          "base-300": "#e8e8ed",
          "base-content": "#1d1d1f",
          info: "#0071e3",
          success: "#34c759",
          warning: "#ff9f0a",
          error: "#ff453a",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--animation-btn": "0.15s",
          "--animation-input": "0.15s",
        },
        dark: {
          primary: "#2997ff",
          "primary-content": "#ffffff",
          secondary: "rgba(255,255,255,0.55)",
          accent: "#34c759",
          neutral: "#ffffff",
          "base-100": "#161617",
          "base-200": "rgba(29,29,31,0.85)",
          "base-300": "#2d2d2f",
          "base-content": "rgba(255,255,255,0.92)",
        },
      },
    ],
  },
};
```

**同步操作**：

- `_variables.css` → 逐步删除，保留色值作为注释参考
- `base.css` 中的 `body` 背景色 → 改为 `@apply bg-base-100 text-base-content` 或直接删掉

---

### Phase 2 — 按钮组件 `Action.vue` ⭐

> **影响范围**：全局所有按钮（HeaderBar、Sidebar、FileListing、Editor）

**文件**：`src/components/header/Action.vue`

#### 改造前

```vue
<template>
  <button @click="action" :aria-label="label" :title="label" class="action">
    <i class="material-icons">{{ icon }}</i>
    <span>{{ label }}</span>
    <span v-if="counter && counter > 0" class="counter">{{ counter }}</span>
  </button>
</template>
```

#### 改造后

```vue
<template>
  <button
    @click="action"
    :aria-label="label"
    :title="label"
    class="btn btn-ghost btn-sm gap-1.5 h-auto min-h-0 px-2.5 py-1.5"
  >
    <i class="material-icons text-lg">{{ icon }}</i>
    <span class="hidden md:inline text-sm font-medium">{{ label }}</span>
    <span
      v-if="counter && counter > 0"
      class="badge badge-sm badge-primary ml-0.5"
      >{{ counter }}</span
    >
  </button>
</template>
```

**可删除的 CSS**：`header.css` 中 `.action` 相关样式，以及 `base.css` 中 `nav .action` 样式。

---

### Phase 3 — 登录页面 `Login.vue` ⭐⭐⭐

> **影响范围**：仅登录页
> **CSS 减少**：~200 行 → ~10 行（保留 blob 动画）

**文件**：`src/views/Login.vue`

#### 改造后 (template 核心部分)

```vue
<template>
  <div
    class="min-h-screen bg-base-200 flex items-center justify-center relative overflow-hidden"
  >
    <!-- 保留背景光晕动画 -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div
      class="card w-full max-w-sm bg-base-100/70 backdrop-blur-2xl shadow-2xl border border-base-content/5 z-10 animate-[cardAppear_.8s_cubic-bezier(0.16,1,0.3,1)]"
    >
      <div class="card-body gap-5 p-10">
        <!-- Logo -->
        <div class="flex justify-center">
          <div
            class="w-18 h-18 rounded-2xl bg-base-100 border border-base-content/5 p-3 shadow-sm"
          >
            <img
              :src="logoURL"
              alt="File Browser"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 class="text-2xl font-bold text-center tracking-tight">
          {{ name }}
        </h1>

        <!-- 登出原因提示 -->
        <div v-if="reason" class="alert alert-warning py-2 text-sm">
          {{ t(`login.logout_reasons.${reason}`) }}
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="alert alert-error py-2 text-sm">
          {{ error }}
        </div>

        <!-- 表单 -->
        <form @submit="submit" class="flex flex-col gap-4">
          <input
            autofocus
            type="text"
            v-model="username"
            :placeholder="t('login.username')"
            class="input input-bordered w-full"
          />
          <input
            type="password"
            v-model="password"
            :placeholder="t('login.password')"
            class="input input-bordered w-full"
          />
          <input
            v-if="createMode"
            type="password"
            v-model="passwordConfirm"
            :placeholder="t('login.passwordConfirm')"
            class="input input-bordered w-full"
          />

          <div v-if="recaptcha" id="recaptcha"></div>

          <button type="submit" class="btn btn-primary w-full mt-2">
            {{ createMode ? t("login.signup") : t("login.submit") }}
          </button>

          <p
            v-if="signup"
            @click="toggleMode"
            class="text-center text-sm text-primary cursor-pointer hover:underline"
          >
            {{
              createMode ? t("login.loginInstead") : t("login.createAnAccount")
            }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
```

**保留的 CSS**（blob 动画）：

```css
#login .blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
}
```

**可删除**：`login.css` 中卡片、表单、按钮、输入框的所有样式（约 200 行）。

---

### Phase 4 — 弹窗系统 `BaseModal.vue` ⭐⭐

> **影响范围**：全部 23 个 Prompts 弹窗

**文件**：`src/components/prompts/BaseModal.vue`

#### 改造后

```vue
<template>
  <dialog class="modal modal-open" @click="backgroundClick">
    <div class="modal-box">
      <slot></slot>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const emit = defineEmits(["closed"]);

onMounted(() => {
  const element = document.querySelector("#focus-prompt") as HTMLElement | null;
  element?.focus();
});

const backgroundClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.tagName === "DIALOG") {
    emit("closed");
  }
};
</script>
```

**可删除**：`BaseModal.vue` 中 `<style scoped>` 的全部内容（~20行）。

**然后改造弹窗内容组件**，例如 `Delete.vue`、`Rename.vue` 等：

- 按钮 → `btn btn-ghost` / `btn btn-error` / `btn btn-primary`
- 输入框 → `input input-bordered w-full`

---

### Phase 5 — 侧边栏 `Sidebar.vue` ⭐⭐

> **影响范围**：全局布局（移动端抽屉，桌面端固定侧栏）

**文件**：`src/components/Sidebar.vue`

#### 改造后

```vue
<template>
  <div class="drawer lg:drawer-open">
    <input type="checkbox" class="drawer-toggle" />

    <div class="drawer-side z-50">
      <label class="drawer-overlay" @click="closeHovers"></label>

      <div
        class="bg-base-200/85 backdrop-blur-xl w-64 min-h-full flex flex-col p-4 gap-1"
      >
        <!-- 用户信息 -->
        <template v-if="isLoggedIn">
          <button
            @click="toAccountSettings"
            class="btn btn-ghost justify-start"
          >
            <i class="material-icons">person</i>
            <span>{{ user.username }}</span>
          </button>

          <div class="divider my-1"></div>

          <button @click="toRoot" class="btn btn-ghost justify-start">
            <i class="material-icons">folder</i>
            <span>{{ $t("sidebar.myFiles") }}</span>
          </button>

          <template v-if="user.perm.create">
            <button
              @click="showHover('newDir')"
              class="btn btn-ghost justify-start"
            >
              <i class="material-icons">create_new_folder</i>
              <span>{{ $t("sidebar.newFolder") }}</span>
            </button>
            <button
              @click="showHover('newFile')"
              class="btn btn-ghost justify-start"
            >
              <i class="material-icons">note_add</i>
              <span>{{ $t("sidebar.newFile") }}</span>
            </button>
          </template>

          <template v-if="user.perm.admin">
            <div class="divider my-1"></div>
            <button
              @click="toGlobalSettings"
              class="btn btn-ghost justify-start"
            >
              <i class="material-icons">settings_applications</i>
              <span>{{ $t("sidebar.settings") }}</span>
            </button>
          </template>
        </template>

        <!-- 剩余菜单项 -->

        <!-- 底部信息 -->
        <div class="mt-auto">
          <div v-if="isFiles && !disableUsedPercentage" class="mb-4">
            <progress
              class="progress progress-primary w-full h-1"
              :value="usage.usedPercentage"
              max="100"
            ></progress>
            <p class="text-xs text-base-content/50 mt-1">
              {{
                $t("sidebar.diskUsed", { used: usage.used, total: usage.total })
              }}
            </p>
          </div>
          <p class="text-xs text-base-content/40 text-center">
            <a v-if="!disableExternal" href="..." target="_blank"
              >File Browser</a
            >
            <span v-else>File Browser</span>
            {{ version }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
```

**可删除**：`base.css` 中 `nav` 和 `nav .action` 相关全部样式（~80行）。

---

### Phase 6 — 顶部栏 `HeaderBar.vue` ⭐⭐

**文件**：`src/components/header/HeaderBar.vue`

#### 改造后

```vue
<template>
  <header
    class="navbar bg-base-100/85 backdrop-blur-xl border-b border-base-300/50 shadow-sm sticky top-0 z-[1000] px-4 h-16 min-h-0"
  >
    <div class="navbar-start gap-2">
      <img v-if="showLogo" :src="logoURL" class="h-8" />
      <Action
        v-if="showMenu"
        class="lg:hidden"
        icon="menu"
        :label="t('buttons.toggleSidebar')"
        @action="layoutStore.showHover('sidebar')"
      />
    </div>

    <div class="navbar-center">
      <slot />
    </div>

    <div class="navbar-end gap-0.5">
      <slot name="actions" />
      <Action
        v-if="ifActionsSlot"
        icon="more_vert"
        :label="t('buttons.more')"
        @action="layoutStore.showHover('more')"
      />
    </div>

    <!-- 下拉菜单面板 -->
    <div
      v-if="layoutStore.currentPromptName === 'more'"
      class="dropdown dropdown-end dropdown-open"
    >
      <div
        class="dropdown-content menu menu-sm bg-base-200 rounded-box w-52 shadow mt-2"
      >
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
```

**可删除**：`header.css` 中 `header` 布局相关样式（~50行）。

---

### Phase 7 — 面包屑 `Breadcrumbs.vue` ⭐

**文件**：`src/components/Breadcrumbs.vue`

#### 改造后

```vue
<template>
  <div
    class="breadcrumbs text-sm px-5 py-3 sticky top-16 z-[99] bg-base-100 border-b border-base-300/50"
  >
    <ul>
      <li>
        <component :is="element" :to="base || ''" class="gap-1">
          <i class="material-icons text-base">home</i>
          {{ t("files.home") }}
        </component>
      </li>
      <li v-for="(link, index) in items" :key="index">
        <component :is="element" :to="link.url">{{ link.name }}</component>
      </li>
    </ul>
  </div>
</template>
```

**可删除**：`base.css` 中 `.breadcrumbs` 相关全部样式（~35行）。

---

### Phase 8 — 文件列表 `FileListing.vue` ⭐⭐⭐

> **最复杂的改造**，建议最后做。三种视图模式需要分别处理。

**文件**：`src/views/files/FileListing.vue`

| 视图模式           | DaisyUI 方案                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **list**           | `<div class="overflow-x-auto"><table class="table table-zebra table-sm">`                                          |
| **mosaic**         | `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">` + 每项 `card card-compact` |
| **mosaic gallery** | `<div class="grid ...">` + 每项 `card image-full`                                                                  |

#### list 视图改造示例

```vue
<div class="overflow-x-auto">
  <table class="table table-zebra table-sm">
    <thead>
      <tr>
        <th>
          <button @click="sort('name')" class="flex items-center gap-1">
            {{ t('files.name') }}
            <i class="material-icons text-sm">{{ nameIcon }}</i>
          </button>
        </th>
        <th>
          <button @click="sort('size')" class="flex items-center gap-1">
            {{ t('files.size') }}
            <i class="material-icons text-sm">{{ sizeIcon }}</i>
          </button>
        </th>
        <th>
          <button @click="sort('modified')" class="flex items-center gap-1">
            {{ t('files.lastModified') }}
            <i class="material-icons text-sm">{{ modifiedIcon }}</i>
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in dirs" :key="item.name"
          :class="{ 'bg-primary text-primary-content': fileStore.selected.includes(item.index) }"
          @click="..." @contextmenu="...">
        <td>
          <div class="flex items-center gap-2">
            <i class="material-icons text-primary">folder</i>
            {{ item.name }}
          </div>
        </td>
        <td>—</td>
        <td class="text-base-content/50 text-xs">{{ item.modified }}</td>
      </tr>
      <tr v-for="item in files" :key="item.name"
          :class="{ 'bg-primary text-primary-content': fileStore.selected.includes(item.index) }"
          @click="...">
        <td>
          <div class="flex items-center gap-2">
            <i class="material-icons text-base-content/50">insert_drive_file</i>
            {{ item.name }}
          </div>
        </td>
        <td class="text-base-content/50 text-xs">{{ item.size }}</td>
        <td class="text-base-content/50 text-xs">{{ item.modified }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

**可删除**：`listing.css` 中 list/mosaic/gallery 的大部分样式（~250行）。

---

### Phase 9 — 进度条 `ProgressBar.vue` ⭐

使用 DaisyUI `progress`：

```vue
<progress class="progress progress-primary" :value="pct" max="100"></progress>
```

可完全替换掉 `ProgressBar.vue` 中的复杂计算逻辑。

---

### Phase 10 — 清理收尾

1. **删除 `_variables.css`** — 颜色全部由 DaisyUI 主题统一管理
2. **精简 `base.css`** — 只保留 DaisyUI 无法覆盖的全局规则
3. **精简 `header.css`** — 只保留 Search 组件的特殊样式
4. **删除 `login.css`** — 完全由 DaisyUI 接管
5. **删除 `mdPreview.css`** — Editor.vue 已用 `prose` 类替代
6. **缩减 `listing.css`** — 只保留 `selected` 状态等特殊样式

**预期 CSS 减少量**：~1200 行 → ~200 行（减少 80%+）

---

## 四、改造中的注意事项

### 4.1 不要删除的 CSS

| CSS 规则                                | 原因                              |
| --------------------------------------- | --------------------------------- |
| `_variables.css` 中的 blob 动画         | DaisyUI 没有对应组件              |
| `base.css` 中 `main` 的布局             | DaisyUI drawer 会处理，但需过渡期 |
| `header.css` 中 Search 的展开/收起动画  | DaisyUI dropdown 行为不同         |
| `listing.css` 中 `.item[aria-selected]` | 选中高亮是核心交互                |
| 拖拽上传的视觉反馈                      | 是状态样式，非视觉样式            |

### 4.2 过渡期策略

建议新旧样式**共存过渡**，逐步删除旧 CSS：

1. 先在组件上加 DaisyUI 类
2. 确认视觉效果正确后，逐块删除对应的旧 CSS 代码
3. 每改完一个 Phase 就在 git 上提交，方便回滚

### 4.3 主题切换

现有主题切换逻辑在 `utils/theme.ts` 和 `App.vue` 中，DaisyUI 通过 `data-theme` 属性切换：

```typescript
// App.vue onMounted 中
const theme = getTheme() || getMediaPreference();
document.documentElement.setAttribute("data-theme", theme || "light");
```

### 4.4 RTL 支持

DaisyUI 原生支持 RTL，改造后大部分可以用 Tailwind 的 RTL 变体替代原有 `html[dir="rtl"]` 选择器。

---

## 五、改造检查清单

- [x] **Phase 1**：`tailwind.config.cjs` 配置 Apple 色系主题 + `theme.ts` 同步 `data-theme`
- [x] **Phase 2**：`Action.vue` 改为 `btn btn-ghost`，删除 ~100 行旧按钮 CSS
- [x] **Phase 3**：`Login.vue` 全 DaisyUI，`login.css` 从 248→52 行（只保留 blob 动画）
- [x] **Phase 4**：`BaseModal.vue` 改为 `modal` + `modal-box`，19 个 Prompt 全部适配
- [x] **Phase 5**：`Sidebar.vue` 改为 `btn-ghost` + `progress`，精简 `base.css` nav 样式
- [x] **Phase 6**：`HeaderBar.vue` 改为 `navbar` + `dropdown`，简化 `header.css`
- [x] **Phase 7**：`Breadcrumbs.vue` 改为 `breadcrumbs`，删除 base.css 旧样式 ~36行
- [ ] **Phase 8**：`FileListing.vue` 三种视图改造（已回退，待重新设计）
- [x] **Phase 9**：删除 `ProgressBar.vue`（未使用）+ 删除 `mdPreview.css`（已由 prose 替代）
- [x] **Phase 10**：清理收尾 — 删 mdPreview.css，各 CSS 文件已大幅精简
- [ ] **最终验证**：Light/Dark 主题切换、移动端适配、RTL 语言

> **Bug 修复记录**：
>
> - 修复 `body { padding-top: 4em }` 与 sticky header 导致的顶部间距异常。
> - 修复移动端侧边栏点击只出现遮罩、无法滑入的问题：`mobile.css` 改用 `transform: translateX(-100%)` + 特异性 `nav.sidebar-nav`。
> - 修复 PC 端侧边栏被遮罩覆盖的问题：`Sidebar.vue` 在 ≥737px 隐藏 `.sidebar-overlay`，因 PC 端 `nav { z-index: 100 }` 远低于 `.overlay { z-index: 9999 }`。

---

## 六、参考资源

- [DaisyUI 组件文档](https://daisyui.com/components/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [DaisyUI 主题定制](https://daisyui.com/docs/themes/)
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) — Markdown 预览用
