<template>
  <div id="app" style="display:flex; justify-content: center;">
    <div class="btn-container">
      <button @click="installInjector" v-if="!hasInjector"> Install injector </button>
      <button @click="installPlugins(version)" v-if="!hasPlugins"> Upgrade plugins </button>
      <button @click="openRuneLite">Open RuneLite</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      version: '',
      hasInjector: true,
      hasPlugins: false
    };
  },
  methods: {
    openRuneLite() {
      if (window.electronAPI && window.electronAPI.openRuneLite) {
        window.electronAPI.openRuneLite();
      } else {
        console.error('electronAPI is not defined');
      }
    },
    isInactive() {
      return true;
    },
    async getVersion() {
      if (window.electronAPI && window.electronAPI.getLatestVersion) {
        try {
          const versionData = await window.electronAPI.getLatestVersion();
          this.version = versionData.version;
        } catch (error) {
          console.error('Failed to get version:', error);
        }
      }
    },
    async checkInjector() {
      if (window.electronAPI && window.electronAPI.hasInjector) {
        try {
          this.hasInjector = await window.electronAPI.hasInjector();
        } catch (error) {
          console.error('Failed to check injector:', error);
        }
      }
    },
    async checkPlugins() {
      if (window.electronAPI && window.electronAPI.hasPlugins) {
        try {
          this.hasPlugins = await window.electronAPI.hasPlugins(this.version);
        } catch (error) {
          console.error('Failed to check injector:', error);
        }
      }
    },
    async installInjector() {
      if (window.electronAPI && window.electronAPI.installInjector) {
        try {
          await window.electronAPI.installInjector();
        } catch (error) {
          console.error('Failed to download file:', error);
        }
      }
    },
    async installPlugins(latest) {
      if (window.electronAPI && window.electronAPI.installPlugins) {
        try {
          await window.electronAPI.installPlugins(latest);
        } catch (error) {
          console.error('Failed to download file:', error);
        }
      }
    },
  },
  async mounted() {
    await this.getVersion();
    this.checkInjector();
    this.checkPlugins(this.version);
    this.injectorCheckInterval = setInterval(this.checkInjector, 1000)
    this.injectorCheckPlugin = setInterval(this.checkPlugins, 1000)
  },
  beforeDestroy() {
    clearInterval(this.injectorCheckInterval);
    clearInterval(this.injectorCheckPlugin);
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.btn-container {
  margin-top: 30vh;
  display: grid;
  gap: 10px;
  justify-content: space-evenly;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.inactive {
  cursor: not-allowed;
}
</style>
