# Number Formatting System - Logic Sekai

## Overview

Sistem formatting angka di Logic Sekai menggunakan composable `useFormatter()` yang menyediakan berbagai utility function untuk memformat angka agar lebih mudah dibaca dan konsisten di seluruh aplikasi.

## Features

### 1. Format Numbers (Compact)
Mengubah angka besar menjadi format yang lebih kompak dan mudah dibaca:

- `1,234` → `1.2K`
- `1,000,000` → `1M`
- `1,500,000` → `1.5M`
- `2,000,000,000` → `2B`

### 2. Format Views & Sales
Specialized formatting untuk views dan sales dengan suffix yang sesuai:

- `formatViewsId(1234)` → `1.2K dilihat`
- `formatSalesId(5678)` → `5.7K terjual`

### 3. Format Price (Indonesian Rupiah)
Format harga dalam mata uang Rupiah:

- `formatPrice(0)` → `Gratis`
- `formatPrice(95000)` → `Rp 95.000`
- `formatPrice(1000000)` → `Rp 1.000.000`

### 4. Format Date & Time
Format tanggal dalam bahasa Indonesia:

- `formatDate('2024-01-15')` → `15 Januari 2024`
- `formatDateTime('2024-01-15T10:30:00')` → `15 Januari 2024, 10.30`

## Usage

### Import Composable
```vue
<script setup lang="ts">
// Import formatter composable
const { formatNumber, formatViewsId, formatSalesId, formatPrice, formatDate } = useFormatter()
</script>
```

### In Templates
```vue
<template>
  <div>
    <!-- Views count -->
    <span>{{ formatViewsId(product.totalViews) }}</span>
    
    <!-- Sales count -->
    <span>{{ formatSalesId(product.totalSales) }}</span>
    
    <!-- Price -->
    <span>{{ formatPrice(product.basePrice) }}</span>
    
    <!-- General numbers -->
    <span>{{ formatNumber(1234567) }}</span> <!-- Shows: 1.2M -->
  </div>
</template>
```

## Files Updated

### Core Files
- `app/composables/useFormatter.ts` - Main formatter composable
- `app/lib/utils.ts` - Updated with formatter functions

### Product Pages
- `app/pages/products/[creator]/[slug].vue` - Product detail page
- `app/pages/products/index.vue` - Products listing
- `app/pages/creator/products/index.vue` - Creator products management

### Components
- `app/components/products/ProductCard.vue` - Product card component

### API Endpoints
- `server/api/products/[slug].get.ts` - Single product API
- `server/api/products/index.get.ts` - Products list API
- `server/api/products/[creator]/[slug].get.ts` - Product by creator API

## Examples

### Before (Hardcoded)
```vue
<span>{{ product.totalViews || 0 }} Dilihat</span>
<span>{{ product.totalSales || 0 }} Terjual</span>
```

### After (Formatted)
```vue
<span>{{ formatViewsId(product.totalViews || 0) }}</span>
<span>{{ formatSalesId(product.totalSales || 0) }}</span>
```

### Results
- `1234 Dilihat` → `1.2K dilihat`
- `5678 Terjual` → `5.7K terjual`
- `1000000 Dilihat` → `1M dilihat`

## Benefits

1. **Consistent Formatting**: Semua angka menggunakan format yang sama di seluruh aplikasi
2. **Better UX**: Angka besar lebih mudah dibaca (1.2M vs 1,234,567)
3. **Maintainable**: Centralized formatting logic
4. **Flexible**: Support multiple formats (views, sales, price, dates)
5. **Localized**: Format sesuai dengan bahasa Indonesia

## Demo

Lihat demo lengkap di: `/demo/format-numbers`

## Testing Values

Format number examples:
- `42` → `42`
- `1,234` → `1.2K` 
- `1,234,567` → `1.2M`
- `1,234,567,890` → `1.2B`

Views examples:
- `156 views` → `156 dilihat`
- `1,234 views` → `1.2K dilihat`
- `1,000,000 views` → `1M dilihat`

Sales examples:
- `42 sales` → `42 terjual`
- `5,678 sales` → `5.7K terjual`
- `2,500,000 sales` → `2.5M terjual`