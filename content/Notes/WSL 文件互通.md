---
title: WSL 文件互通
permalink: notes/wsl与windows文件互通
publish: true
type: reference
status: growing
topics: [Linux, Windows, 工程]
---

# WSL 文件互通

<span id="wsl-与-windows-文件互通"></span>

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

如果同一项目同时出现在 Windows 目录和发行版的主目录里，要先判断是同一份文件的两种访问路径，还是两个独立副本。[[项目恢复验证]]里的样例构建可以用来核实究竟恢复了哪一份。

## 来源

- Microsoft Learn 的 *Working across Windows and Linux file systems* 说明了项目的存放位置、从 Linux 打开资源管理器以及系统间的命令互操作。[Microsoft 原文](https://learn.microsoft.com/en-us/windows/wsl/filesystems)
- [计算机与工程目录](计算机与工程.md)
