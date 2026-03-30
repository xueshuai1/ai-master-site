# Swin Transformer

> **分类**: 计算机视觉 | **编号**: 030 | **更新时间**: 2026-03-30 | **难度**: ⭐

`CV` `Transformer` `Attention` `CNN`

**摘要**: Swin Transformer 是由 Microsoft Research 的 Ze Liu 等人于 2021 年提出的层次化 Vision Transformer。

---
## 概述

Swin Transformer 是由 Microsoft Research 的 Ze Liu 等人于 2021 年提出的层次化 Vision Transformer。Swin Transformer 通过滑动窗口机制和层次化设计，将 Transformer 成功应用于密集预测任务（检测、分割），成为通用视觉 backbone。

## 核心创新

### 从 ViT 到 Swin

```mermaid
graph TB
    A[ViT] --> B[全局注意力]
    B --> C[计算复杂度 O(N²)]
    B --> D[单尺度特征]
    
    E[Swin] --> F[窗口注意力]
    F --> G[计算复杂度 O(N)]
    F --> H[多尺度特征]
    
    style E fill:#c8e6c9
    style F fill:#c8e6c9
    style G fill:#bbdefb
```

### 关键设计

1. **层次化特征**：类似 CNN 的特征金字塔
2. **滑动窗口**：局部注意力 + 跨窗口连接
3. **相对位置编码**：更好的泛化能力

## Swin Transformer 架构

