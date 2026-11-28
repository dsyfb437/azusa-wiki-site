---
title: C 结构体的对齐与填充
publish: true
tags: [C语言, 内存, 待核对]
---

# C 结构体的对齐与填充

旧练习在本机交换一个 `char` 和一个 `int` 的声明顺序，两次测得的结构体大小都是 8 字节。第二次测量尤其值得看。`int` 已经放在开头，`char` 后面还有什么？

假设当前实现上 `char` 占 1 字节，`int` 占 4 字节、要求 4 字节对齐，这两种结构体也都要求 4 字节对齐。成员按声明顺序排列，普通成员之间和结构体末尾都允许留出填充。

| 声明顺序 | 字节 0 | 字节 1–3 | 字节 4 | 字节 5–7 |
| --- | --- | --- | --- | --- |
| `char c; int x;` | `c` | 填充 | `x` 的一部分 | `x` 的其余部分 |
| `int x; char c;` | `x` 的一部分 | `x` 的其余部分 | `c` | 尾部填充 |

第二行的尾部填充可以从数组解释。若两个结构体挨着放，而第一个元素只占 5 字节，第二个元素的 `int` 就会从偏移 5 开始。让每个元素占 8 字节，数组里的每个元素都能从合适的边界开始。对齐要求取决于类型和实现，同一类型的字节数与对齐要求也可能不同。

下面的 C11 小程序可以在当前编译环境核对成员偏移、结构体大小和对齐要求。`sizeof` 的结果类型是 `size_t`，用 `%zu` 输出。

```c
#include <stddef.h>
#include <stdio.h>

struct A { char c; int x; };
struct B { int x; char c; };

int main(void) {
    printf("A: x=%zu size=%zu align=%zu\n",
           offsetof(struct A, x), sizeof(struct A), _Alignof(struct A));
    printf("B: c=%zu size=%zu align=%zu\n",
           offsetof(struct B, c), sizeof(struct B), _Alignof(struct B));
    return 0;
}
```

这也说明逐字节写出结构体时会把填充包括进去。需要指定文件格式时，应约定各字段的长度和编码，逐字段读写。复习数组与指针各自对 `sizeof` 的影响，见[程算 06 数组与字符串](程序设计与算法基础/程算%2006%20数组与字符串.md)。
