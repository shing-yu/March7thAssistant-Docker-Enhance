<div align="center">
  <h1>🐳 March7thAssistant Docker-Enhance</h1>
  <p>专为每日任务场景、Docker 容器化部署和远程 Web 管理设计的 <b>三月七小助手</b> 增强版本</p>

  <a href="https://github.com/shing-yu/March7thAssistant-Docker-Enhance/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/shing-yu/March7thAssistant-Docker-Enhance"></a>
  <a href="https://github.com/shing-yu/March7thAssistant-Docker-Enhance/pulls"><img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/shing-yu/March7thAssistant-Docker-Enhance"></a>
  <img alt="License" src="https://img.shields.io/badge/License-GPL%20v3-blue.svg">
</div>

<br/>

> [!WARNING]  
> **功能限制说明**：本增强版专注于**每日任务自动化**及轻量级远程管理，暂不支持差分宇宙、货币战争等高阶扩展功能。如需完整体验，请使用原版桌面端。

---

## ✨ 核心增强功能

* 🖥️ **全新 Web 管理界面**
    * 基于 **Vue 3 + Element Plus** 构建的现代化响应式后台。
    * 完美适配移动端浏览器，支持侧边栏抽屉导航，支持深色/浅色模式无缝切换。
* 👥 **多账号与权限系统 (RBAC)**
    * **无限多开**：支持无限账号添加，并可灵活调整每个账号的执行队列顺序。
    * **管理员模式**：使用全局 Token 登录，统筹管理所有账号与系统配置。
    * **用户模式**：使用账号专属密钥（Secret Key）登录，用户仅能查看自身状态并修改私有任务配置。
* ⚙️ **灵活的配置策略**
    * 支持**全局通用配置**与**账号特定配置覆盖 (Config Override)**，极大提升多账号维护效率。
* 📱 **无痛扫码登录**
    * Web 界面深度集成“云·星穹铁道”扫码流程。
    * 直接使用米游社 App 扫码即可完成授权，全程**无需接触容器内部环境**。

---

## 🚀 快速部署 (Docker)

### 1. 准备配置文件
在您的服务器上创建一个新目录并新建 `docker-compose.yml` 文件：

```bash
mkdir m7a-docker && cd m7a-docker
vim docker-compose.yml
```

### 2. 写入 Docker Compose 配置
将以下内容填入 `docker-compose.yml` 中，并按需修改环境变量：

```yaml
services:
  march7thassistant:
    container_name: m7a
    image: ghcr.io/shing-yu/march7thassistant-docker-enhance:main
    ports:
      - "18080:8080"  # [宿主机端口]:[容器内端口]，可根据需求修改左侧端口
    volumes:
      - ./logs:/m7a/logs
      - ./3rdparty/WebBrowser/UserProfile:/m7a/3rdparty/WebBrowser/UserProfile
      - ./webui/data:/m7a/webui/data
    environment:
      - MARCH7TH_LOG_LEVEL=DEBUG
      - WEBUI_TOKEN=your_secret_token_here  # ⚠️ 请务必修改为您自己的强密码 Token
    network_mode: "bridge"
    shm_size: 1g
    restart: unless-stopped
```

### 3. 启动服务
使用以下命令在后台拉取镜像并启动容器：

```bash
docker compose up -d
```
> 启动后，打开浏览器访问 `http://<服务器IP>:18080`，使用您在 `WEBUI_TOKEN` 中设置的密码进行初始登录。

---

## 📖 简易使用指南

1.  **添加账号**：登录 WebUI 后，前往“账号配置”页面，点击右上角“新增账号”，输入易于辨识的备注名。
2.  **扫码授权**：在账号列表中点击“扫码登录”，打开手机上的**米游社 App** 扫描屏幕上的二维码完成登录。
3.  **配置任务**：
    * 前往“任务配置”页面。
    * 您可以在**“全局配置”**中设定通用规则，或选中特定账号进行**“覆盖配置”**。
    * 支持**简洁模式**（可视化开关）与**高级模式**（直编 YAML 文件）。