### 整体结构

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class WindowAttention(nn.Module):
    def __init__(self, dim, window_size, num_heads):
        super().__init__()
        self.dim = dim
        self.window_size = window_size
        self.num_heads = num_heads
        
        self.qkv = nn.Linear(dim, dim * 3)
        self.proj = nn.Linear(dim, dim)
        
        # 相对位置编码
        coords = torch.meshgrid(torch.arange(window_size[0]), 
                               torch.arange(window_size[1]))
        coords_flatten = torch.stack([coords[0].flatten(), coords[1].flatten()], 0)
        relative_coords = coords_flatten[:, :, None] - coords_flatten[:, None, :]
        relative_coords = relative_coords.permute(1, 2, 0).contiguous()
        relative_coords[:, :, 0] += window_size[0] - 1
        relative_coords[:, :, 1] += window_size[1] - 1
        relative_coords[:, :, 0] *= 2 * window_size[1] - 1
        relative_position_index = relative_coords.sum(-1)
        self.register_buffer("relative_position_index", relative_position_index)
        
        self.relative_position_bias_table = nn.Parameter(
            torch.zeros((2 * window_size[0] - 1) * (2 * window_size[1] - 1), num_heads)
        )
        
        self.softmax = nn.Softmax(dim=-1)
    
    def forward(self, x, mask=None):
        B_, N, C = x.shape
        
        # QKV
        qkv = self.qkv(x).reshape(B_, N, 3, self.num_heads, C // self.num_heads).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        # 注意力
        q = q * (C // self.num_heads) ** -0.5
        attn = q @ k.transpose(-2, -1)
        
        # 相对位置编码
        relative_position_bias = self.relative_position_bias_table[
            self.relative_position_index.view(-1)
        ].view(self.window_size[0] * self.window_size[1], 
               self.window_size[0] * self.window_size[1], -1)
        relative_position_bias = relative_position_bias.permute(2, 0, 1).contiguous()
        attn = attn + relative_position_bias.unsqueeze(0)
        
        # Mask
        if mask is not None:
            nW = mask.shape[0]
            attn = attn.view(B_ // nW, nW, self.num_heads, N, N) + mask.unsqueeze(1).unsqueeze(0)
            attn = attn.view(-1, self.num_heads, N, N)
        
        attn = self.softmax(attn)
        
        # 输出
        x = (attn @ v).transpose(1, 2).reshape(B_, N, C)
        x = self.proj(x)
        
        return x

class SwinTransformerBlock(nn.Module):
    def __init__(self, dim, num_heads, window_size=7, shift_size=0):
        super().__init__()
        self.dim = dim
        self.window_size = window_size
        self.shift_size = shift_size
        
        self.norm1 = nn.LayerNorm(dim)
        self.attn = WindowAttention(dim, (window_size, window_size), num_heads)
        
        self.norm2 = nn.LayerNorm(dim)
        self.mlp = nn.Sequential(
            nn.Linear(dim, dim * 4),
            nn.GELU(),
            nn.Linear(dim * 4, dim)
        )
    
    def forward(self, x, H, W):
        B, L, C = x.shape
        
        # 残差连接
        shortcut = x
        x = self.norm1(x)
        x = x.view(B, H, W, C)
        
        # 循环移位
        if self.shift_size > 0:
            x = torch.roll(x, shifts=(-self.shift_size, -self.shift_size), dims=(1, 2))
        
        # 窗口划分
        x = x.view(B, H // self.window_size, self.window_size, 
                  W // self.window_size, self.window_size, C)
        x = x.permute(0, 1, 3, 2, 4, 5).contiguous()
        x = x.view(-1, self.window_size * self.window_size, C)
        
        # 窗口注意力
        x = self.attn(x)
        
        # 窗口合并
        x = x.view(B, H // self.window_size, W // self.window_size, 
                  self.window_size, self.window_size, C)
        x = x.permute(0, 1, 3, 2, 4, 5).contiguous()
        x = x.view(B, H, W, C)
        
        # 逆移位
        if self.shift_size > 0:
            x = torch.roll(x, shifts=(self.shift_size, self.shift_size), dims=(1, 2))
        
        x = x.view(B, L, C)
        x = shortcut + x
        
        # FFN
        x = x + self.mlp(self.norm2(x))
        
        return x

class PatchMerging(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim
        self.reduction = nn.Linear(4 * dim, 2 * dim, bias=False)
        self.norm = nn.LayerNorm(4 * dim)
    
    def forward(self, x, H, W):
        B, L, C = x.shape
        
        x = x.view(B, H, W, C)
        
        # 2×2 合并
        x0 = x[:, 0::2, 0::2, :]
        x1 = x[:, 1::2, 0::2, :]
        x2 = x[:, 0::2, 1::2, :]
        x3 = x[:, 1::2, 1::2, :]
        
        x = torch.cat([x0, x1, x2, x3], -1)
        x = x.view(B, -1, 4 * C)
        
        x = self.norm(x)
        x = self.reduction(x)
        
        return x, H // 2, W // 2

class SwinTransformer(nn.Module):
    def __init__(self, img_size=224, patch_size=4, 
                 embed_dim=96, depths=[2, 2, 6, 2], 
                 num_heads=[3, 6, 12, 24], num_classes=1000):
        super().__init__()
        
        # Patch 嵌入
        self.patch_embed = nn.Conv2d(3, embed_dim, patch_size, patch_size)
        
        # 4 个 Stage
        self.layers = nn.ModuleList()
        for i_layer in range(4):
            layer = nn.ModuleList()
            for i_block in range(depths[i_layer]):
                layer.append(SwinTransformerBlock(
                    dim=int(embed_dim * 2 ** i_layer),
                    num_heads=num_heads[i_layer],
                    window_size=7,
                    shift_size=0 if i_block % 2 == 0 else 3
                ))
            
            if i_layer < 3:
                layer.append(PatchMerging(int(embed_dim * 2 ** i_layer)))
            
            self.layers.append(layer)
        
        self.norm = nn.LayerNorm(int(embed_dim * 2 ** 3))
        self.avgpool = nn.AdaptiveAvgPool1d(1)
        self.head = nn.Linear(int(embed_dim * 2 ** 3), num_classes)
    
    def forward(self, x):
        # Patch 嵌入
        x = self.patch_embed(x)
        B, C, H, W = x.shape
        x = x.flatten(2).transpose(1, 2)
        
        # Stages
        for layer in self.layers:
            for module in layer:
                if isinstance(module, PatchMerging):
                    x, H, W = module(x, H, W)
                else:
                    x = module(x, H, W)
        
        x = self.norm(x)
        x = self.avgpool(x.transpose(1, 2))
        x = torch.flatten(x, 1)
        x = self.head(x)
        
        return x

# 创建 Swin Transformer 变体
def swin_tiny():
    return SwinTransformer(embed_dim=96, depths=[2, 2, 6, 2], num_heads=[3, 6, 12, 24])

def swin_small():
    return SwinTransformer(embed_dim=96, depths=[2, 2, 18, 2], num_heads=[3, 6, 12, 24])

def swin_base():
    return SwinTransformer(embed_dim=128, depths=[2, 2, 18, 2], num_heads=[4, 8, 16, 32])

def swin_large():
    return SwinTransformer(embed_dim=192, depths=[2, 2, 18, 2], num_heads=[6, 12, 24, 48])

# 测试
model = swin_tiny()
x = torch.randn(1, 3, 224, 224)
output = model(x)
print(f"Swin-T: {x.shape} -> {output.shape}")
print(f"参数量：{sum(p.numel() for p in model.parameters()):,}")
```

## 变体对比

| 模型 | 深度 | 维度 | 参数量 | FLOPs | Top-1 |
|-----|------|------|--------|-------|-------|
| Swin-T | [2,2,6,2] | 96 | 29M | 4.5G | 81.3% |
| Swin-S | [2,2,18,2] | 96 | 50M | 8.7G | 83.2% |
| Swin-B | [2,2,18,2] | 128 | 88M | 15.4G | 83.5% |
| Swin-L | [2,2,18,2] | 192 | 197M | 34.5G | 84.5% |

## 应用

### 目标检测

```python
# 使用 Swin 作为检测 backbone
from mmdet.models import SwinTransformer

backbone = SwinTransformer(
    embed_dim=128,
    depths=[2, 2, 18, 2],
    num_heads=[4, 8, 16, 32],
    window_size=7,
    out_indices=(0, 1, 2, 3)
)
```

### 图像分割

```python
# 使用 Swin 作为分割 backbone
from mmseg.models import SwinTransformer

backbone = SwinTransformer(
    embed_dim=128,
    depths=[2, 2, 18, 2],
    num_heads=[4, 8, 16, 32],
    window_size=7,
    out_indices=(0, 1, 2, 3)
)
```

## 总结

Swin Transformer 通过层次化设计和滑动窗口注意力，将 Transformer 成功应用于密集预测任务，成为通用视觉 backbone。其设计思想（局部注意力、层次化特征）深刻影响了后续 Vision Transformer 的发展。
