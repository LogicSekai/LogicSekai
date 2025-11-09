<template>
    <DropdownMenu v-if="user">
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                <Avatar class="h-8 w-8">
                    <AvatarImage 
                        :src="user.avatar || ''" 
                        :alt="user.name || 'User'" 
                    />
                    <AvatarFallback class="bg-primary text-primary-foreground">
                        {{ user.name?.[0]?.toUpperCase() || 'U' }}
                    </AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="end" :sideOffset="5">
            <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col space-y-1">
                    <p class="text-sm font-medium leading-none">{{ user.name }}</p>
                    <p class="text-xs leading-none text-muted-foreground">{{ user.email }}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem @click="$router.push('/profile')">
                    <User class="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem @click="$router.push('/dashboard')">
                    <LayoutGrid class="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="user.role === 'creator' || user.role === 'superadmin'" @click="$router.push('/creator')">
                    <Palette class="mr-2 h-4 w-4" />
                    <span>Creator</span>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="user.role === 'superadmin'" @click="$router.push('/admin')">
                    <Shield class="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                </DropdownMenuItem>
                <DropdownMenuItem @click="$router.push('/settings')">
                    <Settings class="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout" class="text-destructive focus:text-destructive">
                <LogOut class="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>

    <div v-else class="flex items-center space-x-2">
        <Button variant="ghost" @click="$router.push('/auth/login')">
            Log in
        </Button>
        <Button @click="$router.push('/auth/register')">
            Sign up
        </Button>
    </div>
</template>

<script setup lang="ts">
import { 
    User, 
    Settings, 
    Shield, 
    LogOut,
    LayoutGrid,
    Palette,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

// Auth state
const { user, isLoggedIn, logout } = useAuth()
</script>