<!-- Demo file to showcase the number formatting -->
<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-center">Format Number Demo</h1>
    
    <!-- Numbers Demo -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Number Formatting Examples</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="number in sampleNumbers" :key="number" class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-600">Original: {{ number.toLocaleString() }}</div>
          <div class="text-lg font-semibold text-blue-600">Formatted: {{ formatNumber(number) }}</div>
        </div>
      </div>
    </div>

    <!-- Views and Sales Demo -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Views & Sales Formatting</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="number in sampleNumbers" :key="`views-${number}`" class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-600">{{ number.toLocaleString() }} views</div>
          <div class="text-lg font-semibold text-green-600">{{ formatViewsId(number) }}</div>
          <div class="text-lg font-semibold text-purple-600">{{ formatSalesId(number) }}</div>
        </div>
      </div>
    </div>

    <!-- Price Demo -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Price Formatting</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="price in samplePrices" :key="price" class="p-4 bg-gray-50 rounded text-center">
          <div class="text-sm text-gray-600">{{ price.toLocaleString() }}</div>
          <div class="text-lg font-semibold text-orange-600">{{ formatPrice(price) }}</div>
        </div>
      </div>
    </div>

    <!-- Product Card Example -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Product Card Example</h2>
      <div class="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
        <h3 class="font-bold text-lg mb-2">Awesome Template Premium</h3>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <span class="w-4 h-4 bg-blue-500 rounded-full inline-block"></span>
            {{ formatViewsId(sampleProduct.views) }}
          </div>
          <div class="flex items-center gap-1">
            <span class="w-4 h-4 bg-green-500 rounded-full inline-block"></span>
            {{ formatSalesId(sampleProduct.sales) }}
          </div>
          <div class="flex items-center gap-1">
            <span class="w-4 h-4 bg-orange-500 rounded-full inline-block"></span>
            {{ formatPrice(sampleProduct.price) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use formatter composable
const { formatNumber, formatViewsId, formatSalesId, formatPrice } = useFormatter()

// Sample data
const sampleNumbers = [
  42,
  156,
  999,
  1234,
  12345,
  123456,
  1234567,
  12345678,
  123456789,
  1234567890
]

const samplePrices = [
  0,
  15000,
  95000,
  250000,
  1000000,
  2500000,
  10000000,
  50000000
]

const sampleProduct = {
  views: 1234567,
  sales: 15678,
  price: 95000
}
</script>