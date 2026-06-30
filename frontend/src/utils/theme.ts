import { theme } from "./constants";
import "ace-builds";
import { themesByName } from "ace-builds/src-noconflict/ext-themelist";

const THEME_STORAGE_KEY = "filebrowser-theme";

export const getTheme = (): UserTheme => {
  // localStorage takes priority for persistence across dev reloads
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // Then check DOM className (set by inline script or backend)
  const domTheme = document.documentElement.className as UserTheme;
  if (domTheme === "light" || domTheme === "dark") return domTheme;
  // Finally, backend-provided theme
  return theme;
};

export const setTheme = (theme: UserTheme) => {
  const html = document.documentElement;
  if (!theme) {
    theme = getMediaPreference();
  }
  html.className = theme;
  // Sync DaisyUI data-theme attribute
  html.setAttribute("data-theme", theme);
  // Persist to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const toggleTheme = (): void => {
  const activeTheme = getTheme();
  if (activeTheme === "light") {
    setTheme("dark");
  } else {
    setTheme("light");
  }
};

export const getMediaPreference = (): UserTheme => {
  const hasDarkPreference = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (hasDarkPreference) {
    return "dark";
  } else {
    return "light";
  }
};

export const getEditorTheme = (themeName: string) => {
  if (!themeName.startsWith("ace/theme/")) {
    themeName = `ace/theme/${themeName}`;
  }
  const themeKey = themeName.replace("ace/theme/", "");
  if (themesByName[themeKey] !== undefined) {
    return themeName;
  } else if (getTheme() === "dark") {
    return "ace/theme/twilight";
  } else {
    return "ace/theme/chrome";
  }
};
