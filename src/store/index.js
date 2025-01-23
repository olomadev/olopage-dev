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
    }
  },
  getters: {
    getNavbarKey() {
      return this.navbarKey;
    },
    getResourceId(id) {
      return this.id;
    },
    getAdmin() {
      return this.admin;
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
    setNavbarKey() {
      this.navbarKey = this.navbarKey + 1;
    },
    setResourceId(id) {
      this.id = id;
    },
    setAdmin(admin) {
      this.admin = admin;
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