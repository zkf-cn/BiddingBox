<script setup>
/**
 * 首页（定稿 = 原方案 A · 工具台分层）
 * 顶部 Vben 同款欢迎卡（LOGO + 时段问候 + 真实统计）；数据查询两张大卡；
 * 计费计算器一行 4 个的 entry 卡片；合规信息压成页脚三链接指向 /about。
 */
import AppIcon from '@/components/AppIcon.vue'
import { useHomeData } from '@/composables/useHomeData'
import logoUrl from '@/assets/logo.svg'
import { DATA_VERSIONS } from '@/config'
import pkg from '../../package.json'

const { calcs, queryCards } = useHomeData()

const year = new Date().getFullYear()
const appVersion = pkg.version

/** 按当前时段显示欢迎语（与 Vben 欢迎卡一致，纯前端本地时间） */
const hour = new Date().getHours()
const greetText =
  hour >= 5 && hour < 9
    ? '早上好，开始您一天的工作吧！'
    : hour >= 9 && hour < 12
      ? '上午好，费用测一测，心里有底。'
      : hour >= 12 && hour < 14
        ? '中午好，忙了一上午，歇会儿再算。'
        : hour >= 14 && hour < 18
          ? '下午好，收费标准随时查一笔。'
          : hour >= 18 && hour < 23
            ? '晚上好，晚上清静，正适合核费率。'
            : '夜深了，注意休息，数据都在本地不会丢。'
</script>

<template>
  <div class="home">
    <!-- 欢迎卡：Vben 排版 —— 左侧 LOGO+问候语，右侧统计 -->
    <header class="ha-hero">
      <div class="ha-hero-left">
        <!-- 网站 LOGO，尺寸对齐 Vben 工作台欢迎卡 size-20 = 80px -->
        <img class="ha-avatar" :src="logoUrl" alt="招标百宝箱 LOGO" />
        <div class="ha-hero-text">
          <h1 class="ha-greet">{{ greetText }}</h1>
          <p class="ha-greet-sub">纯前端本地运算 · 数据不出浏览器</p>
        </div>
      </div>
      <div class="ha-hero-stats">
        <div class="ha-stat">
          <span class="ha-stat-label">计费计算器</span>
          <span class="ha-stat-value">{{ calcs.length }}</span>
        </div>
        <div class="ha-stat">
          <span class="ha-stat-label">工期定额条目</span>
          <span class="ha-stat-value">2645</span>
        </div>
        <div class="ha-stat">
          <span class="ha-stat-label">评标专业</span>
          <span class="ha-stat-value">1793</span>
        </div>
      </div>
    </header>

    <!-- 数据查询：两张大卡 -->
    <section class="ha-block">
      <div class="ha-block-head">
        <h2 class="ha-block-title"><AppIcon name="search" :size="16" />数据查询</h2>
        <span class="text-sm text-muted">筛选检索 · 多选批量导出 · 条目收藏</span>
      </div>
      <div class="ha-query-grid">
        <RouterLink v-for="q in queryCards" :key="q.to" :to="q.to" class="ha-query">
          <span class="ha-query-icon"><AppIcon :name="q.icon" :size="21" /></span>
          <span class="ha-query-name">{{ q.name }}</span>
          <span class="ha-query-desc">{{ q.desc }}</span>
          <span class="ha-query-foot">
            <span class="badge badge-muted truncate">{{ q.meta }}</span>
            <AppIcon name="arrowRight" :size="16" />
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- 计费计算器：与首页卡片样式一致，一行 4 个 -->
    <section class="ha-block">
      <div class="ha-block-head">
        <h2 class="ha-block-title"><AppIcon name="calculator" :size="16" />计费计算器</h2>
        <span class="text-sm text-muted">{{ calcs.length }} 套</span>
      </div>
      <div class="ha-calc-grid">
        <RouterLink v-for="c in calcs" :key="c.id" :to="c.to" class="ha-card">
          <span class="ha-card-icon"><AppIcon :name="c.icon" :size="20" /></span>
          <span class="ha-card-name">{{ c.name }}</span>
          <span class="ha-card-desc">{{ c.desc }}</span>
          <span class="ha-card-foot">
            <span class="badge badge-muted truncate">{{ c.docNo }}</span>
            <span class="ha-card-go"><AppIcon name="arrowRight" :size="16" /></span>
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- 页脚：合规信息压缩为一行链接 -->
    <footer class="ha-foot">
      <span class="ha-foot-info">© {{ year }} 招标百宝箱 · v{{ appVersion }} · 数据核对至 {{ DATA_VERSIONS.fee.lastVerified }}</span>
      <span class="ha-foot-note">内置固定版本政策定额数据，仅供工作参考，正式工作以官方发布文件为准</span>
    </footer>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 欢迎卡（Vben 排版）：左侧头像+问候，右侧统计 */
