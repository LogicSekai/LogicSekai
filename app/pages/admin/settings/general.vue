<template>
  <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
        <p class="text-gray-600 mt-1">Configure general system preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Site Configuration -->
        <Card>
          <CardHeader>
            <CardTitle>Site Configuration</CardTitle>
            <CardDescription>Basic site settings and information</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <Input placeholder="Logic Sekai" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <Input placeholder="A platform for logical thinking" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <Input placeholder="https://logicsekai.com" />
            </div>
            <Button class="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        <!-- Maintenance Mode -->
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>Enable maintenance mode for system updates</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Maintenance Mode</p>
                <p class="text-sm text-gray-600">Temporarily disable site access</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Off</span>
                <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
                  <span class="sr-only">Enable maintenance mode</span>
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
                <span class="text-sm text-gray-500">On</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
              <textarea 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="We are currently performing maintenance. Please check back later."
              ></textarea>
            </div>
            <Button variant="outline" class="w-full">Update Maintenance Settings</Button>
          </CardContent>
        </Card>

        <!-- Email Settings -->
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure email notifications and SMTP</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <Input placeholder="smtp.gmail.com" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <Input placeholder="587" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>None</option>
                </select>
              </div>
            </div>
            <Button variant="outline" class="w-full">Test Email Configuration</Button>
          </CardContent>
        </Card>

        <!-- System Information -->
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and version info</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-600">Version</span>
              <span class="text-sm text-gray-900">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-600">Environment</span>
              <span class="text-sm text-gray-900">Development</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-600">Database</span>
              <span class="text-sm text-gray-900">SQLite</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium text-gray-600">Uptime</span>
              <span class="text-sm text-gray-900">2 hours 15 minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

// Apply superadmin middleware and layout
definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin'
})
</script>