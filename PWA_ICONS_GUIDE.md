# PWA 图标生成说明

## 当前状态
PWA manifest.json 需要以下图标文件：
- `/icon-192.png` (192x192 像素)
- `/icon-512.png` (512x512 像素)

## 生成图标的方法

### 方法 1: 在线工具
1. 访问 https://www.pwabuilder.com/imageGenerator
2. 上传你的原始图标（至少 512x512px）
3. 下载生成的所有尺寸图标
4. 将 `icon-192.png` 和 `icon-512.png` 放到 `public/` 目录

### 方法 2: 设计工具
使用 Figma/Photoshop/Illustrator 设计：
- **主题**: 自行车齿轮/车轮图标
- **颜色**: 霓虹青色 (#00FFFF) 在深色背景 (#0f172a)
- **风格**: 极简、现代、科技感
- **导出**: PNG格式，192x192 和 512x512

### 方法 3: 临时占位符
使用 favicon.ico 转换为 PNG 并调整大小（临时解决方案）

## 完成后
确保图标文件位于：
- `public/icon-192.png`
- `public/icon-512.png`

然后重新构建项目：
```bash
npm run build
```
