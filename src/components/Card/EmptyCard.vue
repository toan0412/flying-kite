<template>
  <v-card class="mx-auto empty-card">
    <v-layout>
      <v-main>
        <v-empty-state image="https://vuetifyjs.b-cdn.net/docs/images/components/v-empty-state/astro-dog.svg"
          :width="imageWidth" text-width="250">
          <template v-slot:media>
            <v-img class="mb-8"></v-img>
          </template>

          <template v-slot:title>
            <div class="text-subtitle-1 font-weight-bold text-high-emphasis">{{ title }}</div>
          </template>

          <template v-slot:text>
            <div class="text-subtitle-2">
              {{ subtitle }}
            </div>
          </template>
        </v-empty-state>
      </v-main>

    </v-layout>
  </v-card>
</template>

<script>
export default {
  name: 'EmptyCard',

  props: {
    imageWidth: {
      type: String,
      default: '500'
    },
    title: String,
    subtitle: String,
  }
}
</script>

<style lang="scss">
.empty-card {
  box-shadow: unset !important
}
</style>