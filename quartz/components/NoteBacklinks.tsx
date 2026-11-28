import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import { resolveRelative, simplifySlug, type FullSlug, type SimpleSlug } from "../util/path"
import type { QuartzComponent } from "./types"

const byTitle = new Intl.Collator("zh-CN", { numeric: true })
const previewLength = 6
type Section = { id: string; title: string }
type Mention = { section?: Section; navigation: boolean; order: number }
type SourceLink = { slug: FullSlug; title: string; section?: Section }

const locations = new WeakMap<Root, Map<SimpleSlug, Mention>>()
const navigationLabel =
  /^(?:[上下]一[篇章节](?:[：:\s].*)?|第\s*[\d一二三四五六七八九十百]+\s*[章节篇]|返回(?:课程目录|复习目录|领域索引|数学与算法|计算机与工程)|(?:课程|复习|章节)目录)$/

function textOf(element: Element): string {
  let text = ""
  visit(element, "text", (node) => {
    text += node.value
  })
  return text.trim()
}

function sourceMentions(tree: Root): Map<SimpleSlug, Mention> {
  const cached = locations.get(tree)
  if (cached) return cached
  const found = new Map<SimpleSlug, Mention>()
  let section: Section | undefined
  let order = 0
  visit(tree, "element", (node) => {
    if (/^h[1-6]$/.test(node.tagName)) {
      const id = node.properties.id
      section =
        typeof id === "string" && node.tagName !== "h1" ? { id, title: textOf(node) } : undefined
    }
    if (node.tagName !== "a") return
    const slug = node.properties["data-slug"] ?? node.properties.dataSlug
    if (typeof slug !== "string") return
    const target = simplifySlug(slug as FullSlug)
    const existing = found.get(target)
    const navigation = navigationLabel.test(textOf(node))
    if (!existing || (existing.navigation && !navigation)) {
      found.set(target, { section, navigation, order })
    }
    order++
  })
  locations.set(tree, found)
  return found
}

export const NoteBacklinks: QuartzComponent = ({ fileData, allFiles }) => {
  const slug = fileData.slug
  if (!slug) return null

  const targets = new Set([slug, ...(fileData.aliases ?? [])].map(simplifySlug))
  const notes: SourceLink[] = []
  const guides: SourceLink[] = []
  let hasChapterNavigation = false
  for (const source of allFiles) {
    if (
      !source.slug ||
      source.slug === slug ||
      source.unlisted ||
      source.frontmatter?.publish !== true
    )
      continue
    if (!source.links?.some((link) => targets.has(link))) continue
    const isGuide =
      source.slug === "index" ||
      source.frontmatter.type === "map" ||
      source.aliases?.some((alias) => alias.endsWith("/index"))
    const link: SourceLink = { slug: source.slug, title: source.frontmatter.title }
    if (isGuide) {
      guides.push(link)
      continue
    }
    let mention: Mention | undefined
    if (source.htmlAst) {
      const occurrences = sourceMentions(source.htmlAst)
      for (const target of targets) {
        const next = occurrences.get(target)
        if (
          next &&
          (!mention ||
            (mention.navigation && !next.navigation) ||
            (mention.navigation === next.navigation && next.order < mention.order))
        )
          mention = next
      }
    }
    if (mention?.navigation) {
      hasChapterNavigation = true
      guides.push(link)
    } else {
      notes.push({ ...link, section: mention?.section })
    }
  }

  function links(items: typeof notes) {
    return (
      <ul>
        {items.map((source) => (
          <li key={source.slug}>
            <a
              class="internal"
              href={
                resolveRelative(slug!, source.slug) +
                (source.section ? "#" + encodeURIComponent(source.section.id) : "")
              }
            >
              {source.title}
              {source.section && <span class="backlink-section"> · {source.section.title}</span>}
            </a>
          </li>
        ))}
      </ul>
    )
  }
  notes.sort((a, b) => byTitle.compare(a.title, b.title))
  guides.sort((a, b) => byTitle.compare(a.title, b.title))
  return (
    <section class="note-backlinks" aria-labelledby="note-backlinks-heading">
      <h2 id="note-backlinks-heading">引用本页的笔记</h2>
      {notes.length ? (
        links(notes.slice(0, previewLength))
      ) : (
        <p>暂时没有其他公开笔记在正文中引用本页。</p>
      )}
      {notes.length > previewLength && (
        <details>
          <summary>另有 {notes.length - previewLength} 篇笔记</summary>
          {links(notes.slice(previewLength))}
        </details>
      )}
      {guides.length > 0 && (
        <details open={notes.length === 0}>
          <summary>
            {hasChapterNavigation ? "目录与章节导航" : "收录本页的目录"}（{guides.length}）
          </summary>
          {links(guides)}
        </details>
      )}
    </section>
  )
}
