<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { debounce } from "lodash-es";

const searchKeyword = ref("");
const isSearchFocused = ref(false);

const emit = defineEmits<{
  (e: "search", keyword: string): void;
}>();

const handleSearch = debounce(() => {
  emit("search", searchKeyword.value);
}, 300);

const hotKeywords = ['新品上市', '限时特惠', '热销商品', '品牌精选'];
</script>

<template>
  <div class="search-container" :class="{ 'is-focused': isSearchFocused }">
    <el-input
      v-model="searchKeyword"
      placeholder="搜索商品..."
      class="search-input"
      @input="handleSearch"
      @focus="isSearchFocused = true"
      @blur="isSearchFocused = false"
    >
      <template #prefix>
        <el-icon class="search-icon"><Search /></el-icon>
      </template>
    </el-input>
    <div class="hot-keywords">
      <span class="hot-label">热门搜索：</span>
      <a href="#" v-for="keyword in hotKeywords" :key="keyword" class="hot-keyword">
        {{ keyword }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  background: rgba(6, 5, 36, 0.95);
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.search-container.is-focused {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-input {
  width: 100%;
}

:deep(.el-input__wrapper) {
  padding: 8px 15px;
  border-radius: 8px;
}

.search-icon {
  font-size: 18px;
  color: #999;
}

.hot-keywords {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.hot-label {
  margin-right: 10px;
}

.hot-keyword {
  color: #666;
  text-decoration: none;
  margin-right: 15px;
  transition: color 0.3s;
}

.hot-keyword:hover {
  color: var(--el-color-primary);
}
</style>