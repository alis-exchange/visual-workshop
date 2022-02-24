<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <header-container />
    <v-main>
      <!-- bottom padding 48px because of fixed footer -->
      <v-container class="py-0">
        <library-container />
      </v-container>
    </v-main>
    <Footer />
    <popup-container
      v-for="popup in popups"
      :key="popup.id"
      :config="popup"
      :title="popup.title || ''"
      :sub-title="popup.subTitle || ''"
    >
      <popup-provider
        :config="popup"
      />
    </popup-container>
  </v-app>
</template>

<script>
import HeaderContainer from "@/components/Header/HeaderContainer";
import LibraryContainer from "./views/LibraryContainer";
import PopupProvider from "@/components/Popups/PopupProvider";
import PopupContainer from "@/components/Popups/PopupContainer";
import {mapState} from "vuex";

export default {
  name: "App",

  components: {
    HeaderContainer,
    LibraryContainer,
    PopupProvider,
    PopupContainer
  },
  computed: {
    ...mapState("global", [
      "popups"
    ])
  },
  watch: {
    popups: {
      deep: true,
      handler: function () {
      }
    }
  }
};
</script>
