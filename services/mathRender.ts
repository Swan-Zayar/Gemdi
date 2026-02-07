const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderMathSegment = (segment: string, displayMode: boolean) => {
  if (typeof window === "undefined" || !(window as any).katex) {
    return escapeHtml(segment);
  }

  try {
    return (window as any).katex.renderToString(segment.trim(), {
      displayMode,
      throwOnError: false
    });
  } catch (error) {
    return escapeHtml(segment);
  }
};

export const renderMathToHtml = (text: string) => {
  const input = text ?? "";
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g;
  let lastIndex = 0;
  let result = "";
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const before = input.slice(lastIndex, start);
    result += escapeHtml(before);

    const token = match[0];
    if (token.startsWith("$$")) {
      const content = token.slice(2, -2);
      result += renderMathSegment(content, true);
    } else {
      const content = token.slice(1, -1);
      result += renderMathSegment(content, false);
    }

    lastIndex = end;
  }

  result += escapeHtml(input.slice(lastIndex));
  return result;
};
