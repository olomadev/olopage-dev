import { defineStore } from "pinia";
import axios from 'axios';

const store = defineStore('index', {
  state: () => {
    return { 
      id: null,
      locale: "en",
      admin: null,
      modules: [],
      drawer: true,
      navbarKey: 0,
      applyImage: false,
    }
  },
  getters: {
    getApplyImageEvent() {
      return this.applyImage;
    },
    getNavbarKey() {
      return this.navbarKey;
    },
    getResourceId(id) {
      return this.id;
    },
    getLocale() {
      return this.locale
    },
    getResource: (state) => {
      return function (name) {
        this.modules["resource"].setResource(name);
        return this.modules["resource"];
      }
    },
    getModule: (state) => {
      return function (name) {
        return this.modules[name];
      }
    },
    getDrawer() {
      return this.drawer;
    },
  },
  actions: {
    applyImageEvent(bool) {
      this.applyImage = bool;
    },
    setNavbarKey() {
      this.navbarKey = this.navbarKey + 1;
    },
    setResourceId(id) {
      this.id = id;
    },
    setModule(storeName, useStore) {
      this.modules[storeName] = useStore();
      return this.modules[storeName];
    },
    setLocale(locale) {
      this.locale = locale;
      axios.defaults.headers.common['X-Client-Locale'] = locale;
    },
    setDrawer(drawer) {
      this.drawer = drawer;
    },
  }
});

export default store;