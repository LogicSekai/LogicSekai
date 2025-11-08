<template>
  <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">User Roles</h1>
          <p class="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <Button>
          <Plus class="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Shield class="h-5 w-5 mr-2 text-red-500" />
              Superadmin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-600 mb-4">Full system access and control</p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">1 user</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <User class="h-5 w-5 mr-2 text-purple-500" />
              Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-600 mb-4">Content creation and management</p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">0 users</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Users class="h-5 w-5 mr-2 text-blue-500" />
              User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-600 mb-4">Standard user access</p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">0 users</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
</template>

<script setup lang="ts">
import { Plus, Shield, User, Users } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

// Apply superadmin middleware and layout
definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin'
})
</script>