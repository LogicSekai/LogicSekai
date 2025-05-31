<script setup lang="ts">
import { AudioWaveform, BookOpen, Command, GalleryVerticalEnd, HardDrive, Headset, House, ReceiptText } from 'lucide-vue-next'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import Header from '~/components/dashboard/layouts/Header.vue'
import SidebarItem from '~/components/dashboard/layouts/Sidebar.vue'

const authStore = useAuthStore()

const dataUser = {
    name: authStore.user.name,
    email: authStore.user.email,
    avatar: authStore.user.avatar ? authStore.pb.files.getURL(authStore.user, authStore.user.avatar, { thumb: '40x40' }) : '/img/avatar.png',
}

const menubarUser = [
    {
        label: 'Menu Utama',
        collapsibleHidden: false,
        items: [
            {
                name: 'Dashboard',
                url: '/dashboard',
                icon: House,
            },
            {
                title: 'Layanan Saya',
                url: '#',
                icon: HardDrive,
                isActive: true,
                items: [
                    {
                        title: 'Layanan Aktif',
                        url: '/products',
                    },
                    {
                        title: 'Pendaftaran',
                        url: '/products/register',
                    },
                    {
                        title: 'Status Pendaftaran',
                        url: '/products/register/status',
                    },
                ]
            },
            {
                name: 'Penagihan',
                url: '/invoices',
                icon: ReceiptText,
            },
        ]
    },
    {
        label: 'Bantuan',
        collapsibleHidden: true,
        items: [
            {
                title: 'Documentation',
                url: '#',
                icon: BookOpen,
                items: [
                    {
                        title: 'Admin / Pengurus',
                        url: '/documentation/admin',
                    },
                    {
                        title: 'Pengajar / Guru',
                        url: '/documentation/teacher',
                    },
                    {
                        title: 'Pelajar / Siswa',
                        url: '/documentation/student',
                    },
                ]
            },
            {
                name: 'Pusat Bantuan',
                url: '/tickets',
                icon: Headset,
            },
        ]
    }
]

const menubarAdmin = [
    {
        label: 'Menu Utama',
        collapsibleHidden: false,
        items: [
            {
                name: 'Overview',
                url: '/dashboard-admin',
                icon: House,
            },
            {
                title: 'Product',
                url: '#',
                icon: HardDrive,
                isActive: true,
                items: [
                    {
                        title: 'Tambah Baru',
                        url: '/dashboard-admin/product/new',
                    },
                    {
                        title: 'Daftar Produk',
                        url: '/dashboard-admin/product',
                    },
                    {
                        title: 'Kategori Produk',
                        url: '/dashboard-admin/category',
                    },
                    {
                        title: 'Analitik',
                        url: '/dashboard-admin/agency/history',
                    },
                ]
            },
            {
                name: 'Daftar Transaksi',
                url: '/dashboard-admin/invoices',
                icon: ReceiptText,
            },
            {
                title: 'Pengguna',
                url: '#',
                icon: HardDrive,
                isActive: false,
                items: [
                    {
                        title: 'Admin Instansi',
                        url: '/dashboard-admin/users/admin',
                    },
                    {
                        title: 'Pengajar',
                        url: '/dashboard-admin/users/teacher',
                    },
                    {
                        title: 'Pelajar',
                        url: '/dashboard-admin/users/student',
                    },
                    {
                        title: 'Pengelolah Seadmin',
                        url: '/dashboard-admin/users/seadmin',
                    },
                ]
            },
        ]
    },
    {
        label: 'Bantuan',
        collapsibleHidden: true,
        items: [
            {
                title: 'Documentation',
                url: '#',
                icon: BookOpen,
                items: [
                    {
                        title: 'Admin / Pengurus',
                        url: '/documentation/admin',
                    },
                    {
                        title: 'Pengajar / Guru',
                        url: '/documentation/teacher',
                    },
                    {
                        title: 'Pelajar / Siswa',
                        url: '/documentation/student',
                    },
                ]
            },
            {
                name: 'Pusat Bantuan',
                url: '/tickets',
                icon: Headset,
            },
        ]
    }
]

const dataSidebar = () => {
    return (authStore.user.role === 'admin') ? { user: dataUser, sidebar: menubarAdmin } : { user: dataUser, sidebar: menubarUser }
}
</script>

<template>
    <SidebarProvider>
        <Sidebar collapsible="icon">
            <SidebarItem :data="dataSidebar()" />
        </Sidebar>
        <SidebarInset>
            <Header :data="dataSidebar()" />
            <main class="flex flex-1 flex-col p-4 md:px-8 pb-4 md:pb-8 gap-4 md:gap-8 bg-gray-100">
                <slot />
            </main>
        </SidebarInset>
    </SidebarProvider>
</template>