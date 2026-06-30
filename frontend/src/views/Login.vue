<template>
  <div
    id="login"
    :class="{ recaptcha: recaptcha }"
    class="h-screen w-full fixed top-0 left-0 flex items-center justify-center overflow-hidden bg-base-200"
  >
    <!-- background blobs for glassmorphism effect -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div
      class="card w-full max-w-sm bg-base-100/75 backdrop-blur-[30px] shadow-2xl border border-base-content/5 z-10 animate-[cardAppear_.8s_cubic-bezier(0.16,1,0.3,1)]"
    >
      <div class="card-body gap-5 p-10">
        <div class="flex justify-center">
          <div
            class="flex items-center justify-center w-18 h-18 rounded-2xl bg-base-100 border border-base-content/5 shadow-lg p-3"
          >
            <img
              :src="logoURL"
              alt="File Browser"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 class="text-2xl font-bold text-center tracking-tight -mt-1">
          {{ name }}
        </h1>

        <p v-if="reason != null" class="alert alert-warning py-2 text-sm">
          {{ t(`login.logout_reasons.${reason}`) }}
        </p>
        <div v-if="error !== ''" class="alert alert-error py-2 text-sm">
          {{ error }}
        </div>

        <form @submit="submit" class="flex flex-col gap-4">
          <input
            autofocus
            class="input input-bordered w-full"
            type="text"
            autocapitalize="off"
            v-model="username"
            :placeholder="t('login.username')"
          />
          <input
            class="input input-bordered w-full"
            type="password"
            v-model="password"
            :placeholder="t('login.password')"
          />
          <input
            v-if="createMode"
            class="input input-bordered w-full"
            type="password"
            v-model="passwordConfirm"
            :placeholder="t('login.passwordConfirm')"
          />

          <div v-if="recaptcha" id="recaptcha"></div>

          <button type="submit" class="btn btn-neutral w-full mt-1">
            {{ createMode ? t("login.signup") : t("login.submit") }}
          </button>
        </form>

        <p
          v-if="signup"
          @click="toggleMode"
          class="text-center text-sm text-primary cursor-pointer hover:underline"
        >
          {{
            createMode ? t("login.loginInstead") : t("login.createAnAccount")
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StatusError } from "@/api/utils";
import * as auth from "@/utils/auth";
import {
  name,
  logoURL,
  recaptcha,
  recaptchaKey,
  signup,
} from "@/utils/constants";
import { inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

// Define refs
const createMode = ref<boolean>(false);
const error = ref<string>("");
const username = ref<string>("");
const password = ref<string>("");
const passwordConfirm = ref<string>("");

const route = useRoute();
const router = useRouter();
const { t } = useI18n({});
// Define functions
const toggleMode = () => (createMode.value = !createMode.value);

const $showError = inject<IToastError>("$showError")!;

const reason = route.query["logout-reason"] ?? null;

const submit = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  const redirect = (route.query.redirect || "/files/") as string;

  let captcha = "";
  if (recaptcha) {
    captcha = window.grecaptcha.getResponse();

    if (captcha === "") {
      error.value = t("login.wrongCredentials");
      return;
    }
  }

  if (createMode.value) {
    if (password.value !== passwordConfirm.value) {
      error.value = t("login.passwordsDontMatch");
      return;
    }
  }

  try {
    if (createMode.value) {
      await auth.signup(username.value, password.value);
    }

    await auth.login(username.value, password.value, captcha);
    router.push({ path: redirect });
  } catch (e: any) {
    // console.error(e);
    if (e instanceof StatusError) {
      if (e.status === 409) {
        error.value = t("login.usernameTaken");
      } else if (e.status === 403) {
        error.value = t("login.wrongCredentials");
      } else if (e.status === 400) {
        const match = e.message.match(/minimum length is (\d+)/);
        if (match) {
          error.value = t("login.passwordTooShort", { min: match[1] });
        } else {
          error.value = e.message;
        }
      } else {
        $showError(e);
      }
    }
  }
};

// Run hooks
onMounted(() => {
  if (!recaptcha) return;

  window.grecaptcha.ready(function () {
    window.grecaptcha.render("recaptcha", {
      sitekey: recaptchaKey,
    });
  });
});
</script>
