<template>
  <!-- The purpose of this container is to facilitate all complex logic and data fetching for the header component. -->
  <Header
    class="debug"
    @product-selected-event="productSelectedEventHandler"
    @header-action-selected-event="headerActionSelectedEventHandler"
    @router-event="routerEventHandler"
  >
    <template #productName>
      {{ productName }}
    </template>
    <template #productIcon>
      {{ productIcon }}
    </template>
    <template #search />
  </Header>
</template>

<script>
import Header from "./Header";
import routingHandlerMixin from "@/utils/routingHandler.mixin";
export default {
  name: "HeaderContainer",
  components: {
    Header
  },
  mixins: [routingHandlerMixin],
  data() {
    return {
      productName: "  Visual Workshop",
      productIcon: "None",
    };
  },
  methods: {
    // Handles all product selection events received from the header component.
    productSelectedEventHandler(productName) {
      console.log(productName);
    },
    // Handles all header action selection events from the header component.
    headerActionSelectedEventHandler(actionName) {
      console.log(actionName);
    },
    // Handles all routing events received from the header component.
    routerEventHandler(routeName) {
      this.routeToView(routeName);
    }
  }
};
</script>

<style scoped>
.debug {
  border: solid red 1px;
}
</style>
