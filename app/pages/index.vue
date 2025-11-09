<template>
    <div class="min-h-screen bg-black">
    
        <!-- [SECTION 1] Hero Section - The Hook -->
        <!-- Menangkap perhatian dengan value proposition yang kuat -->
        <LandingHeroSection />
        
        <!-- [SECTION 2] Brand & Value - The Authority -->
        <!-- Membangun kredibilitas dan otoritas brand -->
        <LandingBrandValue />
        
        <!-- [SECTION 3] Services/Products - The Solution -->
        <!-- Menjelaskan solusi yang ditawarkan -->
        <LandingServicesProducts />
        
        <!-- [SECTION 4] Founder Profile - The Connection -->
        <!-- Membangun koneksi personal dengan founder -->
        <LandingFounderProfile />
        
        <!-- [SECTION 5] Social Proof/Testimonials - The Trust -->
        <!-- Memberikan bukti sosial untuk meningkatkan trust -->
        <LandingTestimonials />
        
        <!-- [SECTION 6] Final CTA & Contact - The Action -->
        <!-- Mendorong pengunjung untuk mengambil action -->
        <LandingFinalCTA />
        
    </div>
</template>

<script setup lang="ts">
import LandingHeroSection from '~/components/landing/HeroSection.vue'
import LandingBrandValue from '~/components/landing/BrandValue.vue'
import LandingServicesProducts from '~/components/landing/ServicesProducts.vue'
import LandingFounderProfile from '~/components/landing/FounderProfile.vue'
import LandingTestimonials from '~/components/landing/Testimonials.vue'
import LandingFinalCTA from '~/components/landing/FinalCTA.vue'

definePageMeta({
    layout: 'default'
})

// SEO Meta tags
useHead({
    title: 'Logic Sekai - Platform Marketplace untuk Kreator Digital Indonesia',
    meta: [
        {
            name: 'description',
            content: 'Logic Sekai adalah platform marketplace yang menghubungkan kreator berbakat dengan pembeli digital. Jual produk digital dengan payment gateway sendiri, tanpa batasan, tanpa kompromi.'
        },
        {
            name: 'keywords',
            content: 'marketplace digital, kreator indonesia, jual produk digital, payment gateway, ebook, template, plugin, asset digital'
        },
        // Open Graph
        { property: 'og:title', content: 'Logic Sekai - Platform Marketplace untuk Kreator Digital' },
        { property: 'og:description', content: 'Platform marketplace yang memberdayakan kreator untuk menjual produk digital dengan payment gateway sendiri' },
        { property: 'og:type', content: 'website' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Logic Sekai - Platform Marketplace untuk Kreator Digital' },
        { name: 'twitter:description', content: 'Jual produk digital dengan mudah dan menguntungkan' }
    ]
})
</script>