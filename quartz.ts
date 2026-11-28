import { HomeNavigation } from "./quartz/components/HomeNavigation"
import { NoteBacklinks } from "./quartz/components/NoteBacklinks"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const config = await loadQuartzConfig()
export default config
const siteLayout = await loadQuartzLayout()
const afterBody = siteLayout.byPageType.content?.afterBody ?? siteLayout.defaults.afterBody ?? []
// Some page types have a separate left toolbar; preserve explicitly empty slots (e.g. 404).
const sidebars = Object.fromEntries(
  Object.entries(siteLayout.byPageType)
    .filter(([, page]) => page?.left?.length)
    .map(([type, page]) => [type, { left: [...page!.left!, HomeNavigation] }]),
)
export const layout = await loadQuartzLayout({
  defaults: { left: [...(siteLayout.defaults.left ?? []), HomeNavigation] },
  byPageType: {
    ...sidebars,
    content: { ...sidebars.content, afterBody: [...afterBody, NoteBacklinks] },
  },
})