4.  **启动执行**：转到“运行与日志”页面，点击“启动任务”即可开启自动化流程，实时查看运行日志。
5.  **权限分发**：管理员可在账号列表中提取每个账号生成的**“账号密钥”**，将其发送给对应的代挂用户，实现用户自助管理。

---

## 💻 系统配置要求

确保您的宿主机满足以下条件，以保证 OCR 识别与浏览器环境的稳定运行：

| 硬件/环境 | 最低要求 | 推荐配置 | 说明                       |
| :--- | :--- | :--- |:-------------------------|
| **操作系统** | Linux (Ubuntu, Debian, CentOS 等) | Linux 纯净环境 | 需已安装并正常运行 Docker 环境      |
| **内存 (RAM)** | **4 GB** | 8 GB 或以上 | ⚠️ 内存不足易导致运行崩溃或 OCR 识别失败 |
| **处理器 (CPU)**| 1 核 | 2 核或以上 | 影响启动速度与图像识别效率            |

---

## 🤝 参与贡献

我们非常欢迎任何形式的贡献！
* 🐛 提交 [Issue](https://github.com/shing-yu/March7thAssistant-Docker-Enhance/issues) 反馈 Bug 或提出功能建议。
* 🛠️ 提交 Pull Request (PR) 贡献代码。
* 📝 帮助我们完善文档或进行多语言翻译。

## 📄 许可证

本项目采用与原项目一致的开源许可证（[GPL-3.0](LICENSE)）。请遵循相关法律法规，仅用于个人学习、技术研究及自动化测试。

---

> [!TIP]
> **以下为原项目 README 内容：**

---

<div align="center">
  <h1 align="center">
    <img src="./assets/screenshot/March7th.png" width="200">
    <br/>
    March7thAssistant
  </h1>
  <a href="https://trendshift.io/repositories/3892" target="_blank"><img src="https://trendshift.io/api/badge/repositories/3892" alt="moesnow%2FMarch7thAssistant | Trendshift" style="width: 200px; height: 46px;" width="250" height="46"/></a>
</div>

<br/>

<div align="center">
🌟 点一下右上角的 Star，Github 主页就能收到软件更新通知了哦~
</div>

<div align="center">
    <img src="assets/screenshot/star.gif" alt="Star" width="186" height="60">
</div>

<br/>

<div align="center">

**简体中文** | [繁體中文](./README_TW.md) | [English](./README_EN.md) | [日本語](./README_JA.md) | [한국어](./README_KR.md)

快速上手，请访问：[使用教程](https://m7a.top/#/assets/docs/Tutorial)

遇到问题，请在提问前查看：[FAQ](https://m7a.top/#/assets/docs/FAQ)

</div>

## 功能简介

- **日常**：清体力、每日实训、领取奖励、委托、锄大地
- **周常**：历战余响、货币战争、差分宇宙、混沌回忆、虚构叙事、末日幻影
- **云·星穹铁道**：支持后台运行、无窗口运行和 Docker 运行
- **抽卡记录导出**：支持 [UIGF](https://uigf.org/zh/standards/uigf.html)/[SRGF](https://uigf.org/zh/standards/srgf.html) 标准
- **工具箱**：自动对话、解锁帧率、兑换码
- 每日实训等任务的完成情况支持**消息推送**
- 任务刷新或体力恢复到指定值后**自动启动**
- 任务完成后**声音提示、自动关闭游戏或关机等**

详情见 图形界面设置 或 [配置文件](assets/config/config.example.yaml)｜QQ群 [点击跳转](https://qm.qq.com/q/C3IryUWCQw) TG群 [点击跳转](https://t.me/+ZgH5zpvFS8o0NGI1)  哔哩哔哩 [点击跳转](https://space.bilibili.com/3706960664857075) 

## 界面展示

![README](assets/screenshot/README.png)

## 注意事项

- 遇到错误请在 [Issue](https://github.com/moesnow/March7thAssistant/issues) 反馈，提问讨论可以在 [Discussions](https://github.com/moesnow/March7thAssistant/discussions) ，群聊随缘看
- 欢迎 [PR](https://github.com/moesnow/March7thAssistant/pulls)，提交前请先阅读 [贡献指南](CONTRIBUTING.md)

## 下载安装

前往 [Releases](https://github.com/moesnow/March7thAssistant/releases/latest) 下载后解压双击三月七图标的 `March7th Launcher.exe` 打开图形界面

## 源码运行

如果你是完全不懂的小白，请通过上面的方式下载安装，可以不用往下看了。

推荐使用 Python 3.12 或更高版本。

Windows 下如果通过终端启动，建议使用管理员模式打开 PowerShell、Windows Terminal 或 CMD；Windows 11 24H2 及以上也可以按 [Sudo for Windows](https://learn.microsoft.com/zh-cn/windows/advanced-settings/sudo/) 的方式执行。

```cmd
# Installation (using venv is recommended)
git clone --recurse-submodules https://github.com/moesnow/March7thAssistant
cd March7thAssistant
pip install -r requirements.txt
python app.py
python main.py

# Update
git pull
git submodule update --init --recursive
```

如果使用 `uv`，推荐直接使用项目自带的 `pyproject.toml` 工作流：

```cmd
# Installation (using uv)
git clone --recurse-submodules https://github.com/moesnow/March7thAssistant
cd March7thAssistant
uv sync

# 启动图形界面
uv run python app.py

# 查看命令行帮助
uv run python main.py -h

# 执行完整运行
uv run python main.py

# 执行每日实训
uv run python main.py daily
```

<details>
<summary>开发相关</summary>

获取 crop 参数表示的裁剪坐标可以通过小助手工具箱内的捕获截图功能

</details>

---

如果喜欢本项目，可以微信赞赏送作者一杯咖啡☕

您的支持就是作者开发和维护项目的动力🚀

![sponsor](assets/app/images/sponsor.jpg)

---

## 相关项目

March7thAssistant 离不开以下开源项目和运行时依赖的帮助，感谢所有维护者与贡献者：

- 模拟宇宙自动化 [https://github.com/CHNZYX/Auto_Simulated_Universe](https://github.com/CHNZYX/Auto_Simulated_Universe) ：提供模拟宇宙相关能力
- 锄大地自动化 [https://github.com/linruowuyin/Fhoe-Rail](https://github.com/linruowuyin/Fhoe-Rail) ：提供锄大地相关能力
- OCR 文字识别 [https://github.com/RapidAI/RapidOCR](https://github.com/RapidAI/RapidOCR) ：提供游戏内文字识别能力
- 图形界面组件库 [https://github.com/zhiyiYo/PyQt-Fluent-Widgets](https://github.com/zhiyiYo/PyQt-Fluent-Widgets) ：提供主要界面组件与交互体验
- Mirror酱 [https://github.com/MirrorChyan/docs](https://github.com/MirrorChyan/docs) ：提供更新检查与下载分发以及 CDN 加速相关能力
- 图像处理与自动化相关依赖 `OpenCV`、`PyAutoGUI` 等：提供截图采集、图像处理与基础自动化能力
- 推理加速相关依赖 `ONNX Runtime`、`OpenVINO` ：为 OCR 和模型推理提供 CPU / GPU 加速支持

此外，`requirements.txt` 中还包含大量底层依赖，在这里不一一列出；同样感谢这些项目对本项目的支持。


## Contributors
<a href="https://github.com/moesnow/March7thAssistant/graphs/contributors">

  <img src="https://contrib.rocks/image?repo=moesnow/March7thAssistant" />

</a>

## Stargazers over time

[![Star History](https://starchart.cc/moesnow/March7thAssistant.svg?variant=adaptive)](https://starchart.cc/moesnow/March7thAssistant)
