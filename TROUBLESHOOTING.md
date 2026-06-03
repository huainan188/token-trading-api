# Token Trading API - 故障排除指南

## 常见问题

### 1. 数据库连接错误

#### 问题
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

#### 解决方案

检查 PostgreSQL 是否运行：
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
sc query PostgreSQL
```

启动 PostgreSQL：
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker-compose up -d postgres
```

检查连接配置：
```bash
# 测试连接
psql -h localhost -U postgres -d token_trading_db
```

### 2. 端口被占用

#### 问题
```
Error: listen EADDRINUSE :::3000
```

#### 解决方案

查找占用端口的进程：
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

杀死进程：
```bash
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

或更改 PORT 环境变量：
```bash
PORT=3001 npm run dev
```

### 3. JWT Token 错误

#### 问题
```
Error: Invalid token
TokenExpiredError: jwt expired
```

#### 解决方案

确保 JWT_SECRET 正确设置：
```bash
# .env 中
JWT_SECRET=your_secret_key
```

刷新 token：
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer <expired_token>"
```

### 4. 数据库迁移失败

#### 问题
```
Error: relation "users" does not exist
```

#### 解决方案

运行迁移脚本：
```bash
npm run migrate
```

手动检查表：
```bash
psql -h localhost -U postgres -d token_trading_db -c "\dt"
```

### 5. 依赖安装失败

#### 问题
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

#### 解决方案

清除缓存并重新安装：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 6. 权限错误

#### 问题
```
Error: EACCES: permission denied
```

#### 解决方案

```bash
# 给脚本添加执行权限
chmod +x scripts/*.sh

# 或使用 sudo
sudo npm start
```

### 7. Docker 相关问题

#### Docker Compose 启动失败

```bash
# 查看日志
docker-compose logs

# 重建容器
docker-compose down
docker-compose up --build

# 清理所有容器和卷
docker-compose down -v
```

#### 容器连接问题

```bash
# 检查网络
docker network ls
docker network inspect token-network

# 查看容器网络
docker inspect <container_id>
```

### 8. 性能问题

#### 数据库查询慢

添加索引：
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
```

分析查询：
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;
```

#### 内存泄漏

检查日志：
```bash
npm run dev 2>&1 | grep -i "memory\|leak"
```

使用内存分析工具：
```bash
npm install -g clinic
clinic doctor -- node server.js
```

### 9. CORS 错误

#### 问题
```
Access to XMLHttpRequest blocked by CORS policy
```

#### 解决方案

在 `.env` 中配置 CORS：
```env
CORS_ORIGIN=http://localhost:3001
# 或允许所有
CORS_ORIGIN=*
```

### 10. 认证问题

#### 无法登录

检查用户是否存在：
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

检查数据库中的用户：
```sql
SELECT id, email, username FROM users;
```

重置密码：
```bash
# 手动更新密码哈希
UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'user@example.com';
```

## 调试技巧

### 启用详细日志

```bash
DEBUG=* npm run dev
```

### 检查环境变量

```bash
node -e "console.log(process.env)"
```

### 使用 Chrome DevTools 进行 API 调试

```bash
# 启用 Node 检查模式
node --inspect server.js
```

然后访问 `chrome://inspect`

### 使用 Postman 测试 API

1. 导入 Postman 集合
2. 设置环境变量
3. 测试每个端点

### 查看数据库连接池

```bash
// 在代码中添加
console.log(pool.totalCount, pool.idleCount);
```

## 获取帮助

如果问题仍未解决：

1. 📖 查看 [文档](README.md)
2. 🔍 搜索 [已知问题](https://github.com/huainan188/token-trading-api/issues)
3. 📝 创建 [新 Issue](https://github.com/huainan188/token-trading-api/issues/new)
4. 💬 加入 [讨论](https://github.com/huainan188/token-trading-api/discussions)

## 性能优化建议

1. 启用查询缓存
2. 使用 Redis 缓存会话
3. 实现异步队列处理
4. 使用 CDN 加载静态资源
5. 配置数据库连接池
6. 启用 gzip 压缩
7. 使用负载均衡器
8. 定期监控和优化

## 备份和恢复

### 备份数据库

```bash
./scripts/backup.sh
```

### 恢复数据库

```bash
./scripts/restore.sh ./backups/backup_20260603_120000.dump
```

---

如有问题，请提交 Issue 或联系支持团队。
