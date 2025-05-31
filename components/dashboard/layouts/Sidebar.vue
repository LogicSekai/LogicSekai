<script setup lang="ts">
import { ChevronRight, Star } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from '@/components/ui/sidebar'

const props = defineProps<{
    data: any
}>()
</script>

<template>
    <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <!-- <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <component :is="activeTeam.logo" class="size-4" />
                            </div>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-semibold">{{ activeTeam.name }}</span>
                                <span class="truncate text-xs">{{ activeTeam.plan }}</span>
                            </div>
                            <ChevronsUpDown class="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start" side="bottom" :side-offset="4">
                        <DropdownMenuLabel class="text-xs text-muted-foreground">
                            Teams
                        </DropdownMenuLabel>
                        <DropdownMenuItem v-for="(team, index) in data.teams" :key="team.name" class="gap-2 p-2"
                            @click="setActiveTeam(team)">
                            <div class="flex size-6 items-center justify-center rounded-sm border">
                                <component :is="team.logo" class="size-4 shrink-0" />
                            </div>
                            {{ team.name }}
                            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 p-2">
                            <div
                                class="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus class="size-4" />
                            </div>
                            <div class="font-medium text-muted-foreground">
                                Add team
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu> -->
                <div class="flex space-x-2 items-center group-data-[collapsible=icon]:mx-0 m-2 duration-200">
                    <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                        <Star class="size-4" />
                    </div>
                    <div class="grid flex-1 text-left text-xl leading-tight">
                        <span class="truncate font-bold">LOGIC SEKAI</span>
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
        <template v-for="sidebar in data.sidebar">
            <SidebarGroup :class="sidebar.collapsibleHidden ? 'group-data-[collapsible=icon]:hidden' : ''">
                <SidebarGroupLabel>{{ sidebar.label }}</SidebarGroupLabel>
                <SidebarMenu>
                    <Collapsible v-for="item in sidebar.items" :key="item.title" as-child :default-open="item.isActive" class="group/collapsible" >
                        <template v-if="item.items">
                            <SidebarMenuItem>
                                <CollapsibleTrigger as-child>
                                    <SidebarMenuButton :tooltip="item.title">
                                        <component :is="item.icon" />
                                        <span>{{ item.title }}</span>
                                        <ChevronRight
                                            class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                                            <SidebarMenuSubButton as-child>
                                                <a :href="subItem.url">
                                                    <span>{{ subItem.title }}</span>
                                                </a>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </template>
                        <template v-else>
                            <SidebarMenuItem>
                                <SidebarMenuButton as-child>
                                    <a :href="item.url">
                                        <component :is="item.icon" />
                                        <span>{{ item.name }}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </template>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroup>
        </template>
    </SidebarContent>
    <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <span class="text-xs">&copy; 2025 PT Senusa Teknologi Indonesia.</span>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
</template>