<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const props = defineProps<{
    data: any
}>()

const handleLogout = async () => {
    try {
        await authStore.logout()
        await router.push('/auth')
    } catch (error) {
        console.log(error)
    }
}
</script>

<template>
    <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
        <div class="flex items-center px-4 w-full justify-between">
            <div class="flex items-center gap-2">
                <SidebarTrigger class="-ml-1" />
                <Separator orientation="vertical" class="mr-2 h-4" />
            </div>
            <DropdownMenu class="ml-auto mr-0 flex">
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost">
                        <Avatar class="h-8 w-8 rounded-lg">
                            <AvatarImage :src="data.user.avatar" :alt="data.user.name" />
                            <AvatarFallback class="rounded-lg">
                                CN
                            </AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">{{ data.user.name }}</span>
                            <span class="truncate text-xs">{{ data.user.email }}</span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="min-w-56 rounded-lg" align="end">
                    <DropdownMenuLabel class="p-0 font-normal">
                        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar class="h-8 w-8 rounded-lg">
                                <AvatarImage :src="data.user.avatar" :alt="data.user.name" />
                                <AvatarFallback class="rounded-lg">NS</AvatarFallback>
                            </Avatar>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-semibold">{{ data.user.name }}</span>
                                <span class="truncate text-xs">{{ data.user.email }}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Sparkles />
                            Upgrade to Pro
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <BadgeCheck />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCard />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Bell />
                            Notifications
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="handleLogout">
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
</template>