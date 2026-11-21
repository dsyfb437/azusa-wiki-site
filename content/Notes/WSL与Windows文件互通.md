---
title: WSL 与 Windows 文件互通
publish: true
type: reference
status: growing
topics: [Linux, Windows, 工程]
---

# WSL 与 Windows 文件互通

## 文件位置与编辑器位置

Linux 文件可以由 Windows 图形编辑器打开。编辑器运行在 Windows，Git 和构建工具仍可在 WSL 中处理同一份文件。

Windows 中可以通过下面的地址访问某个发行版：

```text
\\wsl.localhost\Ubuntu-Dev\home\用户名\项目
```

把发行版名称和用户名替换成自己的即可。对任意实际文件，也可以在 WSL 中用 `wslpath -w 路径` 得到 Windows 可访问的表示。

## 常见操作

- 从 WSL 运行 `explorer.exe .`，在资源管理器中打开当前位置。若禁用了 Windows PATH 导入，需要使用可访问的 exe 完整路径或自定义命令。
- Windows 编辑器通过 UNC 路径打开 Markdown，WSL 中直接运行 Git。
- Linux 命令行工具频繁操作的项目，优先放在 Linux 文件系统中，减少跨文件系统访问开销。

## 注意

文件监听、大小写和权限行为可能因编辑器而异。多人协作或切换编辑器前，先用一个测试文件检查修改与刷新是否正常。不要绕过 WSL 共享路径，直接去修改虚拟磁盘内部文件。

## 来源

- [Microsoft：跨 Windows 与 Linux 文件系统工作](https://learn.microsoft.com/en-us/windows/wsl/filesystems)
- [计算机与工程目录](计算机与工程.md)