.ha-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
.ha-hero-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.ha-avatar {
  flex: 0 0 80px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}
.ha-hero-text {
  min-width: 0;
}
.ha-greet {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.2px;
  margin-bottom: 5px;
}
.ha-greet-sub {
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.5;
}
.ha-hero-stats {
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 0 0 auto;
}
.ha-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.ha-stat-label {
  font-size: 12.5px;
  color: var(--muted-foreground);
  white-space: nowrap;
}
.ha-stat-value {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
}

/* 区块 */
.ha-block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.ha-block-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
  font-weight: 650;
}

/* 查询大卡 */
.ha-query-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}
.ha-query {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.ha-query:hover {
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.ha-query-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  /* 底色用中性色（与计算器卡片一致），仅图标颜色随主题色 */
  background: var(--bg-sunken);
  color: var(--primary-strong);
  margin-bottom: 12px;
}
.ha-query-name {
  font-size: 15px;
  font-weight: 650;
  margin-bottom: 6px;
  /* 卡片标题用前景色，不随主题色（对齐 Vben：深色下为固定浅色文本） */
  color: var(--foreground);
}
.ha-query-desc {
  flex: 1;
  font-size: 12.5px;
  color: var(--muted-foreground);
  line-height: 1.6;
  margin-bottom: 12px;
}
.ha-query-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  color: var(--muted-foreground);
}
.ha-query:hover .ha-query-foot {
  color: var(--primary);
}

/* 计算器卡片：一行 4 个 */
.ha-calc-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.ha-card {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}
.ha-card:hover {
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.ha-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--bg-sunken);
  color: var(--primary-strong);
  display: grid;
  place-items: center;
  margin-bottom: 12px;
}
.ha-card-name {
  font-size: 15px;
  font-weight: 650;
  margin-bottom: 6px;
  /* 卡片标题用前景色，不随主题色（对齐 Vben：深色下为固定浅色文本） */
  color: var(--foreground);
}
.ha-card-desc {
  flex: 1;
  font-size: 12.5px;
  color: var(--muted-foreground);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ha-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.ha-card-go {
  color: var(--muted-foreground);
  flex: 0 0 auto;
}
.ha-card:hover .ha-card-go {
  color: var(--primary);
}

/* 一行 4 个的响应式降级 */
@media (max-width: 1500px) {
  .ha-calc-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 1100px) {
  .ha-calc-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 页脚 */
.ha-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted-foreground);
}
.ha-foot-info {
  flex: 0 0 auto;
}
.ha-foot-note {
  text-align: right;
  line-height: 1.6;
}

@media (max-width: 760px) {
  .home {
    gap: 24px;
  }
  /* 小屏对齐 Vben 欢迎卡：头像独占一行 → 问候语 → 统计行靠右垫底 */
  .ha-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .ha-hero-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .ha-avatar {
    flex-basis: 56px;
    width: 56px;
    height: 56px;
    padding: 7px;
  }
  .ha-hero-stats {
    margin-top: 2px;
    align-self: flex-end;
    gap: 28px;
  }
  .ha-query-grid,
  .ha-calc-grid {
    grid-template-columns: 1fr;
  }
  .ha-foot {
    flex-direction: column;
    align-items: flex-start;
  }
  .ha-foot-note {
    text-align: left;
  }
}
</style>
