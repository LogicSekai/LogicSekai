<script setup lang="ts">
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";
import Toaster from '@/components/ui/toast/Toaster.vue';
import MaintenancePage from "~/components/Maintenace.vue"

// const { isOnline } = usePocketBaseHealth()

</script>

<template>
    <!-- <template v-if="isOnline"> -->
    <Toaster />
    <Header/>
        <slot/>
    <Footer/>
    <!-- <template v-else>
        <MaintenancePage />
    </template> -->
</template>