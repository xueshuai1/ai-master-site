# 🎯 AI 学习路线

> 从零基础到 AI 工程师的完整学习路径

---

## 📋 学习路线图

```
数学基础 → 机器学习 → 深度学习 → 专业方向 (LLM/CV/NLP/RL) → AI 工程化
```

---

## 一、数学基础（必修）

### 1.1 线性代数
- 向量与矩阵运算
- 特征值与特征向量
- 矩阵分解（SVD、PCA）

### 1.2 微积分
- 导数与偏导数
- 梯度与梯度下降
- 链式法则

### 1.3 概率论
- 概率分布
- 贝叶斯定理
- 最大似然估计

---

## 二、机器学习（81 篇）⭐⭐⭐

### 2.1 监督学习
- **回归算法**
  - 线性回归
  - 逻辑回归
- **分类算法**
  - 决策树
  - 随机森林
  - SVM（支持向量机）
  - KNN（K 近邻）
  - 朴素贝叶斯

### 2.2 集成学习
- Bagging
- Boosting（AdaBoost、GBDT、XGBoost、LightGBM、CatBoost）
- Stacking
- Voting

### 2.3 无监督学习
- **聚类**
  - K-Means
  - DBSCAN
  - 层次聚类
- **降维**
  - PCA
  - t-SNE
  - UMAP
  - LDA

### 2.4 特征工程
- 特征选择
- 特征提取
- 特征缩放
- One-Hot 编码
- 标签编码

### 2.5 模型评估
- 交叉验证
- 混淆矩阵
- ROC/AUC
- 精确率、召回率、F1 分数

---

## 三、深度学习（57 篇）⭐⭐⭐⭐

### 3.1 神经网络基础
- 感知机
- 多层感知机（MLP）
- 反向传播
- 激活函数（ReLU、Sigmoid、Tanh、GELU）
- 损失函数
- 优化器（SGD、Adam、AdamW）

### 3.2 卷积神经网络（CNN）
- **基础组件**
  - 卷积层
  - 池化层
  - BatchNorm/LayerNorm
  - 残差连接
  - 跳跃连接
- **经典架构**
  - AlexNet
  - VGG
  - GoogLeNet/Inception
  - ResNet
  - DenseNet
  - EfficientNet
  - MobileNet
  - ShuffleNet

### 3.3 序列模型
- RNN
- LSTM
- GRU
- Bidirectional RNN
- Seq2Seq

### 3.4 Attention 机制
- Self-Attention
- Multi-Head Attention
- Transformer 架构

---

## 四、大语言模型（75 篇）⭐⭐⭐⭐⭐

### 4.1 Transformer 基础
- Transformer 架构
- Self-Attention
- Multi-Head Attention
- Positional Encoding
- LayerNorm/RMSNorm
- Feed-Forward Network
- Encoder-Decoder

### 4.2 Attention 变体
- Causal Attention
- Bidirectional Attention
- Sparse Attention
- Linear Attention
- Flash Attention
- Paged Attention
- Grouped Query Attention

### 4.3 Tokenization
- BPE
- WordPiece
- SentencePiece

### 4.4 预训练
- 预训练目标
- Masked LM
- Causal LM
- Next Sentence Prediction
- 数据清洗

### 4.5 模型微调
- 全量微调
- LoRA/QLoRA
- Prefix Tuning
- P-Tuning
- Adapter
- IA3/DoRA/ReLoRA

### 4.6 对齐技术
- RLHF
- PPO
- DPO
- IPO
- SimPO

### 4.7 推理优化
- 量化（INT8/INT4）
- 剪枝
- 蒸馏
- Continuous Batching
- KV Cache
- Speculative Decoding

### 4.8 高级主题
- MoE（Mixture of Experts）
- RoPE（旋转位置编码）
- ALiBi
- 长上下文处理

---

## 五、计算机视觉（50 篇）⭐⭐⭐⭐

### 5.1 图像分类
- CNN 基础
- 经典架构（ResNet、EfficientNet 等）
- Vision Transformer

### 5.2 目标检测
- R-CNN 系列（R-CNN、Fast R-CNN、Faster R-CNN）
- Mask R-CNN
- YOLO 系列
- SSD
- RetinaNet
- FCOS
- DETR
- Swin Transformer

### 5.3 图像分割
- 语义分割
- 实例分割

### 5.4 其他任务
- 图像生成
- 风格迁移
- 超分辨率

---

## 六、自然语言处理（10 篇）⭐⭐⭐

### 6.1 基础任务
- 文本分类
- 情感分析
- 命名实体识别（NER）

### 6.2 序列标注
- POS Tagging
- Chunking

### 6.3 文本生成
- 机器翻译
- 文本摘要
- 对话系统

---

## 七、强化学习（35 篇）⭐⭐⭐⭐

### 7.1 基础概念
- MDP（马尔可夫决策过程）
- 价值函数
- 策略梯度

### 7.2 经典算法
- Q-Learning
- SARSA
- DQN
- Policy Gradient
- Actor-Critic
- A3C/A2C
- PPO
- SAC
- TD3

### 7.3 高级主题
- Multi-Agent RL
- Inverse RL
- Meta RL

---

## 八、推荐系统（7 篇）⭐⭐⭐

### 8.1 基础算法
- 协同过滤
- 矩阵分解

### 8.2 深度学习推荐
- Neural CF
- Wide & Deep
- DeepFM

---

## 九、AI 工程化（20 篇）⭐⭐⭐⭐⭐

### 9.1 分布式训练
- 数据并行
- 模型并行
- 流水线并行
- ZeRO

### 9.2 模型部署
- ONNX
- TensorRT
- OpenVINO

### 9.3 MLOps
- 模型版本管理
- 持续训练
- 模型监控

### 9.4 Prompt Engineering
- Prompt 设计原则
- Few-Shot Prompting
- Chain of Thought
- ReAct
- RAG 架构

---

## 📅 学习建议

### 阶段一：基础（1-2 个月）
- ✅ 数学基础复习
- ✅ 机器学习核心算法
- ✅ Python 编程 + sklearn

### 阶段二：深度学习（2-3 个月）
- ✅ 神经网络基础
- ✅ CNN + PyTorch/TensorFlow
- ✅ 经典论文阅读

### 阶段三：专业方向（3-6 个月）
- 选择 1-2 个方向深入
- LLM 方向：Transformer → 预训练 → 微调 → 推理优化
- CV 方向：CNN → 目标检测 → 图像分割
- NLP 方向：RNN → Transformer → BERT → GPT

### 阶段四：工程实践（持续）
- 参与开源项目
- 实战项目
- AI 工程化技能

---

## 📚 资源推荐

### 课程
- 吴恩达机器学习
- 李飞飞 CS231n（CV）
- 李宏毅深度学习
- Stanford CS224n（NLP）

### 书籍
- 《机器学习》（周志华）
- 《深度学习》（花书）
- 《动手学深度学习》

### 实践平台
- Kaggle
- Hugging Face
- Papers With Code

---

**总计：335 篇知识点，覆盖 AI 全栈技能树** 🚀
