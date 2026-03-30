# .github/workflows/ml-pipeline.yml

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐

`ML` `机器学习` `AI`

**摘要**: summary: "MLOps 是 ML 工程化关键，考察候选人对生产流程的理解"

---
---
order: 26
summary: "MLOps 是 ML 工程化关键，考察候选人对生产流程的理解"
title: "MLOps Best Practices (MLOps 最佳实践)"
category: "ML"
roles: [机器学习工程师，MLOps 工程师，算法工程师]
zones: [MLOps，工程实践]
difficulty: "⭐⭐⭐⭐"
tags: [MLOps, CI/CD, Model Registry, Pipeline, Monitoring]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
什么是 MLOps？ML 项目的 CI/CD 流程是什么？如何管理模型版本？

## 参考答案

### MLOps 核心概念

```python
mlops_definition = """
MLOps = Machine Learning + Operations

目标：
- 自动化 ML 生命周期
- 加速模型部署
- 确保模型质量
- 持续监控和维护

核心组件：
1. 版本控制 (代码、数据、模型)
2. 持续集成/持续部署 (CI/CD)
3. 模型注册表
4. 监控和日志
5. 自动化管道
"""
print(mlops_definition)
```

### ML 项目 CI/CD

```yaml
# .github/workflows/ml-pipeline.yml
# ML CI/CD 示例

name: ML Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run tests
        run: pytest tests/
      
      - name: Train model
        run: python train.py
      
      - name: Evaluate model
        run: python evaluate.py
      
      - name: Check performance threshold
        run: python check_threshold.py

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: ./deploy.sh staging
      
      - name: Run integration tests
        run: pytest tests/integration/
      
      - name: Deploy to production
        run: ./deploy.sh production
```

### 模型版本管理

```python
# 使用 MLflow
import mlflow
import mlflow.sklearn

# 设置追踪服务器
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("my_ml_experiment")

# 记录实验
with mlflow.start_run():
    # 记录参数
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    
    # 训练模型
    model = RandomForestClassifier(n_estimators=100, max_depth=10)
    model.fit(X_train, y_train)
    
    # 记录指标
    accuracy = model.score(X_test, y_test)
    mlflow.log_metric("accuracy", accuracy)
    
    # 记录模型
    mlflow.sklearn.log_model(model, "model")
    
    # 记录 artifacts
    mlflow.log_artifact("feature_importance.png")

# 模型注册表
model_uri = "runs:/<run_id>/model"
model_version = mlflow.register_model(model_uri, "my_model")

# 加载特定版本
model = mlflow.sklearn.load_model(f"models:/my_model/{model_version.version}")
```

### 监控和告警

```python
# 监控指标
monitoring_metrics = """
1. 系统指标
   - 延迟 (P50, P95, P99)
   - 吞吐量 (QPS)
   - 错误率
   - 资源使用 (CPU, GPU, 内存)

2. 模型指标
   - 预测分布变化
   - 置信度分布
   - 特征漂移

3. 业务指标
   - 转化率
   - 用户满意度
   - ROI
"""

# 告警配置
alerting_config = """
告警规则：
1. 延迟 > 100ms (P95) → 警告
2. 错误率 > 1% → 严重
3. 数据漂移检测 → 警告
4. 模型性能下降 > 5% → 严重

告警渠道：
- Slack
- Email
- PagerDuty
"""
```

## 考察重点
- ✅ 理解 MLOps 概念
- ✅ 掌握 ML CI/CD 流程
- ✅ 了解模型版本管理
- ✅ 能够设置监控
- ✅ 具备工程化思维

## 更新历史
- v1 (2026-03-29): 初始版本
