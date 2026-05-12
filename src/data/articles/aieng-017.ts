// AI 工程化文章 #17: honker — SQLite NOTIFY/LISTEN 语义与事务型外盒模式实战

import { Article } from '../knowledge';

export const article: Article = {
  id: "aieng-017",
  title: "honker 深度解析：SQLite 上的 PostgreSQL NOTIFY/LISTEN 语义 — 事务型外盒模式实战与 AI Agent 消息队列架构",
  category: "aieng",
  tags: ["SQLite", "honker", "NOTIFY/LISTEN", "事务型外盒模式", "Rust 扩展", "消息队列", "Kafka", "AI Agent", "PostgreSQL", "Python"],
  summary: "2026 年 4 月，Simon Willison 推荐了 honker — 一个将 PostgreSQL NOTIFY/LISTEN 语义引入 SQLite 的 Rust 扩展。honker 提供了 Kafka 风格的持久化数据流和事务型外盒（Transactionally Staged Job Drains）模式的 SQLite 实现，支持 Python/Rust/Go 等多种语言绑定。本文从架构原理、API 设计、事务一致性保证、性能基准到 AI Agent 消息队列实战，全面解析 honker 如何用单文件数据库实现可靠的事件驱动架构。",
  date: "2026-04-25",
  readTime: "35 min",
  level: "进阶",
  content: [
    {
      title: "一、honker 是什么：为什么 SQLite 需要 NOTIFY/LISTEN 语义",
      body: `honker 是一个 Rust 编写的 SQLite 扩展，由 russellromney 开发。它的核心目标是将 PostgreSQL 的 NOTIFY/LISTEN 通知机制和事务型外盒（Transactionally Staged Job Drains）模式引入 SQLite 生态。

**### 背景**：SQLite 的异步通信空白

SQLite 作为世界上最流行的嵌入式数据库，长期以来缺少跨进程异步通信能力：
- PostgreSQL 有 \`NOTIFY/LISTEN\`，允许一个连接发送通知，其他连接接收
- Redis 有 \`PUB/SUB\` 和 Streams
- Kafka/RabbitMQ 提供了完整的消息队列基础设施
- SQLite 只有 WAL（Write-Ahead Log），但没有原生的消息通知机制

这意味着基于 SQLite 的应用如果需要事件驱动架构（如 AI Agent 任务队列、实时数据同步），只能依赖轮询——效率低、延迟高、扩展性差。

honker 填补了这个空白。它提供两种核心原语：

| 原语 | 类比 | 用途 |
|------|------|------|
| Queue | Redis BLPOP / RabbitMQ Queue | 工作队列、任务分发、消费者组 |
| Stream | Kafka Stream / Redis Streams | 事件溯源、数据变更捕获、实时推送 |

### honker 的关键设计决策

1. 基于 WAL 的轮询机制：worker 每 1ms 轮询 \`.db-wal\` 文件的 stat 变化，实现接近实时的通知
2. 事务型外盒模式：确保消息仅在事务成功提交后才进入队列，避免「数据写入成功但消息丢失」的不一致状态
3. 单文件架构：无需额外服务进程，与 SQLite 应用共享同一数据库文件
4. 多语言绑定：官方提供 Python 绑定，社区可扩展 Go/Node.js/Rust

> 为什么叫 honker？ 名字来自「honk」—— 大鹅的叫声，暗示这是一个「通知/提醒」工具。`,
      mermaid: `graph TD
    A[SQLite 应用写入数据] --> B{honker 扩展}
    B -->|Queue 模式| C[工作队列]
    B -->|Stream 模式| D[事件流]
    
    C --> E[Worker 1: 消费邮件任务]
    C --> F[Worker 2: 消费通知任务]
    C --> G[Worker N: 横向扩展]
    
    D --> H[Dashboard: 实时推送]
    D --> I[Analytics: 事件溯源]
    D --> J[Sync: 数据同步]
    
    E -.每 1ms 轮询 WAL.-> K[.db-wal 文件]
    K -.stat 变化检测.-> E`,
    },
    {
      title: "二、honker 核心 API 设计：Queue 和 Stream 的用法差异",
      body: `honker 提供了两套 API：Queue（队列）和 Stream（流）。它们的设计哲学和适用场景完全不同。`,
      code: [
        {
          lang: "python",
          title: "honker Queue：生产者-消费者模式（工作队列）",
          code: `import honker

# 打开（或创建）数据库
db = honker.open("app.db")

# 创建名为 "emails" 的队列
emails = db.queue("emails")

# === 生产者：入队任务 ===
emails.enqueue({
    "to": "alice@example.com",
    "subject": "Welcome!",
    "body": "Hello Alice"
})
emails.enqueue({
    "to": "bob@example.com",
    "subject": "Order Confirmed",
    "body": "Your order #42 is confirmed"
})

# === 消费者：消费任务 ===
async for job in emails.claim("worker-1"):
    print(f"Processing job: {job.payload}")
    # 处理邮件发送...
    job.ack()  # 确认完成
    # 如果 worker 崩溃未 ack，任务会重新入队`,
        },
        {
          lang: "python",
          title: "honker Stream：Kafka 风格持久化数据流",
          code: `import honker

db = honker.open("app.db")

# 创建持久化事件流
stream = db.stream("user-events")

# === 发布事件（在事务中）===
with db.transaction() as tx:
    tx.execute(
        "UPDATE users SET name=? WHERE id=?",
        ["New Name", 42]
    )
    # 只有事务提交成功，事件才会发布
    stream.publish(
        {"user_id": 42, "change": "name", "new_value": "New Name"},
        tx=tx
    )

# === 消费者：订阅事件流 ===
async for event in stream.subscribe(consumer="dashboard"):
    # 实时推送到浏览器
    await push_to_browser(event)
    # 事件持久化，重启后不会丢失`,
        },
      ],
      mermaid: `sequenceDiagram
    participant App as 应用进程
    participant H as honker 扩展
    participant WAL as .db-wal
    participant W as Worker 进程
    
    App->>H: tx.execute("UPDATE users...")
    H->>WAL: 写入 WAL 文件
    App->>H: stream.publish(event, tx)
    H->>H: 标记为"待发布"（未提交前不可见）
    App->>H: tx.commit()
    H->>WAL: WAL 事务提交
    H->>H: 事件变为可见
    
    loop 每 1ms
        W->>WAL: stat(.db-wal)
        WAL-->>W: 文件大小变化检测
        W->>H: 读取新事件
        W->>W: 处理事件
    end`,
    },
    {
      title: "三、事务型外盒模式（Transactionally Staged Job Drains）深度解析",
      body: `honker 实现了 Transactionally Staged Job Drains 模式（源自 Brandur Leach 的经典文章）。这是分布式系统中确保数据写入与消息发送一致性的关键模式。

**### 问题**：为什么需要事务型外盒？

考虑一个典型的场景：用户注册时，你需要：
1. 将用户信息写入数据库
2. 发送欢迎邮件

不使用事务型外盒的问题：

\`\`\`
# 反模式：两步操作可能不一致
db.execute("INSERT INTO users ...")  # ✅ 写入成功
email_service.send("Welcome!")        # ❌ 网络超时，发送失败
# 结果：用户注册了但没收到邮件 → 用户体验差
\`\`\`

使用 honker 的解决方案：

\`\`\`python
# ✅ 原子操作：数据写入和消息入队在同一个事务中
with db.transaction() as tx:
    db.execute("INSERT INTO users ...", tx=tx)
    db.queue("emails").enqueue({"to": user.email}, tx=tx)
# 事务要么全部成功，要么全部回滚
\`\`\`

### 模式工作流程

| 步骤 | 操作 | 事务状态 | 消费者可见性 |
|------|------|---------|-------------|
| 1 | 开始事务 | 进行中 | 不可见 |
| 2 | 写入业务数据 | 进行中 | 不可见 |
| 3 | 将消息「暂存」到外盒表 | 进行中 | 暂存中（不对外暴露） |
| 4 | 提交事务 | 已提交 | ✅ 立即可见 |
| 5 | Worker 轮询 WAL 发现变化 | 已完成 | 消费消息 |
| 6 | Worker ACK | 已完成 | 消息已处理 |

### 与普通消息队列的对比

| 特性 | 普通 MQ（RabbitMQ/Kafka） | honker（事务型外盒） |
|------|--------------------------|---------------------|
| 数据一致性 | ❌ 两步操作，可能不一致 | ✅ 单事务保证原子性 |
| 运维复杂度 | 🔴 需要独立服务 | 🟢 零额外服务 |
| 部署成本 | 🔴 需要 MQ 服务器 | 🟢 随 SQLite 一起部署 |
| 消息持久化 | ✅ 支持 | ✅ 支持 |
| 消息顺序保证 | ✅ 支持 | ✅ 支持 |
| 跨进程通信 | ✅ 支持 | ✅ 支持（通过 WAL 轮询） |
| 横向扩展 | ✅ 优秀 | 🟡 适合单机/小规模 |
| 适用场景 | 大型分布式系统 | 单机应用、边缘部署、AI Agent`,

      table: {
        headers: ["场景", "推荐方案", "原因"],
        rows: [
          ["AI Agent 任务队列", "honker Queue", "任务需要可靠执行，Worker 崩溃可重试"],
          ["实时事件推送（Dashboard）", "honker Stream", "需要持久化事件历史"],
          ["邮件/通知发送", "honker Queue + ACK", "确保每条消息都被处理"],
          ["数据变更捕获（CDC）", "honker Stream", "记录所有数据变更"],
          ["微服务间通信", "Kafka/RabbitMQ", "跨机器、高吞吐场景"],
          ["高可用要求", "RabbitMQ + 集群", "honker 不适合多节点部署"],
        ],
      },
    },
    {
      title: "四、honker 的 20+ 自定义 SQL 函数详解",
      body: `honker 扩展提供了 20+ 自定义 SQL 函数，让你可以直接在 SQL 中操作队列和流。这是 honker 的一大亮点——你可以在存储过程、触发器中使用这些函数。

### 核心函数速查表

| 函数 | 说明 | 返回值 |
|------|------|--------|
| \`notify(channel, payload)\` | 发送通知（类似 PostgreSQL） | 受影响的行数 |
| \`honker_stream_read_since(stream, offset, limit)\` | 从偏移量读取流消息 | JSON 数组 |
| \`honker_stream_publish(stream, payload)\` | 发布事件到流 | 消息 ID |
| \`honker_stream_count(stream)\` | 流中消息总数 | INTEGER |
| \`honker_queue_enqueue(queue, payload)\` | 入队 | 消息 ID |
| \`honker_queue_claim(queue, worker, timeout)\` | 消费并锁定消息 | JSON 或 NULL |
| \`honker_queue_ack(queue, message_id)\` | 确认消息完成 | 受影响的行数 |
| \`honker_queue_nack(queue, message_id)\` | 拒绝消息（重新入队） | 受影响的行数 |
| \`honker_queue_depth(queue)\` | 队列深度（未消费消息数） | INTEGER |

### 实战示例：用 SQL 直接操作

\`\`\`sql
-- 发送通知（类似 PostgreSQL 的 NOTIFY）
SELECT notify('orders', '{"id":42}');

-- 从流中读取最近 1000 条消息
SELECT honker_stream_read_since('orders', 0, 1000);

-- 查看队列深度
SELECT honker_queue_depth('email-jobs');
\`\`\`

### 在触发器中使用 honker

\`\`\`sql
-- 创建触发器：当订单状态变更时，自动发布事件
CREATE TRIGGER order_status_changed
AFTER UPDATE OF status ON orders
WHEN (OLD.status != NEW.status)
BEGIN
    SELECT honker_stream_publish(
        'order-events',
        json_object(
            'order_id', NEW.id,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'timestamp', datetime('now')
        )
    );
END;
\`\`\`

> 关键优势： 这意味着你的 honker 应用可以与任何其他 SQLite 应用（如 LiteParse、Datasette、甚至 Electron 应用）无缝集成，只需在同一个数据库文件上注册 honker 扩展。`,
      code: [
        {
          lang: "python",
          title: "完整示例：honker + 触发器实现订单处理系统",
          code: `import honker
import json

db = honker.open("shop.db")

# 1. 创建表
db.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        product TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")

# 2. 创建触发器（在 Python 中注册 honker 函数）
# 注：实际触发器需在 honker 扩展加载后创建

# 3. 创建订单流
order_stream = db.stream("order-events")

# 4. 创建订单（会自动触发流发布）
with db.transaction() as tx:
    tx.execute(
        "INSERT INTO orders (product, status) VALUES (?, ?)",
        ["MacBook Pro", "pending"]
    )
    # 触发器会自动发布事件到流
    # 如果没有触发器，手动发布：
    # order_stream.publish(
    #     {"action": "order_created", "product": "MacBook Pro"},
    #     tx=tx
    # )

# 5. 消费订单事件
async for event in order_stream.subscribe(consumer="order-processor"):
    data = json.loads(event)
    print(f"处理订单事件: {data}")
    # 可以触发 AI Agent 处理：
    # - 发送确认邮件
    # - 检查库存
    # - 更新推荐模型`,
        },
      ],
    },
    {
      title: "五、honker 在 AI Agent 架构中的应用场景",
      body: `honker 特别适合 AI Agent 系统，原因如下：

### 场景一：AI Agent 任务队列

AI Agent 通常需要处理大量异步任务：
- 生成内容后发送通知
- 分析数据后更新报告
- 监控指标后触发告警

使用 honker Queue，你可以构建可靠的 Agent 任务管道。

### 场景二：AI Agent 事件溯源

使用 honker Stream，你可以记录 Agent 的所有决策和操作。

### 场景三：多 Agent 协作

honker 的队列和流可以天然支持多 Agent 协作模式：

| Agent | 消费来源 | 发布目标 | 协作模式 |
|-------|---------|---------|---------|
| Research Agent | 用户请求队列 | 研究结果流 | 接收任务，发布结果 |
| Writing Agent | 研究结果流 | 草稿队列 | 基于研究写草稿 |
| Review Agent | 草稿队列 | 审核结果流 | 审核并评分 |
| Publishing Agent | 审核结果流 | 发布事件流 | 发布最终内容 |`,
      code: [
        {
          lang: "python",
          title: "场景一：AI Agent 任务队列实战",
          code: `import honker
import asyncio

db = honker.open("agent.db")
agent_queue = db.queue("agent-tasks")

# Agent 主循环：派发任务
async def dispatch_agent_task(task_type: str, payload: dict):
    agent_queue.enqueue({
        "type": task_type,
        "payload": payload,
        "priority": payload.get("priority", 5),
        "created_at": time.time()
    })

# Worker：处理任务
async def process_agent_tasks():
    async for job in agent_queue.claim("agent-worker-1"):
        task = job.payload
        if task["type"] == "generate_report":
            report = await ai_generate_report(task["payload"])
            # 将结果写回数据库
            job.ack()`,
        },
        {
          lang: "python",
          title: "场景二：AI Agent 事件溯源",
          code: `# 记录 Agent 的每个决策
decision_stream = db.stream("agent-decisions")

with db.transaction() as tx:
    # 保存决策到数据库
    tx.execute(
        "INSERT INTO decisions (agent_id, action, context) VALUES (?, ?, ?)",
        [agent_id, action, json.dumps(context)]
    )
    # 同时发布到事件流（用于实时监控/调试）
    decision_stream.publish({
        "agent_id": agent_id,
        "action": action,
        "timestamp": time.time(),
        "context": context
    }, tx=tx)`,
        },
      ],
      mermaid: `graph LR
    A[用户请求] --> B[Request Queue]
    B --> C[Research Agent]
    C --> D[Research Stream]
    D --> E[Writing Agent]
    E --> F[Draft Queue]
    F --> G[Review Agent]
    G --> H[Review Stream]
    H --> I[Publish Agent]
    I --> J[Published Stream]
    
    J --> K[Dashboard]
    J --> L[API]
    class J s4
    class H s3
    class F s2
    class D s1
    class B s0
    classDef s0 fill:#1e3a5f,stroke:#333,color:#f1f5f9
    classDef s1 fill:#1e3a5f,stroke:#333,color:#f1f5f9
    classDef s2 fill:#1e3a5f,stroke:#333,color:#f1f5f9
    classDef s3 fill:#1e3a5f,stroke:#333,color:#f1f5f9
    classDef s4 fill:#1e3a5f,stroke:#333,color:#f1f5f9`,
    },
    {
      title: "六、性能基准与部署指南",
      body: `### 性能特征

honker 的性能特点：

| 指标 | 数值 | 说明 |
|------|------|------|
| WAL 轮询间隔 | 1ms | 理论最小延迟 |
| 单 DB 并发写入 | ~1000 TPS | SQLite 限制 |
| 队列消费延迟 | 1-5ms | WAL 轮询 + 消费开销 |
| 消息持久化 | 零丢失 | WAL 保证 |
| 内存占用 | < 50MB | 纯 SQLite 扩展 |
| 磁盘占用 | 取决于消息量 | WAL 模式需要额外空间 |

### 部署方式

\`\`\`bash
# 1. 安装 honker（Python 绑定）
pip install honker

# 2. 或使用 Rust 原生版
cargo add honker

# 3. 加载扩展到 SQLite
# Python:
import honker
db = honker.open("myapp.db")

# 或使用标准 sqlite3 + 加载扩展
import sqlite3
conn = sqlite3.connect("myapp.db")
conn.load_extension("/path/to/honker.so")
\`\`\`

### 与竞品对比总结

| 方案 | 部署复杂度 | 数据一致性 | 消息延迟 | 适用规模 | 推荐指数 |
|------|-----------|-----------|---------|---------|---------|
| honker | ⭐ 极低（单文件） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (1-5ms) | 单机/边缘 | ⭐⭐⭐⭐⭐ |
| Redis | ⭐⭐⭐ 中等 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ (<1ms) | 中小型 | ⭐⭐⭐⭐ |
| RabbitMQ | ⭐⭐⭐⭐ 较高 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 中大型 | ⭐⭐⭐ |
| Kafka | ⭐⭐⭐⭐⭐ 很高 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 大型 | ⭐⭐⭐ |
| SQLite 轮询 | ⭐ 极低 | ⭐⭐ | ⭐⭐ (100ms+) | 小型 | ⭐⭐ |

> 核心结论： honker 不是 Kafka 的替代品——它解决的是不同的问题。如果你需要一个零运维、事务一致、低延迟的消息机制来支撑单机或边缘部署的 AI Agent 系统，honker 是目前 SQLite 生态中最好的选择。`,
    },
  ],
};
