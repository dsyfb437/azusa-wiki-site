import { visit } from "unist-util-visit"
import { resolveRelative, simplifySlug, type FullSlug, type SimpleSlug } from "../util/path"
import type { QuartzComponent } from "./types"

export const HomeNavigation: QuartzComponent = ({ allFiles, fileData }) => {
  const home = allFiles.find((file) => file.slug === "index")
  if (!home?.htmlAst || !fileData.slug) return null

  const guides = new Map<SimpleSlug, FullSlug>()
  for (const file of allFiles) {
    if (!file.slug || file.unlisted || file.frontmatter?.publish !== true) continue
    if (file.frontmatter.type !== "map" && !file.aliases?.some((slug) => slug.endsWith("/index")))
      continue
    for (const name of [file.slug, ...(file.aliases ?? [])]) {
      guides.set(simplifySlug(name), file.slug)
    }
  }

  // List entries on the homepage supply both the reading order and the author's link labels.
  const links = new Map<FullSlug, string>()
  visit(home.htmlAst, { type: "element", tagName: "li" }, (item) => {
    visit(item, { type: "element", tagName: "a" }, (anchor) => {
      const slug = anchor.properties["data-slug"] ?? anchor.properties.dataSlug
      if (typeof slug !== "string") return
      const guide = guides.get(simplifySlug(slug as FullSlug))
      if (!guide || links.has(guide)) return
      let label = ""
      visit(anchor, "text", (text) => {
        label += text.value
      })
      links.set(guide, label)
    })
  })
  if (!links.size) return null
  const items = (
    <ul>
      {Array.from(links, ([slug, label]) => (
        <li key={slug}>
          <a
            class="internal"
            href={resolveRelative(fileData.slug!, slug)}
            aria-current={fileData.slug === slug ? "page" : undefined}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
  return (
    <nav class="home-navigation" aria-label="笔记导航">
      <div class="desktop-only">
        <h2>笔记导航</h2>
        {items}
      </div>
      <div class="mobile-only">
        <details>
          <summary>笔记导航</summary>
          {items}
        </details>
      </div>
    </nav>
  )
}
