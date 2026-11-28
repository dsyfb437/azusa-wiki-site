---
title: Git 分支
publish: true
tags: [Git, 开发工具, 待核对]
---

# Git 分支

Git 的分支是一个指向提交的可移动引用。两个人可以从同一份代码分别试改，保留各自的提交历史，再决定哪些改动适合合并。

假设 `main` 指向提交 A。在 A 上执行 `git switch -c notes/git-workflow`，此时两个分支都指向 A，`HEAD` 指向新分支。在新分支暂存修改，再提交为 B，只有 `notes/git-workflow` 前移到了 B。切回 `main`，工作区中已提交的文件会呈现 A 的内容。如果接着在 `main` 上提交 C，B 和 C 便有了共同的父提交 A。可以用 `git log --all --graph --decorate --oneline` 查看两条路径。

## 从各自试改到合并

原练习把主分支回滚比作联机游戏恢复备份。一个人试改时很直观，多人同时推进时，恢复旧状态还会影响别人刚完成的工作。分支使旧版本可以作为分岔的起点，主分支仍能继续更新。

GitHub 的 Pull Request 可以比较两条分支，供协作者评审改动。比较的是已经提交的版本。若刚改的标题没有出现，先回到[[Git 暂存区]]，看它还在工作区、已暂存，还是已经随提交进入该分支。

## 出处

Scott Chacon 与 Ben Straub 在 *Pro Git* 第 3.1 节用提交图解释分支与 `HEAD` 的移动。[Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
