import type { ExplorerOptions } from "@quartz-community/explorer"
import { componentRegistry } from "./quartz/components/registry"
import { NoteBacklinks } from "./quartz/components/NoteBacklinks"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  title: "笔记导航",
  // Explorer serializes this callback and runs it in the browser.
  mapFn: (root) => {
    if (root.slugSegment) return root
    const guides = [
      ["notes/微积分/微积分课程笔记", "微积分"],
      ["notes/线性代数/线性代数课程笔记", "线性代数"],
      ["notes/程序设计与算法基础/程序设计与算法基础课程笔记", "程序设计与算法基础"],
      ["notes/数学与算法", "数学与算法"],
      ["notes/计算机与工程", "计算机与工程"],
      ["notes/课程选读/课程资料专题选读", "课程专题选读"],
    ]
    const links: typeof root.children = []
    for (const [path, label] of guides) {
      let current: typeof root | undefined = root
      for (const segment of path.split("/")) {
        current = current?.children.find((child) => child.slugSegment === segment)
      }
      if (current) {
        current.displayName = label
        links.push(current)
      }
    }
    root.children = links
    return root
  },
  sortFn: () => 0,
} satisfies Partial<ExplorerOptions>)

const config = await loadQuartzConfig()
export default config
const siteLayout = await loadQuartzLayout()
const afterBody = siteLayout.byPageType.content?.afterBody ?? siteLayout.defaults.afterBody ?? []
export const layout = await loadQuartzLayout({
  byPageType: { content: { afterBody: [...afterBody, NoteBacklinks] } },
})
