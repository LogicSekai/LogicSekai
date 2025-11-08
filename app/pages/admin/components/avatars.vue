<template>
    <div class="space-y-8 p-6">
        <div>
            <h1 class="text-2xl font-bold text-foreground mb-2">Avatar Components</h1>
            <p class="text-muted-foreground">Reusable avatar components with various configurations</p>
        </div>

        <!-- Basic Avatar Component -->
        <Card>
            <CardHeader>
                <CardTitle>Basic Avatar</CardTitle>
                <CardDescription>Simple avatar component with image, fallback, and various sizes</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- Sizes -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">Sizes</h3>
                    <div class="flex items-center space-x-4">
                        <Avatar src="/api/placeholder/50/50" name="John Doe" size="xs" />
                        <Avatar src="/api/placeholder/50/50" name="John Doe" size="sm" />
                        <Avatar src="/api/placeholder/50/50" name="John Doe" size="md" />
                        <Avatar src="/api/placeholder/50/50" name="John Doe" size="lg" />
                        <Avatar src="/api/placeholder/50/50" name="John Doe" size="xl" />
                        <Avatar src="/api/placeholder/50/50" name="John Doe" size="2xl" />
                    </div>
                </div>

                <!-- Shapes -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">Shapes</h3>
                    <div class="flex items-center space-x-4">
                        <Avatar src="/api/placeholder/50/50" name="Circle" size="lg" shape="circle" />
                        <Avatar src="/api/placeholder/50/50" name="Rounded" size="lg" shape="rounded" />
                        <Avatar src="/api/placeholder/50/50" name="Square" size="lg" shape="square" />
                    </div>
                </div>

                <!-- Fallbacks -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">Fallbacks (No Image)</h3>
                    <div class="flex items-center space-x-4">
                        <Avatar name="John Doe" size="lg" />
                        <Avatar name="Jane Smith" size="lg" />
                        <Avatar name="Bob Wilson" size="lg" />
                        <Avatar size="lg" />
                    </div>
                </div>

                <!-- With Status -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">With Status</h3>
                    <div class="flex items-center space-x-4">
                        <Avatar src="/api/placeholder/50/50" name="Online" size="lg" show-status status="online" />
                        <Avatar src="/api/placeholder/50/50" name="Away" size="lg" show-status status="away" />
                        <Avatar src="/api/placeholder/50/50" name="Busy" size="lg" show-status status="busy" />
                        <Avatar src="/api/placeholder/50/50" name="Offline" size="lg" show-status status="offline" />
                    </div>
                </div>

                <!-- With Badges -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">With Badges</h3>
                    <div class="flex items-center space-x-4">
                        <Avatar src="/api/placeholder/50/50" name="Badge 5" size="lg" :badge="5" />
                        <Avatar src="/api/placeholder/50/50" name="Badge 12" size="lg" :badge="12" />
                        <Avatar src="/api/placeholder/50/50" name="Badge 99+" size="lg" :badge="150" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- UserAvatar Component -->
        <Card>
            <CardHeader>
                <CardTitle>UserAvatar</CardTitle>
                <CardDescription>Enhanced avatar component for user profiles with verification and role badges</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- User Examples -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">User Examples</h3>
                    <div class="flex items-center space-x-6">
                        <!-- Superadmin -->
                        <div class="text-center">
                            <UserAvatar
                                :user="{
                                    id: '1',
                                    name: 'Super Admin',
                                    username: 'superadmin',
                                    email: 'admin@example.com',
                                    avatar: '/api/placeholder/50/50',
                                    role: 'superadmin',
                                    verified: true,
                                    created: new Date().toISOString(),
                                    updated: new Date().toISOString()
                                }"
                                size="lg"
                                show-verification-status
                                show-role-badge
                            />
                            <p class="text-xs text-muted-foreground mt-2">Superadmin</p>
                        </div>

                        <!-- Creator -->
                        <div class="text-center">
                            <UserAvatar
                                :user="{
                                    id: '2',
                                    name: 'Content Creator',
                                    username: 'creator',
                                    email: 'creator@example.com',
                                    avatar: '/api/placeholder/50/50',
                                    role: 'creator',
                                    verified: true,
                                    created: new Date().toISOString(),
                                    updated: new Date().toISOString()
                                }"
                                size="lg"
                                show-verification-status
                                show-role-badge
                            />
                            <p class="text-xs text-muted-foreground mt-2">Creator</p>
                        </div>

                        <!-- Regular User -->
                        <div class="text-center">
                            <UserAvatar
                                :user="{
                                    id: '3',
                                    name: 'Regular User',
                                    username: 'user',
                                    email: 'user@example.com',
                                    avatar: null,
                                    role: 'user',
                                    verified: false,
                                    created: new Date().toISOString(),
                                    updated: new Date().toISOString()
                                }"
                                size="lg"
                                show-verification-status
                                show-role-badge
                            />
                            <p class="text-xs text-muted-foreground mt-2">User</p>
                        </div>

                        <!-- Online User -->
                        <div class="text-center">
                            <UserAvatar
                                :user="{
                                    id: '4',
                                    name: 'Online User',
                                    username: 'online',
                                    email: 'online@example.com',
                                    avatar: '/api/placeholder/50/50',
                                    role: 'user',
                                    verified: true,
                                    created: new Date().toISOString(),
                                    updated: new Date().toISOString()
                                }"
                                size="lg"
                                show-online-status
                                show-verification-status
                                :is-online="true"
                            />
                            <p class="text-xs text-muted-foreground mt-2">Online</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- AvatarGroup Component -->
        <Card>
            <CardHeader>
                <CardTitle>AvatarGroup</CardTitle>
                <CardDescription>Display multiple avatars in a group with overflow handling</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- Different Spacings -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">Spacing Options</h3>
                    <div class="space-y-4">
                        <div>
                            <p class="text-sm text-muted-foreground mb-2">Tight spacing</p>
                            <AvatarGroup
                                :users="exampleUsers.slice(0, 4)"
                                size="md"
                                spacing="tight"
                                show-verification
                                show-roles
                                :max-visible="3"
                            />
                        </div>
                        
                        <div>
                            <p class="text-sm text-muted-foreground mb-2">Normal spacing</p>
                            <AvatarGroup
                                :users="exampleUsers.slice(0, 4)"
                                size="md"
                                spacing="normal"
                                show-verification
                                show-roles
                                :max-visible="3"
                            />
                        </div>
                        
                        <div>
                            <p class="text-sm text-muted-foreground mb-2">Loose spacing</p>
                            <AvatarGroup
                                :users="exampleUsers.slice(0, 4)"
                                size="md"
                                spacing="loose"
                                show-verification
                                show-roles
                                :max-visible="3"
                            />
                        </div>
                    </div>
                </div>

                <!-- Different Sizes -->
                <div>
                    <h3 class="text-sm font-medium text-foreground mb-3">Sizes</h3>
                    <div class="space-y-4">
                        <AvatarGroup :users="exampleUsers" size="sm" :max-visible="5" />
                        <AvatarGroup :users="exampleUsers" size="md" :max-visible="5" />
                        <AvatarGroup :users="exampleUsers" size="lg" :max-visible="5" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Usage Examples -->
        <Card>
            <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
                <CardDescription>Code examples for implementing avatar components</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="bg-muted p-4 rounded-lg">
                    <pre class="text-sm text-foreground"><code>&lt;!-- Basic Avatar --&gt;
