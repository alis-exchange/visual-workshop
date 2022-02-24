<template>
  <div>
    <v-app-bar
      app
      clipped-left
      clipped-right
      color="white"
      elevation="0"
      style="border-bottom: 1px solid #d2d2d2 !important;"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title>
        Visual Workshop
      </v-toolbar-title>

      <v-spacer />

      <slot name="search" />

      <v-spacer />

      <v-toolbar-title
        @click="$emit('routing-event', 'Resources')"
      >
        alis<span style="color: #cf0000;">.</span>exchange
      </v-toolbar-title>

      <!--More info and utilities-->
      <v-menu
        bottom
        left
        open-on-hover
        offset-y
        :close-product-navigation-on-click="closeProductNavigationMenu"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>help_outline</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>
              <h4 class="text-h6 font-weight-light">
                learn more about
                <a
                  href="https://alis.exchange/"
                  target="_blank"
                  style="text-decoration: none; color: inherit;"
                >
                  alis<span style="color: #cf0000;">.</span>exchange
                </a>
              </h4>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      style="top: 64px;"
      fixed
      :height="windowHeight"
    >
      <v-list>
        <v-list-item
          link
          @click="
            drawer = false;
            $emit('router-event', 'Library');
          "
        >
          <v-list-item-content>
            <v-list-item-title>Library</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          link
          @click="
            drawer = false;
            $emit('router-event', 'ComponentDevView');
          "
        >
          <v-list-item-content>
            <v-list-item-title>Dev Mode</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>

export default {
  name: "Header",
  props: {
    productList: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    },
    headerActions: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    },
    productDeployments: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    },
  },
  data() {
    return {
      windowHeight: window.innerHeight,
      drawer: false,
      closeProductNavigationMenu: true,
      closeConsoleNavigationMenu: true,
      overlay: false,
      zIndex: 100,
    };
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.windowHeight = window.innerHeight;
    });
  },
  methods: {
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("darkMode", String(this.$vuetify.theme.dark));
    },
  },

};
</script>

<style lang="scss" scoped>
.debug {
  border: solid red 1px;
}
</style>
