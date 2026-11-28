---
title: Git 的暂存、提交与分支
publish: true
tags: [Git, 开发工具, 待核对]
---

# Git 的暂存、提交与分支

改一篇笔记时，磁盘上的内容、准备提交的内容和上次提交里的内容可能同时是三个版本。`git status` 会分别显示已暂存和未暂存的改动。

| 想确认的问题 | 命令 |
| --- | --- |
| 从上次提交到现在，哪些文件有变化？ | `git status --short` |
| 已跟踪文件中，哪些修改还没放入暂存区？ | `git diff` |
| 现在提交，会记录哪些修改？ | `git diff --cached` |
| 当前分支最近记录了什么？ | `git log --oneline -5` |

例如改完 `notes.md` 的标题，执行 `git add -- notes.md`，然后又改正文。此时 `git diff --cached` 能看到标题，`git diff` 能看到后来改的正文。通常的 `git commit -m "修改笔记标题"` 只提交已暂存的标题，正文仍在工作区里。若想把正文也放进这次提交，再对这个路径运行一次 `git add`。原练习把不带路径的 `git add` 记成了“添加所有更改”，而暂存整个仓库的增删改需要明确运行 `git add -A`。

## 已经能回滚了，为什么还要分支？

原练习把回滚主分支比作联机游戏恢复备份。一个人试改时很直观，多人同时推进时，恢复旧状态可能连别人刚完成的工作也要重新处理。建分支是在同一个起点上允许两条提交历史分别向前走。

例如从当前提交运行 `git switch -c notes/git-workflow`，后续提交会移动新分支的指针。主分支可以继续接收别人的改动。打算合并时，GitHub 的 Pull Request 可以并列展示两条分支间的差异，协作者据此讨论、修改和合并。在本机创建分支和提交都属于 Git 的功能，托管、网页评审则由 GitHub 提供。

[[远程项目的迁移与恢复验证|在另一台机器上恢复项目]]时，这三个位置的差别会再次出现。一次普通克隆可以取回远端分支已有的提交；本机暂存区的快照和工作区后来改过的段落，需要另行保存。

## 出处

命令例子从 GitHub Skills 学习记录《Git Learning Notes》整理。Scott Chacon 与 Ben Straub 的 *Pro Git* 第二版，第 2.2 节解释工作区与暂存区，第 3.1 节解释分支引用如何随提交移动。[记录更改](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository) · [分支简介](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)

[计算机与工程](计算机与工程.md)
