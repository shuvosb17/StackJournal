export function isStubArticleContent(html: string): boolean {
  return html.includes("Discussed on Hacker News");
}