&lt;Avatar 
  src="user.avatar" 
  :name="user.name" 
  size="md" 
  shape="circle" 
/&gt;

&lt;!-- User Avatar with Badges --&gt;
&lt;UserAvatar 
  :user="user"
  size="lg"
  show-verification-status
  show-role-badge
  show-online-status
  :is-online="user.isOnline"
  clickable
  @click="handleUserClick"
/&gt;

&lt;!-- Avatar Group --&gt;
&lt;AvatarGroup 
  :users="teamMembers"
  size="md"
  spacing="normal"
  :max-visible="3"
  show-verification
  clickable
  @user-click="handleUserClick"
/&gt;</code></pre>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import Avatar from '~/components/Avatar.vue'
import UserAvatar from '~/components/UserAvatar.vue'
import AvatarGroup from '~/components/AvatarGroup.vue'
import type { User } from '~/types'

// Example users data
const exampleUsers = computed<User[]>(() => [
    {
        id: '1',
        name: 'Alice Johnson',
        username: 'alice',
        email: 'alice@example.com',
        avatar: '/api/placeholder/50/50',
        role: 'superadmin',
        verified: true,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Bob Smith',
        username: 'bob',
        email: 'bob@example.com',
        avatar: '/api/placeholder/50/50',
        role: 'creator',
        verified: true,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Carol Williams',
        username: 'carol',
        email: 'carol@example.com',
        avatar: null,
        role: 'user',
        verified: false,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: '4',
        name: 'David Brown',
        username: 'david',
        email: 'david@example.com',
        avatar: '/api/placeholder/50/50',
        role: 'user',
        verified: true,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: '5',
        name: 'Eva Davis',
        username: 'eva',
        email: 'eva@example.com',
        avatar: '/api/placeholder/50/50',
        role: 'creator',
        verified: true,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: '6',
        name: 'Frank Wilson',
        username: 'frank',
        email: 'frank@example.com',
        avatar: null,
        role: 'user',
        verified: false,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    }
])
</script>