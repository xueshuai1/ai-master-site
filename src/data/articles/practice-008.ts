import { Article } from '../knowledge';

export const article: Article = {
    id: "practice-008",
    title: "AI 在金融科技中的应用",
    category: "practice",
    tags: ["金融科技", "风控", "量化交易"],
    summary: "从风控到量化交易，掌握 AI 在金融科技中的核心应用",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 金融科技 AI 概览：从规则驱动到智能驱动",
            body: `金融科技正在经历由 AI 驱动的深刻变革。传统金融系统建立在人工规则和经验判断之上，而现代金融科技公司已经将 AI 嵌入到信贷审批、风险管理、投资交易、合规审查等每一个核心环节。

根据麦肯锡 2025 年的报告，全球前 100 家银行中超过 80% 已经在至少一个业务流程中部署了 AI 系统。AI 在金融领域的核心价值体现在三个方面：第一是处理速度，AI 可以在毫秒级分析数千维特征并做出决策，而传统方法需要数分钟甚至数小时；第二是模式识别，深度学习模型能够发现人类分析师无法察觉的非线性关系和微弱信号；第三是可扩展性，一套训练好的模型可以同时服务百万级用户，边际成本趋近于零。

金融科技 AI 的技术栈正在从传统的统计机器学习向深度学习、大语言模型和强化学习演进。早期应用以逻辑回归和决策树为主，用于信用评分和欺诈检测。如今的系统则整合了 **Transformer** 架构处理非结构化数据、图神经网络捕捉关联交易网络、以及强化学习优化投资组合。`,
            code: [
                {
                    lang: "python",
                    code: `# 金融科技 AI 技术栈全景
from enum import Enum

class AITechnology(Enum):
    # 传统 ML - 仍然在结构化数据上表现优异
    LOGISTIC_REGRESSION = "信用评分卡"
    GRADIENT_BOOSTING = "XGBoost / LightGBM - 欺诈检测"
    RANDOM_FOREST = "客户分群"
    # 深度学习 - 处理复杂模式
    TRANSFORMER = "金融文本分析、舆情挖掘"
    GRAPH_NN = "关联交易网络分析"
    LSTM = "时间序列预测"
    # 前沿技术
    LLM = "智能客服、合规文档审查"
    REINFORCEMENT_LEARNING = "算法交易、投资组合优化"
    GAN = "合成金融数据生成、压力测试"

def select_model(data_type: str, task: str, data_size: int) -> str:
    if task == "fraud_detection":
        return "LightGBM" if data_size < 1_000_000 else "GraphSAGE"
    elif task == "credit_scoring":
        return "LogisticRegression" if data_size < 100_000 else "XGBoost"
    elif task == "algorithmic_trading":
        return "PPO" if data_type == "time_series" else "LSTM"
    else:
        return "BERT-Finance"`
                },
                {
                    lang: "python",
                    code: `# 金融科技 AI 系统架构
class FinTechAISystem:
    """典型的金融科技 AI 系统架构"""
    
    def __init__(self):
        self.data_layer = {
            "structured": ["交易记录", "账户信息", "征信数据"],
            "unstructured": ["新闻", "财报", "社交媒体", "合同文本"],
            "alternative": ["卫星图像", "供应链数据", "支付流水"],
        }
        self.feature_store = {}
        self.model_registry = {}
        self.monitoring = {}
        
    def pipeline(self, raw_data):
        """端到端 AI 处理流水线"""
        features = self.feature_engineering(raw_data)
        predictions = self.model_inference(features)
        decisions = self.business_rules(predictions)
        self.log_decision(decisions)
        return decisions
        
    def model_inference(self, features):
        """多模型集成推理"""
        model_a = self.model_registry["fraud_model_v3"]
        model_b = self.model_registry["credit_model_v7"]
        return {
            "fraud_score": model_a.predict(features),
            "credit_score": model_b.predict(features),
        }`
                }
            ],
            table: {
                headers: ["技术领域", "传统方法", "AI 方法", "性能提升"],
                rows: [
                    ["信用评估", "FICO 评分卡", "深度学习 + 替代数据", "违约预测 AUC 提升 15-25%"],
                    ["欺诈检测", "规则引擎", "图神经网络 + 异常检测", "欺诈召回率提升 40%"],
                    ["算法交易", "技术指标策略", "强化学习优化", "年化收益提升 5-12%"],
                    ["智能投顾", "人工理财顾问", "ML 驱动资产配置", "服务成本降低 90%"],
                    ["合规审查", "人工审核", "NLP 自动审查", "处理效率提升 10 倍"],
                ],
            },
            mermaid: `graph TD
    A["数据源"] --> B["数据清洗\n特征工程"]
    B --> C["模型训练"]
    C --> D["模型部署"]
    D --> E["实时推理"]
    E --> F["业务决策"]
    F --> G["结果反馈"]
    G --> C
    E --> H["模型监控"]
    H -->|漂移检测| C
    H -->|告警| I["人工介入"]`,
            tip: "金融 AI 项目成功的关键不是模型复杂度，而是数据质量和业务理解。一个基于高质量特征工程的简单模型，往往胜过数据质量差情况下的深度学习。",
            warning: "金融领域的 AI 模型必须满足可解释性要求。监管机构要求银行能够解释每一笔信贷决策的依据，黑盒模型在关键场景中可能被拒绝使用。",
        },
        {
            title: "2. 信用风险评估：从评分卡到深度学习",
            body: `信用风险评估是金融行业最核心的 AI 应用场景之一。传统信用评分依赖于 FICO 评分卡体系，使用有限的结构化变量通过逻辑回归模型计算分数。这种方法稳定可靠但存在明显局限：无法处理非结构化数据、难以捕捉非线性关系、对新用户效果差。

深度学习正在改变这一局面。现代信用评估系统整合了多源替代数据，包括用户的消费行为模式、社交媒体行为、手机使用习惯、甚至地理位置数据。这些替代特征对于缺乏传统信用记录的信用白户尤其重要。在中国，蚂蚁金服的芝麻信用和腾讯的微信支付分已经证明了替代数据在信用评估中的巨大价值。

技术实现上，主流方案从逻辑回归演进到梯度提升树，再发展到深度神经网络。XGBoost 在结构化表格数据上的表现通常优于简单的深度网络，但对于高维稀疏特征和序列数据，基于 Attention 的深度学习架构展现出明显优势。最新的研究方向是将图神经网络应用于信用评估，通过借款人的社交关系和交易网络来推断信用风险。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 XGBoost 构建信用风险评估模型
import xgboost as xgb
from sklearn.metrics import roc_auc_score
import numpy as np

def build_credit_model(X_train, y_train, X_val, y_val):
    """训练信用风险评估模型"""
    # 处理类别不平衡 - 金融数据中违约样本通常不到 5%
    n_positive = y_train.sum()
    n_negative = len(y_train) - n_positive
    scale_pos_weight = n_negative / max(n_positive, 1)
    
    params = {
        "objective": "binary:logistic",
        "eval_metric": "auc",
        "max_depth": 6,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.7,
        "scale_pos_weight": scale_pos_weight,
        "min_child_weight": 50,
    }
    
    dtrain = xgb.DMatrix(X_train, label=y_train)
    dval = xgb.DMatrix(X_val, label=y_val)
    
    model = xgb.train(
        params, dtrain, num_boost_round=1000,
        evals=[(dtrain, "train"), (dval, "val")],
        early_stopping_rounds=50,
        verbose_eval=100,
    )
    return model

# 模型解释性 - SHAP 值分析
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_val)`
                },
                {
                    lang: "python",
                    code: `# 使用图神经网络进行关联信用评估
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

class CreditGNN(nn.Module):
    """基于图神经网络的信用评估模型
    
    核心思想：借款人的信用风险不仅取决于自身特征，
    还与其关联人的信用状况相关（社交传染效应）
    """
    
    def __init__(self, node_features: int, hidden: int = 128):
        super().__init__()
        self.conv1 = SAGEConv(node_features, hidden)
        self.conv2 = SAGEConv(hidden, hidden)
        self.classifier = nn.Sequential(
            nn.Linear(hidden, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
        )
        
    def forward(self, x, edge_index):
        """
        x: 节点特征矩阵 [N, node_features]
        edge_index: 边索引 [2, E] - 关联关系
        """
        h = F.relu(self.conv1(x, edge_index))
        h = F.dropout(h, p=0.3, training=self.training)
        h = F.relu(self.conv2(h, edge_index))
        return torch.sigmoid(self.classifier(h)).squeeze(-1)`
                }
            ],
            table: {
                headers: ["模型类型", "适用场景", "优点", "缺点"],
                rows: [
                    ["逻辑回归评分卡", "传统银行信贷、监管合规", "高度可解释、监管友好", "只能捕捉线性关系"],
                    ["XGBoost / LightGBM", "消费金融、互联网信贷", "处理表格数据最强、特征重要性", "黑盒性质、需要后处理解释"],
                    ["深度神经网络", "大数据量、多模态特征", "自动特征学习、处理非结构化数据", "需要大量数据、训练成本高"],
                    ["图神经网络（GNN）", "关系型风险评估、反欺诈", "捕捉关联风险、发现团伙", "图构建复杂、计算资源需求大"],
                ],
            },
            mermaid: `graph LR
    A["借款人画像"] --> B["特征提取"]
    C["交易行为\n时间序列"] --> B
    D["社交关系\n图结构"] --> E["GNN 编码"]
    E --> B
    B --> F["多模态融合"]
    F --> G["信用评分\n0-1000"]
    G --> H["审批决策"]`,
            tip: "信用模型上线前必须进行压力测试。使用历史危机时期（如 2008 年金融危机、2020 年疫情）的数据验证模型在极端市场环境下的表现。",
            warning: "替代数据用于信用评估存在公平性风险。如果模型使用的替代特征与种族、性别等受保护属性高度相关，可能违反公平信贷法规。必须进行偏差检测和缓解。",
        },
        {
            title: "3. 欺诈检测：从规则引擎到实时智能防御",
            body: `金融欺诈是一个价值超过 5 万亿美元的全球性问题。从信用卡盗刷到保险诈骗，从洗钱交易到身份冒用，欺诈手段不断进化，防御系统也必须持续升级。

传统的欺诈检测系统基于规则引擎：如果交易金额超过特定阈值且发生在境外则标记为可疑。这种方法容易理解但存在两大缺陷：规则滞后于新型欺诈模式，且规则数量膨胀后产生大量误报。一个典型的银行规则引擎可能包含数万条规则，误报率高达 90% 以上。

现代 AI 驱动的欺诈检测系统采用多层架构：第一层是实时评分引擎，使用训练好的模型在交易发生的毫秒级时间内给出欺诈概率；第二层是图分析引擎，实时检查交易网络中的异常模式；第三层是深度调查引擎，对高风险案例进行深度分析并生成调查报告。异常检测是欺诈检测的核心技术，主流的应对策略包括使用隔离森林、One-Class SVM、或基于自编码器的重构误差来识别异常模式。`,
            code: [
                {
                    lang: "python",
                    code: `# 实时欺诈检测管道
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class RealTimeFraudDetector:
    """实时欺诈检测器"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.iso_forest = IsolationForest(
            contamination=0.001,  # 预计欺诈率 0.1%
            n_estimators=200,
            max_samples="auto",
            random_state=42,
        )
        self.threshold = -0.5
        
    def fit(self, historical_transactions):
        """用历史正常交易训练异常检测模型"""
        features = self._extract_features(historical_transactions)
        scaled = self.scaler.fit_transform(features)
        self.iso_forest.fit(scaled)
        scores = self.iso_forest.decision_function(scaled)
        self.threshold = np.percentile(scores, 1)
        
    def detect(self, transaction):
        """实时检测单笔交易"""
        features = self._extract_features([transaction])
        scaled = self.scaler.transform(features)
        score = self.iso_forest.decision_function(scaled)[0]
        is_fraud = score < self.threshold
        return {"is_fraud": bool(is_fraud), "anomaly_score": float(score)}
        
    def _extract_features(self, transactions):
        """从交易记录中提取特征"""
        pass`
                },
                {
                    lang: "python",
                    code: `# 使用图注意力网络检测欺诈团伙
import torch
from torch_geometric.data import Data
from torch_geometric.nn import GATConv

class FraudGAT(torch.nn.Module):
    """基于图注意力网络的欺诈团伙检测
    
    GAT 的优势：为不同邻居分配不同注意力权重
    例如：可疑账户之间的关联比正常账户更值得关注
    """
    
    def __init__(self, in_channels, hidden_channels, num_heads=4):
        super().__init__()
        self.conv1 = GATConv(in_channels, hidden_channels, 
                            heads=num_heads, dropout=0.3)
        self.conv2 = GATConv(hidden_channels * num_heads, 
                            hidden_channels, heads=1, 
                            concat=False, dropout=0.3)
        self.classifier = torch.nn.Linear(hidden_channels, 1)
        
    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = torch.relu(self.conv1(x, edge_index))
        x = torch.dropout(x, p=0.3, train=self.training)
        x = self.conv2(x, edge_index)
        return torch.sigmoid(self.classifier(x))

# 欺诈图谱构建
# 节点 = 账户，边 = 转账/共同设备/共同IP/共同地址
def build_fraud_graph(transactions, accounts):
    """构建欺诈检测图"""
    nodes = torch.tensor(accounts.features)
    edges = build_edges(transactions)
    return Data(x=nodes, edge_index=edges)`
                }
            ],
            table: {
                headers: ["检测方法", "检测速度", "检测能力", "误报率"],
                rows: [
                    ["规则引擎", "亚毫秒级", "已知模式", "高（80-95%）"],
                    ["逻辑回归/决策树", "毫秒级", "线性可分模式", "中（40-60%）"],
                    ["异常检测（Isolation Forest）", "毫秒级", "未知异常", "中低（20-40%）"],
                    ["图神经网络", "秒级", "关联/团伙欺诈", "低（10-20%）"],
                    ["多模型集成", "毫秒-秒级", "全面覆盖", "最低（5-15%）"],
                ],
            },
            mermaid: `graph TD
    A["交易到达"] --> B["特征提取\n<1ms"]
    B --> C["规则引擎\n快速过滤"]
    C -->|通过规则| D["ML 评分\n<10ms"]
    C -->|命中规则| E["直接标记"]
    D -->|低风险| F["正常处理"]
    D -->|中风险| G["二次验证"]
    D -->|高风险| H["人工审核"]
    E --> H
    A --> I["异步图分析"]
    I -->|发现团伙| J["批量冻结"]`,
            tip: "欺诈检测系统的黄金指标不是准确率，而是精确率和召回率的平衡。在金融场景中，漏报的代价远高于误报，因此应优先优化召回率。",
            warning: "欺诈检测模型面临对抗性攻击风险。欺诈者会试探系统的检测边界，逐步调整其行为模式以绕过检测。因此模型需要持续更新，并引入对抗训练增强鲁棒性。",
        },
        {
            title: "4. 算法交易：从量化策略到强化学习",
            body: `算法交易是 AI 在金融领域最引人注目的应用之一，也是技术门槛最高的领域。全球主要交易所中，超过 60% 的交易量由算法驱动，其中基于 AI 的交易策略正在快速增长。

算法交易的核心思想是利用数学模型和计算机程序自动执行交易决策，消除人类情绪干扰，在毫秒级时间内捕捉市场机会。传统量化交易依赖于统计学方法和经济学理论，如均值回归、动量策略、因子投资，而 AI 驱动的交易策略则通过深度学习自动从海量市场数据中发现复杂的定价规律。

强化学习在算法交易中的应用尤为突出。与传统的监督学习不同，强化学习通过与市场环境的持续交互来学习最优交易策略。然而，算法交易中的 AI 应用面临独特挑战：金融市场的信噪比极低、市场环境非平稳、以及过拟合风险极高，回测表现优异的策略在实盘中可能完全失效。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用强化学习进行算法交易
import gym
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv

class StockTradingEnv(gym.Env):
    """股票交易环境 - 强化学习的交互接口"""
    
    def __init__(self, prices, features, initial_balance=100000):
        super().__init__()
        self.prices = prices
        self.features = features
        self.initial_balance = initial_balance
        self.action_space = gym.spaces.Discrete(3)  # 0=卖出, 1=持有, 2=买入
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(features.shape[1] + 3,), dtype=np.float32
        )
        self.reset()
        
    def reset(self):
        self.step_num = 0
        self.balance = self.initial_balance
        self.shares = 0
        return self._get_observation()
        
    def step(self, action):
        self._execute_action(action)
        self.step_num += 1
        reward = self._calculate_reward()
        done = self.step_num >= len(self.prices) - 1
        return self._get_observation(), reward, done, {}
        
    def _execute_action(self, action):
        current_price = self.prices[self.step_num]
        if action == 2 and self.balance > current_price:
            shares_to_buy = int(self.balance * 0.95 / current_price)
            self.shares += shares_to_buy
            self.balance -= shares_to_buy * current_price
        elif action == 0 and self.shares > 0:
            self.balance += self.shares * current_price * 0.999
            
    def _calculate_reward(self):
        current_value = self.balance + self.shares * self.prices[self.step_num]
        return (current_value - self.portfolio_value) / self.portfolio_value

# 训练 PPO 交易策略
env = DummyVecEnv([lambda: StockTradingEnv(prices, features)])
model = PPO("MlpPolicy", env, verbose=1, n_steps=2048)
model.learn(total_timesteps=500_000)`
                },
                {
                    lang: "python",
                    code: `# 多因子量化策略 + 机器学习
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

class MLQuantStrategy:
    """机器学习驱动的量化交易策略"""
    
    FACTORS = [
        "momentum_20d", "momentum_60d", "volatility_20d",
        "volume_ratio", "rsi_14", "macd_signal",
        "pe_ratio", "market_cap_rank",
    ]
    
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=200, max_depth=4, learning_rate=0.05,
            subsample=0.8, min_samples_leaf=50,
        )
        
    def train(self, historical_data):
        """用历史数据训练收益预测模型"""
        X = historical_data[self.FACTORS].values
        y = historical_data["close"].shift(-5) / historical_data["close"] - 1
        y = y.dropna()
        X = X[:len(y)]
        self.model.fit(X, y)
        
    def predict_signals(self, current_data):
        """生成交易信号"""
        X = current_data[self.FACTORS].values
        expected_returns = self.model.predict(X)
        top_quintile = np.percentile(expected_returns, 80)
        bottom_quintile = np.percentile(expected_returns, 20)
        
        signals = pd.DataFrame({
            "ticker": current_data["ticker"],
            "expected_return": expected_returns,
            "signal": np.where(expected_returns >= top_quintile, 1,
                      np.where(expected_returns <= bottom_quintile, -1, 0)),
        })
        return signals`
                }
            ],
            table: {
                headers: ["策略类型", "持有周期", "信号来源", "风险水平"],
                rows: [
                    ["高频做市", "毫秒-秒", "订单簿微观结构", "极低（但技术风险高）"],
                    ["统计套利", "分钟-日", "价差均值回归", "中"],
                    ["多因子选股", "周-月", "基本面 + 技术因子", "中低"],
                    ["强化学习交易", "分钟-日", "自主学习策略", "高（策略不稳定）"],
                    ["事件驱动", "小时-周", "新闻舆情、财报", "中高"],
                ],
            },
            mermaid: `graph LR
    A["市场数据\n行情/订单簿"] --> B["特征工程\n因子计算"]
    C["另类数据\n新闻/社交/卫星"] --> B
    B --> D["信号生成\nML 模型预测"]
    D --> E["组合优化\n风险控制"]
    E --> F["订单执行\n智能路由"]
    F --> G["成交回报"]
    G --> H["绩效归因"]
    H --> B`,
            tip: "在算法交易中，执行质量与信号质量同等重要。一个优秀的信号如果执行成本过高（滑点、市场冲击），其实际收益可能为负。建议使用 VWAP、TWAP 或强化学习智能执行算法。",
            warning: "回测过拟合是算法交易的最大陷阱。在历史数据上表现完美的策略，往往是因为模型记住了历史噪声而非学习到了真正的市场规律。务必使用交叉验证、样本外测试和模拟盘验证。",
        },
        {
            title: "5. 智能投顾：个性化财富管理的 AI 引擎",
            body: `智能投顾是 AI 在财富管理领域的革命性应用。传统财富管理服务于高净值客户，因为人工顾问的服务成本高昂。智能投顾通过 AI 自动化投资咨询流程，将专业投资服务的门槛降低到几乎为零。

智能投顾的工作流程包括四个核心环节：客户画像通过问卷和数据分析了解客户的风险承受能力、投资目标和时间偏好；资产配置基于现代投资组合理论和机器学习优化，为客户推荐最优的资产配置方案；自动再平衡定期或触发式调整投资组合，确保资产配置比例保持在目标范围内；税务优化通过税务亏损收割等策略帮助客户减少税务负担。

在资产配置环节，AI 正在超越传统的均值-方差优化。强化学习可以学习动态资产配置策略，根据市场环境自动调整股票、债券、大宗商品等资产类别的权重。自然语言处理技术可以实时分析宏观经济报告、央行声明和财经新闻，为资产配置决策提供信息优势。`,
            code: [
                {
                    lang: "python",
                    code: `# 智能投顾核心：客户风险画像
import numpy as np
from sklearn.cluster import KMeans
from dataclasses import dataclass

@dataclass
class InvestorProfile:
    """投资者画像"""
    risk_tolerance: float      # 风险承受力 0-10
    investment_horizon: int    # 投资期限（年）
    expected_return: float     # 期望年化收益率
    max_drawdown: float        # 最大可接受回撤
    income_level: float
    age: int
    dependents: int

def profile_investor(questionnaire_responses, transaction_history):
    """基于问卷和交易行为自动构建投资者画像"""
    # 问卷得分
    survey_risk = np.mean(questionnaire_responses["risk_questions"])
    
    # 行为分析 - 从历史交易中推断真实风险偏好
    # 人们说的和做的往往不一致
    behavior_signals = analyze_trading_behavior(transaction_history)
    actual_risk = behavior_signals["avg_portfolio_volatility"]
    panic_selling = behavior_signals["panic_sell_frequency"]
    
    # 综合评分 - 行为数据权重更高
    composite_risk = 0.3 * survey_risk + 0.7 * actual_risk
    if panic_selling > 0.3:
        composite_risk *= 0.8
        
    return InvestorProfile(
        risk_tolerance=composite_risk,
        investment_horizon=questionnaire_responses["horizon"],
        expected_return=questionnaire_responses["target_return"],
        max_drawdown=estimate_max_drawdown(composite_risk),
        income_level=transaction_history["avg_monthly_income"],
        age=questionnaire_responses["age"],
        dependents=questionnaire_responses["dependents"],
    )

def estimate_max_drawdown(risk_score):
    """根据风险评分估算最大可接受回撤"""
    return 0.05 + 0.035 * risk_score`
                },
                {
                    lang: "python",
                    code: `# 动态资产配置引擎
import numpy as np
from scipy.optimize import minimize

class RoboAdvisorEngine:
    """智能投顾资产配置引擎"""
    
    ASSET_CLASSES = [
        "US_EQUITY", "INTL_EQUITY", "BONDS",
        "REAL_ESTATE", "COMMODITIES", "CASH",
    ]
    
    def optimize_portfolio(self, investor_profile, expected_returns, cov_matrix):
        """为投资者优化资产配置"""
        n_assets = len(self.ASSET_CLASSES)
        max_equity = investor_profile.risk_tolerance / 10 * 0.8
        
        def negative_sharpe(weights):
            """负夏普比率 - 最小化负值即最大化夏普"""
            port_return = np.sum(weights * expected_returns)
            port_vol = np.sqrt(weights.T @ cov_matrix @ weights)
            return -(port_return - 0.03) / port_vol
            
        constraints = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1.0},
            {"type": "ineq", "fun": lambda w: max_equity - w[0] - w[1]},
        ]
        bounds = tuple((0.0, 0.5) for _ in range(n_assets))
        
        result = minimize(negative_sharpe, np.ones(n_assets)/n_assets,
                         method="SLSQP", bounds=bounds, constraints=constraints)
        
        return dict(zip(self.ASSET_CLASSES, np.round(result.x, 4)))
        
    def rebalance_check(self, current_weights, target_weights, threshold=0.05):
        """检查是否需要再平衡"""
        deviations = np.abs(current_weights - target_weights)
        needs_rebalance = deviations > threshold
        return needs_rebalance, deviations`
                }
            ],
            table: {
                headers: ["功能模块", "传统方法", "AI 增强方法", "优势"],
                rows: [
                    ["风险画像", "问卷评分", "问卷 + 行为分析", "反映真实风险偏好而非自我认知"],
                    ["资产配置", "均值-方差优化", "强化学习动态配置", "适应市场变化、考虑非线性约束"],
                    ["基金筛选", "人工研究员", "NLP 分析 + 多因子模型", "覆盖全市场、实时更新"],
                    ["再平衡", "定期（季度/半年）", "事件驱动 + 阈值触发", "及时响应市场变化"],
                    ["税务优化", "年终结算", "实时税务亏损收割", "持续降低税负"],
                ],
            },
            mermaid: `graph TD
    A["客户注册"] --> B["风险评估\n问卷 + 行为分析"]
    B --> C["投资者画像"]
    C --> D["资产配置优化"]
    D --> E["基金/ETF 选择"]
    E --> F["自动建仓"]
    F --> G["持续监控"]
    G -->|偏离阈值| H["自动再平衡"]
    G -->|市场变化| I["配置调整"]
    H --> F
    I --> F
    G --> J["税务优化\n亏损收割"]
    G --> K["定期报告\nNLP 生成"]`,
            tip: "智能投顾的成功关键不在于算法的复杂度，而在于客户体验。即使配置方案在数学上是最优的，如果客户无法理解或信任它，他们可能会在市场波动时撤资。可解释性和透明度至关重要。",
            warning: "智能投顾提供的投资建议在多数国家属于受监管活动。美国 SEC、中国证监会等监管机构对自动化投资建议有明确要求，包括适当性管理、风险揭示和合规报告。上线前务必确认符合当地法规。",
        },
        {
            title: "6. 合规与反洗钱：AI 驱动的监管科技",
            body: `合规和反洗钱是金融行业运营成本最高的领域之一。全球银行每年在合规上的支出超过 2700 亿美元，其中人工成本占比超过 60%。监管科技通过 AI 自动化合规流程，正在显著降低这一成本。

反洗钱是合规领域的核心挑战。传统的 AML 系统依赖交易监控规则，当交易金额、频率或模式匹配预定义的可疑模式时生成警报。这种方法的问题极其严重：据估计，银行 AML 系统的误报率超过 95%，这意味着合规团队每审查 100 个警报，只有不到 5 个是真正可疑的。大量的人力资源被浪费在排除误报上。

AI 在合规领域的应用正在从单一的异常检测向全面的智能合规平台演进。自然语言处理技术可以自动解读监管法规的变化，将其转化为可执行的合规规则；知识图谱技术可以构建客户、交易、实体之间的复杂关系网络，识别隐蔽的洗钱路径；深度学习模型可以在更细的粒度上分析交易模式，大幅降低误报率。`,
            code: [
                {
                    lang: "python",
                    code: `# AML 交易监控 - 智能警报过滤
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE

class AMLAlertFilter:
    """AML 警报智能过滤器 - 降低误报率"""
    
    def __init__(self):
        self.pipeline = Pipeline([
            ("smote", SMOTE(sampling_strategy=0.1)),
            ("classifier", RandomForestClassifier(
                n_estimators=300, max_depth=10,
                class_weight="balanced", n_jobs=-1,
            ))
        ])
        
    def train(self, historical_alerts, investigation_outcomes):
        """用历史调查结果训练过滤器"""
        self.pipeline.fit(historical_alerts, investigation_outcomes)
        
    def filter_alerts(self, new_alerts):
        """过滤新警报，返回高风险警报列表"""
        probabilities = self.pipeline.predict_proba(new_alerts)[:, 1]
        new_alerts["fraud_probability"] = probabilities
        high_risk = new_alerts[new_alerts["fraud_probability"] > 0.3]
        high_risk = high_risk.sort_values("fraud_probability", ascending=False)
        return high_risk
        
    def generate_report(self, alert):
        """自动生成可疑活动报告草稿"""
        report = f"账户 {alert['account_id']} 触发 {alert['rule_name']} 规则。"
        report += "交易金额 $" + format(alert['amount'], ',.2f') + "，频率 " + str(alert['tx_count']) + " 笔/天。"
        report += f"风险评分 {alert['fraud_probability']:.2%}。"
        report += f"关联账户数 {alert['linked_accounts']}。"
        action = "立即冻结" if alert["fraud_probability"] > 0.7 else "进一步调查"
        report += f"建议行动：{action}。"
        return report`
                },
                {
                    lang: "python",
                    code: `# 监管法规 NLP 解析引擎
import spacy
from typing import List, Dict

class RegulationAnalyzer:
    """监管法规自动解析引擎
    
    功能：
    1. 解析监管文件，提取合规要求
    2. 与现有合规规则对比，识别新增/变更要求
    3. 生成合规差距报告
    """
    
    def __init__(self):
        self.nlp = spacy.load("zh_core_web_trf")
        
    def parse_regulation(self, regulation_text: str) -> Dict:
        """解析监管文件，提取关键合规要求"""
        doc = self.nlp(regulation_text)
        
        # 提取义务性语句（包含"应当"、"必须"、"不得"）
        obligations = []
        for sent in doc.sents:
            text = sent.text
            if any(kw in text for kw in ["应当", "必须", "不得", "禁止"]):
                obligations.append({
                    "text": text,
                    "keywords": [k for k in ["应当", "必须", "不得", "禁止"] if k in text],
                })
                
        return {
            "total_sentences": len(list(doc.sents)),
            "obligations": obligations,
            "compliance_items": len(obligations),
        }
        
    def compare_regulations(self, old_reg: str, new_reg: str) -> List[Dict]:
        """对比新旧法规，识别变化"""
        old_items = self.parse_regulation(old_reg)["obligations"]
        new_items = self.parse_regulation(new_reg)["obligations"]
        changes = []
        old_texts = {item["text"] for item in old_items}
        for item in new_items:
            if item["text"] not in old_texts:
                changes.append({"type": "new", "content": item["text"]})
        return changes`
                }
            ],
            table: {
                headers: ["合规领域", "传统方法", "AI 方法", "效率提升"],
                rows: [
                    ["反洗钱监控", "规则引擎 + 人工审查", "ML 异常检测 + 智能过滤", "误报率降低 60-80%"],
                    ["KYC 审查", "人工收集验证文件", "OCR + 人脸识别 + 数据交叉验证", "处理时间从数天缩短到分钟"],
                    ["法规合规", "人工解读法规", "NLP 自动解析 + 差距分析", "法规更新响应时间缩短 80%"],
                    ["交易监控", "固定阈值告警", "动态基线 + 行为分析", "检测覆盖率提升 50%"],
                    ["监管报告", "手动编制", "自动生成 + NLP 验证", "编制时间减少 70%"],
                ],
            },
            mermaid: `graph TD
    A["新监管法规发布"] --> B["NLP 解析\n提取合规要求"]
    B --> C["与现有规则对比"]
    C --> D["识别合规差距"]
    D --> E["生成整改建议"]
    F["日常交易"] --> G["AI 监控\n实时分析"]
    G --> H["异常检测"]
    H -->|高风险| I["自动上报\n监管报告"]
    H -->|中风险| J["人工复核"]
    H -->|低风险| K["正常通过"]
    E --> L["更新监控规则"]
    L --> G`,
            tip: "合规 AI 系统的可解释性不仅是技术需求，更是法律要求。当监管机构询问某笔交易为何被标记为可疑时，你必须能够提供清晰的推理链条，而不仅仅是一个模型输出。",
            warning: "监管法规具有地域性和时效性。在不同国家/地区运营的金融机构必须遵守各自辖区的法规。AI 合规系统必须能够处理多语言、多辖区的法规，并随着法规更新而持续演进。",
        },
        {
            title: "7. 实战项目：构建端到端欺诈检测系统",
            body: `本节将综合运用前面章节的知识，从零开始构建一个完整的欺诈检测系统。这个系统模拟真实金融科技公司的生产级架构，包括数据预处理、特征工程、模型训练、实时推理和监控告警。

我们的项目场景是一个在线支付平台，每天处理数百万笔交易。系统需要在交易发生的 100 毫秒内判断是否为欺诈交易，并在发现新型欺诈模式时自动更新检测模型。

**整个系统分为三个层次**：第一层是特征服务层，负责从原始交易数据中提取数百个实时特征，包括交易本身的属性和用户的行为画像；第二层是模型推理层，部署了多个模型进行集成推理，包括 LightGBM 主模型、图神经网络关联模型、以及基于自编码器的异常检测模型；第三层是决策层，综合多个模型的输出，结合业务规则，做出最终的通过、拒绝或人工审核决策。这个实战项目使用的数据集来自 Kaggle 的 IEEE-CIS 欺诈检测数据集，包含超过 50 万个交易样本。`,
            code: [
                {
                    lang: "python",
                    code: `# 端到端欺诈检测系统
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import json

class FraudDetectionSystem:
    """完整的欺诈检测系统"""
    
    def __init__(self, config_path="config.json"):
        with open(config_path) as f:
            self.config = json.load(f)
        self.feature_engineer = FeatureEngineer()
        self.models = {}
        self.threshold = 0.5
        
    def train(self, transactions_df, labels_df):
        """训练欺诈检测模型"""
        print("1. 特征工程...")
        features = self.feature_engineer.transform(transactions_df)
        
        print("2. 数据集划分...")
        X_train, X_val, y_train, y_val = train_test_split(
            features, labels_df, test_size=0.2, 
            stratify=labels_df, random_state=42
        )
        
        print("3. 训练 LightGBM 主模型...")
        fraud_ratio = y_train.sum() / len(y_train)
        train_data = lgb.Dataset(X_train, label=y_train)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
        
        params = {
            "objective": "binary", "metric": "auc",
            "boosting_type": "gbdt", "num_leaves": 63,
            "learning_rate": 0.05, "feature_fraction": 0.8,
            "bagging_fraction": 0.8, "bagging_freq": 5,
            "scale_pos_weight": (1 - fraud_ratio) / fraud_ratio,
            "verbose": -1,
        }
        
        self.models["lightgbm"] = lgb.train(
            params, train_data, num_boost_round=1000,
            valid_sets=[val_data],
            callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)],
        )
        
        val_preds = self.models["lightgbm"].predict(X_val)
        auc = roc_auc_score(y_val, val_preds)
        print(f"验证集 AUC: {auc:.4f}")
        self.threshold = self._optimize_threshold(y_val, val_preds)
        
    def predict(self, transaction_df):
        """实时推理 - 交易到来时的处理"""
        features = self.feature_engineer.transform(transaction_df)
        score = self.models["lightgbm"].predict(features)[0]
        if score >= self.threshold:
            return "BLOCK"
        elif score >= self.threshold * 0.7:
            return "REVIEW"
        else:
            return "ALLOW"
            
    def _optimize_threshold(self, y_true, y_scores):
        """基于业务成本优化决策阈值"""
        FN_COST, FP_COST = 100, 5
        best_threshold, best_cost = 0.5, float("inf")
        for t in np.arange(0.1, 0.9, 0.01):
            preds = (y_scores >= t).astype(int)
            fn = np.sum((y_true == 1) & (preds == 0))
            fp = np.sum((y_true == 0) & (preds == 1))
            cost = fn * FN_COST + fp * FP_COST
            if cost < best_cost:
                best_cost = cost
                best_threshold = t
        return best_threshold

class FeatureEngineer:
    def transform(self, df):
        df = df.copy()
        df["hour"] = pd.to_datetime(df["TransactionDT"], unit="s").dt.hour
        df["is_night"] = (df["hour"] < 6).astype(int)
        df["log_amount"] = np.log1p(df["TransactionAmt"])
        df["amount_deviation"] = df["TransactionAmt"] / df["TransactionAmt"].median()
        df["device_type_encoded"] = df["DeviceType"].map({"desktop": 0, "mobile": 1}).fillna(2)
        return df.fillna(-999)`
                },
                {
                    lang: "python",
                    code: `# 模型监控与持续学习
import numpy as np
from datetime import datetime

class ModelMonitor:
    """欺诈检测模型监控器"""
    
    def __init__(self, baseline_features=None, baseline_scores=None):
        self.baseline_features = baseline_features
        self.baseline_scores = baseline_scores
        self.prediction_log = []
        self.feedback_log = []
        
    def log_prediction(self, transaction_id, features, score, decision):
        """记录每次预测"""
        self.prediction_log.append({
            "timestamp": datetime.now(),
            "transaction_id": transaction_id,
            "score": score,
            "decision": decision,
        })
        
    def log_feedback(self, transaction_id, actual_outcome):
        """记录真实结果（来自客户投诉或人工审核）"""
        self.feedback_log.append({
            "timestamp": datetime.now(),
            "transaction_id": transaction_id,
            "actual_outcome": actual_outcome,
        })
        
    def check_drift(self, recent_features, threshold=0.05):
        """检测特征漂移 - PSI (Population Stability Index)"""
        if self.baseline_features is None:
            return {"drift_detected": False, "reason": "无基线数据"}
        psi_values = {}
        drift_detected = False
        for feature in recent_features.columns:
            psi = self._calculate_psi(
                self.baseline_features[feature], recent_features[feature]
            )
            psi_values[feature] = psi
            if psi > 0.25:
                drift_detected = True
        return {
            "drift_detected": drift_detected,
            "psi_values": psi_values,
            "high_drift_features": [f for f, psi in psi_values.items() if psi > 0.25],
        }
        
    def _calculate_psi(self, expected, actual, buckets=10):
        """计算群体稳定性指数"""
        breakpoints = np.linspace(0, 100, buckets + 1)
        expected_percents = np.percentile(expected, breakpoints)
        psi = 0
        for i in range(len(expected_percents) - 1):
            lo, hi = expected_percents[i], expected_percents[i + 1]
            ep = np.sum((expected >= lo) & (expected < hi)) / len(expected)
            ap = np.sum((actual >= lo) & (actual < hi)) / len(actual)
            ep = max(ep, 0.0001)
            ap = max(ap, 0.0001)
            psi += (ap - ep) * np.log(ap / ep)
        return psi

def check_retrain_needed(monitor, psi_threshold=0.25):
    """检查是否需要重新训练模型"""
    recent = get_recent_transactions(hours=24)
    drift_result = monitor.check_drift(recent)
    if drift_result["drift_detected"]:
        print(f"检测到特征漂移！高漂移特征: {drift_result['high_drift_features']}")
        trigger_retraining_pipeline()
        return True
    return False`
                }
            ],
            table: {
                headers: ["系统组件", "技术选型", "性能指标", "SLA 要求"],
                rows: [
                    ["特征服务", "Redis + Kafka", "特征提取 < 10ms", "99.99% 可用性"],
                    ["模型推理", "LightGBM + ONNX", "推理 < 5ms", "P99 延迟 < 20ms"],
                    ["决策引擎", "Drools 规则引擎", "决策 < 1ms", "零错误"],
                    ["数据存储", "PostgreSQL + S3", "写入 < 50ms", "数据持久性 99.999%"],
                    ["模型监控", "自定义 PSI + 性能追踪", "漂移检测每小时", "漂移发现 < 1 小时"],
                ],
            },
            mermaid: `graph TD
    A["交易请求"] --> B["特征服务\nRedis 实时特征"]
    B --> C["LightGBM 主模型\n<5ms"]
    B --> D["GNN 关联模型\n<50ms 异步"]
    C --> E["决策引擎\n综合评分 + 规则"]
    D -->|高风险关联| E
    E -->|ALLOW| F["交易成功"]
    E -->|REVIEW| G["人工审核队列"]
    E -->|BLOCK| H["拒绝 + 通知"]
    G -->|确认欺诈| I["标记 + 模型反馈"]
    G -->|确认正常| J["放行 + 模型反馈"]
    H --> I
    I --> K["模型监控\nPSI 漂移检测"]
    J --> K
    K -->|需要| L["自动重训练"]
    L --> C`,
            tip: "欺诈检测系统的持续学习能力比初始性能更重要。欺诈者在不断进化，你的模型也必须如此。建立一个自动化的反馈闭环：收集人工审核结果、更新训练数据、定期重训练、A/B 测试新模型、逐步替换旧模型。",
            warning: "在生产环境中部署欺诈检测模型时，务必保留规则引擎作为兜底方案。即使 ML 模型的 AUC 达到 0.98，仍然可能存在模型未覆盖的边界场景。规则引擎可以捕获这些已知的高风险模式，为模型提供安全网。",
        },
    ],
};
