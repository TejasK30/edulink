export const parseTemplate = (
  template: string,
  variables: Record<string, any>,
): string => {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    return variables[key]?.toString() ?? ""
  })
}
