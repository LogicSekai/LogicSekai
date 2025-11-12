<template>
  <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <p class="text-gray-600 mt-1">System performance and usage statistics</p>
      </div>

      <!-- Statistics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <TrendingUp class="h-8 w-8 text-green-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Views</p>
                <p class="text-2xl font-bold text-gray-900">12,345</p>
                <p class="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Users class="h-8 w-8 text-blue-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Users</p>
                <p class="text-2xl font-bold text-gray-900">1,234</p>
                <p class="text-xs text-blue-600">+5% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Globe class="h-8 w-8 text-purple-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Page Views</p>
                <p class="text-2xl font-bold text-gray-900">45,678</p>
                <p class="text-xs text-purple-600">+8% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Zap class="h-8 w-8 text-yellow-500" />
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Performance</p>
                <p class="text-2xl font-bold text-gray-900">98.5%</p>
                <p class="text-xs text-green-600">+0.2% uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Chart Placeholder -->
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>Website traffic analytics for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <BarChart3 class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">Analytics chart would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
</template>

<script setup lang="ts">
import { TrendingUp, Users, Globe, Zap, BarChart3 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

// Apply superadmin middleware and layout
definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin'
})
</script>