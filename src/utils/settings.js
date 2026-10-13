import { DEFAULT_SETTINGS } from "../constants/config";

// Module-level copy of the settings so plain helpers (isPassed etc.) can read the pass mark.
// DataProvider keeps it in sync on every render.
let active = DEFAULT_SETTINGS;

export const setActiveSettings = (s) => { active = s; };
export const getPassMark = () => Number(active.passMark) || DEFAULT_SETTINGS.passMark;
export const getDefaultCourse = () => active.defaultCourse || DEFAULT_SETTINGS.defaultCourse;
export const getDefaultPassword = () => active.defaultPassword || DEFAULT_SETTINGS.defaultPassword;
