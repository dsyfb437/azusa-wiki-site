---
title: Git 暂存区
permalink: notes/git-的暂存、提交与分支
publish: true
tags: [Git, 开发工具, 待核对]
---

# Git 暂存区

<span id="git-的暂存提交与分支"></span>

暂存区记录下一次常规提交要包含的文件内容。改一篇笔记时，磁盘上的内容、准备提交的内容和上次提交里的内容可能同时是三个版本。`git status` 会分别显示已暂存和未暂存的改动。

| 想确认的问题 | 命令 |
| --- | --- |
| 从上次提交到现在，哪些文件有变化？ | `git status --short` |
| 已跟踪文件中，哪些修改还没放入暂存区？ | `git diff` |
| 现在提交，会记录哪些修改？ | `git diff --cached` |
| 当前分支最近记录了什么？ | `git log --oneline -5` |

例如改完 `notes.md` 的标题，执行 `git add -- notes.md`，然后又改正文。此时 `git diff --cached` 能看到标题，`git diff` 能看到后来改的正文。通常的 `git commit -m "修改笔记标题"` 只提交已暂存的标题，正文仍在工作区里。若想把正文也放进这次提交，再对这个路径运行一次 `git add`。原练习把不带路径的 `git add` 记成了“添加所有更改”，而暂存整个仓库的增删改需要明确运行 `git add -A`。

## 已经能回滚了，为什么还要分支？

暂存区决定这次提交收下哪些修改。提交完成后，当前分支再前移到这个新版本。从同一版本分头修改时，两条历史怎样各自前进，见[[Git 分支]]。

[[项目恢复验证|在另一台机器上恢复项目]]时，这三个位置的差别会再次出现。一次普通克隆可以取回远端分支已有的提交；本机暂存区的快照和工作区后来改过的段落，需要另行保存。

## 出处

命令例子从 GitHub Skills 学习记录《Git Learning Notes》整理。Scott Chacon 与 Ben Straub 的 *Pro Git* 第二版，第 2.2 节解释工作区与暂存区，第 3.1 节解释分支引用如何随提交移动。[记录更改](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository) · [分支简介](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)

[计算机与工程](计算机与工程.md)
