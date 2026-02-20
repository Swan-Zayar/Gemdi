const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Convert markdown bold (**text**) to <strong> tags in already-escaped HTML */
const renderInlineMarkdown = (html: string): string =>
  html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const normalizeMathSymbols = (segment: string) => {
  const replacements: Array<[RegExp, string]> = [
    // Operators
    [/∑/g, "\\sum"],
    [/∏/g, "\\prod"],
    [/∐/g, "\\coprod"],
    [/∫/g, "\\int"],
    [/∮/g, "\\oint"],
    [/∇/g, "\\nabla"],
    [/∂/g, "\\partial"],
    [/√/g, "\\sqrt{}"],
    [/∞/g, "\\infty"],
    [/×/g, "\\times"],
    [/·/g, "\\cdot"],
    [/÷/g, "\\div"],
    [/±/g, "\\pm"],
    [/∓/g, "\\mp"],
    [/∗/g, "\\ast"],
    [/∘/g, "\\circ"],
    [/⊗/g, "\\otimes"],
    [/⊕/g, "\\oplus"],
    [/⊙/g, "\\odot"],
    [/⋅/g, "\\cdot"],
    [/⋆/g, "\\star"],

    // Relations
    [/≈/g, "\\approx"],
    [/≃/g, "\\simeq"],
    [/≅/g, "\\cong"],
    [/≡/g, "\\equiv"],
    [/≠/g, "\\neq"],
    [/≤/g, "\\leq"],
    [/≥/g, "\\geq"],
    [/≪/g, "\\ll"],
    [/≫/g, "\\gg"],
    [/⊂/g, "\\subset"],
    [/⊃/g, "\\supset"],
    [/⊆/g, "\\subseteq"],
    [/⊇/g, "\\supseteq"],
    [/⊄/g, "\\nsubset"],
    [/⊈/g, "\\nsubseteq"],
    [/∈/g, "\\in"],
    [/∉/g, "\\notin"],
    [/∋/g, "\\ni"],
    [/∝/g, "\\propto"],
    [/∥/g, "\\parallel"],
    [/∦/g, "\\nparallel"],
    [/∠/g, "\\angle"],
    [/∟/g, "\\rightangle"],

    // Logic / set
    [/∀/g, "\\forall"],
    [/∃/g, "\\exists"],
    [/∄/g, "\\nexists"],
    [/∅/g, "\\varnothing"],
    [/∧/g, "\\wedge"],
    [/∨/g, "\\vee"],
    [/¬/g, "\\neg"],
    [/⇒/g, "\\Rightarrow"],
    [/⇐/g, "\\Leftarrow"],
    [/⇔/g, "\\Leftrightarrow"],

    // Arrows
    [/→/g, "\\to"],
    [/←/g, "\\leftarrow"],
    [/↔/g, "\\leftrightarrow"],
    [/↦/g, "\\mapsto"],
    [/⇒/g, "\\Rightarrow"],
    [/⇐/g, "\\Leftarrow"],
    [/⇔/g, "\\Leftrightarrow"],
    [/↗/g, "\\nearrow"],
    [/↘/g, "\\searrow"],
    [/↙/g, "\\swarrow"],
    [/↖/g, "\\nwarrow"],

    // Numbers / constants
    [/ℏ/g, "\\hbar"],
    [/ℓ/g, "\\ell"],
    [/°/g, "\\circ"],
    [/′/g, "'"],
    [/″/g, "''"],
    [/‰/g, "\\permil"],

    // Greek lowercase
    [/α/g, "\\alpha"],
    [/β/g, "\\beta"],
    [/γ/g, "\\gamma"],
    [/δ/g, "\\delta"],
    [/ε/g, "\\epsilon"],
    [/ζ/g, "\\zeta"],
    [/η/g, "\\eta"],
    [/θ/g, "\\theta"],
    [/ι/g, "\\iota"],
    [/κ/g, "\\kappa"],
    [/λ/g, "\\lambda"],
    [/μ/g, "\\mu"],
    [/ν/g, "\\nu"],
    [/ξ/g, "\\xi"],
    [/ο/g, "o"],
    [/π/g, "\\pi"],
    [/ρ/g, "\\rho"],
    [/ς/g, "\\varsigma"],
    [/σ/g, "\\sigma"],
    [/τ/g, "\\tau"],
    [/υ/g, "\\upsilon"],
    [/φ/g, "\\phi"],
    [/χ/g, "\\chi"],
    [/ψ/g, "\\psi"],
    [/ω/g, "\\omega"],

    // Greek uppercase
    [/Γ/g, "\\Gamma"],
    [/Δ/g, "\\Delta"],
    [/Θ/g, "\\Theta"],
    [/Λ/g, "\\Lambda"],
    [/Ξ/g, "\\Xi"],
    [/Π/g, "\\Pi"],
    [/Σ/g, "\\Sigma"],
    [/Υ/g, "\\Upsilon"],
    [/Φ/g, "\\Phi"],
    [/Ψ/g, "\\Psi"],
    [/Ω/g, "\\Omega"],
  ];

  let normalized = segment;
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
};

/**
 * Balance unmatched braces in a LaTeX string so KaTeX doesn't choke on
 * truncated formulas from the AI (e.g. \frac{f without closing }).
 */
const balanceBraces = (s: string): string => {
  let depth = 0;
  for (const ch of s) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
  }
  // Append missing closing braces
  if (depth > 0) return s + '}'.repeat(depth);
  // Prepend missing opening braces (rare, but handle it)
  if (depth < 0) return '{'.repeat(-depth) + s;
  return s;
};

const renderMathSegment = (segment: string, displayMode: boolean) => {
  if (typeof window === "undefined" || !(window as any).katex) {
    return escapeHtml(segment);
  }

  try {
    let normalized = normalizeMathSymbols(segment.trim());
    normalized = balanceBraces(normalized);
    return (window as any).katex.renderToString(normalized, {
      displayMode,
      throwOnError: true,
      strict: "ignore"
    });
  } catch {
    // KaTeX couldn't parse it — show as clean plain text, not red error markup
    return `<span class="katex-fallback">${escapeHtml(segment)}</span>`;
  }
};

/**
 * Repair LaTeX escape sequences that were corrupted by JSON.parse.
 * e.g. \tilde → \t + ilde → tab + ilde
 */
const repairLatexEscapes = (s: string): string => {
  if (!s) return s;
  return s
    .replace(/\f(rac|lat|loor|orall)/g, '\\f$1')
    .replace(/\t(ilde|heta|au|imes|ext|iny|extstyle|op|riangle|o(?=[\s)},.$^_|=+\-\d]|$))/g, '\\t$1')
    .replace(/\n(u(?=[\s)},.$^_|=+\-\d]|$)|abla|eg|eq|ot|ewline|i(?=[\s)},.$^_|=+\-\d]|$)|subset|parallel|rightarrow)/g, '\\n$1')
    .replace(/\x08(eta|inom|ar|egin|ig|oldsymbol|ullet|ackslash)/g, '\\b$1')
    .replace(/\r(ho|ightarrow|Rightarrow|angle)/g, '\\r$1');
};

/**
 * Detect contiguous runs of bare LaTeX (not inside $ delimiters) and wrap them.
 * Scans character-by-character so we can track $ nesting and brace depth.
 */
const wrapBareLaTeX = (s: string): string => {
  // Split into segments: already-delimited ($...$, $$...$$) vs plain text
  const parts: Array<{ text: string; isMath: boolean }> = [];
  const delimRegex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = delimRegex.exec(s)) !== null) {
    if (m.index > last) parts.push({ text: s.slice(last, m.index), isMath: false });
    parts.push({ text: m[0], isMath: true });
    last = delimRegex.lastIndex;
  }
  if (last < s.length) parts.push({ text: s.slice(last), isMath: false });

  // For each plain-text segment, find bare LaTeX runs and wrap them.
  // Supports nested braces up to 3 levels and optional leading variable (e.g. x_i = \frac{...})
  const nb = '\\{(?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*\\}';
  const cmd = `\\\\[a-zA-Z]+(?:${nb})*(?:[_^](?:${nb}|[a-zA-Z0-9]))*`;
  const varLead = `(?:[a-zA-Z][a-zA-Z0-9]*(?:[_^](?:${nb}|[a-zA-Z0-9]))*\\s*[=<>]\\s*)?`;
  const conn = `(?:[=+\\-*/|<>.,;:^_]|${nb}|${cmd}|\\([^)]*\\)|\\d+)`;
  const bareLatexRun = new RegExp(`${varLead}${cmd}(?:\\s*${conn})*\\s*`, 'g');

  return parts.map(({ text, isMath }) => {
    if (isMath) return text;
    return text.replace(bareLatexRun, (run) => {
      // Only wrap if it actually contains a \command (not just whitespace/operators)
      if (!/\\[a-zA-Z]{2,}/.test(run)) return run;
      return `$${run.trim()}$`;
    });
  }).join('');
};

/**
 * Normalise all math delimiters to $ / $$ format.
 *
 * 1. Convert \( ... \) → $ ... $  and  \[ ... \] → $$ ... $$
 *    (handles legacy content and model outputs that ignore the prompt).
 * 2. Detect bare-paren groups that contain LaTeX commands or unicode
 *    math symbols and wrap them in $ ... $.
 */
const normalizeMathDelimiters = (s: string): string => {
  // First: convert \( ... \) → $ ... $ and \[ ... \] → $$ ... $$
  // Use paired regex to avoid creating stray $ / $$ from unmatched delimiters
  let result = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$${inner}$$`);
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner}$`);
  // Handle any remaining unmatched \( and \) (inline, less likely to cause $$ issues)
  result = result.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  // Intentionally NOT converting unmatched \[ / \] to avoid stray display-math markers

  // Second: detect ( content ) where content has \commands or unicode math → $content$
  // (?<![a-zA-Z]) prevents matching ( in \left(, \right(, \bigl(, etc.
  const mathUnicodePattern = /[α-ωΑ-Ω∑∏∫∮∇∂√∞×·÷±∓≈≃≅≡≠≤≥≪≫⊂⊃⊆⊇∈∉∋∝∥∀∃∅∧∨¬⇒⇐⇔→←↔↦⋅⋆ℏℓ]/;
  result = result.replace(/(?<!\$)(?<!\\)(?<![a-zA-Z])\(\s*((?:[^()]*?(?:\\[a-zA-Z]|[α-ωΑ-Ω∑∏∫∮∇∂√∞×·÷±∓≈≃≅≡≠≤≥≪≫⊂⊃⊆⊇∈∉∋∝∥∀∃∅∧∨¬⇒⇐⇔→←↔↦⋅⋆ℏℓ]))[^()]*?)\s*\)(?!\$)/g,
    (match, inner) => {
      if (/\\[a-zA-Z]/.test(inner) || mathUnicodePattern.test(inner)) {
        return `$${inner}$`;
      }
      return match;
    });

  // Third: wrap bare LaTeX runs that aren't inside $ delimiters.
  // A "bare run" starts with \command and extends through adjacent math-like
  // content: more \commands, braces, subscripts, operators, parens, etc.
  result = wrapBareLaTeX(result);

  return result;
};

/**
 * Strip LaTeX document preambles/postambles and convert LaTeX text
 * formatting commands to markdown equivalents.
 * Handles cases where the AI outputs full LaTeX document structure
 * (e.g. \documentclass{article}\usepackage{amsmath}\begin{document}...\end{document})
 */
const stripLatexPreamble = (s: string): string => {
  let result = s;

  // Remove \documentclass{...}, \usepackage{...}, \title{...}, \maketitle, \date{...}, \author{...}
  result = result.replace(/\\(?:documentclass|usepackage|title|author|date|maketitle)(?:\[[^\]]*\])?\{[^}]*\}/g, '');

  // Remove \begin{document} and \end{document}
  result = result.replace(/\\(?:begin|end)\{document\}/g, '');

  // Remove common environment wrappers that aren't math (e.g. \begin{center}...\end{center})
  // but keep math environments like \begin{align}, \begin{equation}, etc.
  result = result.replace(/\\(?:begin|end)\{(?:center|flushleft|flushright|itemize|enumerate|description|figure|table|tabular|minipage|verbatim)\}/g, '');

  // Convert \textbf{...} outside math mode to **...**
  result = result.replace(/\\textbf\{([^}]*)\}/g, '**$1**');

  // Convert \textit{...} and \emph{...} outside math mode to *...*
  result = result.replace(/\\(?:textit|emph)\{([^}]*)\}/g, '*$1*');

  // Remove \item markers
  result = result.replace(/\\item\s*/g, '');

  // Clean up any leftover multiple blank lines from removals
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
};

/**
 * Strip \mathbf{}, \boldsymbol{}, \textbf{} wrappers that the AI
 * incorrectly uses to "bold" entire formulas. Uses character-by-character
 * brace counting instead of regex to handle arbitrarily deep nesting.
 */
const stripBoldMathWrappers = (s: string): string => {
  const cmdPattern = /\\(?:mathbf|boldsymbol|textbf)\{/g;
  let result = s;
  let match;

  // Keep scanning until no more wrapper commands are found
  while ((match = cmdPattern.exec(result)) !== null) {
    const cmdStart = match.index;
    const braceOpen = cmdStart + match[0].length - 1; // index of '{'
    let depth = 1;
    let i = braceOpen + 1;

    // Walk forward counting braces to find the matching '}'
    while (i < result.length && depth > 0) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') depth--;
      i++;
    }

    if (depth === 0) {
      // Found matching brace: remove \mathbf{ and the matching }
      const inner = result.slice(braceOpen + 1, i - 1);
      result = result.slice(0, cmdStart) + inner + result.slice(i);
      cmdPattern.lastIndex = cmdStart; // re-scan from replacement point
    } else {
      // Unmatched braces: just remove the \mathbf{ prefix, leave content
      result = result.slice(0, cmdStart) + result.slice(braceOpen + 1);
      cmdPattern.lastIndex = cmdStart;
    }
  }

  return result;
};

/**
 * Fix malformed \left / \right usage that causes KaTeX to fail.
 * - \left immediately followed by \command (e.g. \left\frac) → insert (
 * - Orphaned \right at end without delimiter → append )
 * - \left( ... \right without delimiter → \right)
 */
const fixLeftRight = (s: string): string => {
  // \left followed directly by a \command (no delimiter between) → insert (
  // e.g. \left\frac{a}{b}\right → \left(\frac{a}{b}\right)
  let result = s.replace(/\\left\s*(?=\\[a-zA-Z])/g, '\\left(');

  // \right at end of string or before non-delimiter → append )
  // Valid delimiters after \right: ( ) [ ] | . \{ \} \| / \langle \rangle etc.
  result = result.replace(/\\right\s*(?=[^()\[\]|./\\}{\s]|$)/g, '\\right)');

  return result;
};

export const renderMathToHtml = (text: string) => {
  let input = text ?? "";

  // Step 0: Strip LaTeX document preambles/postambles
  input = stripLatexPreamble(input);

  // Step 1: Repair corrupted escape sequences
  input = repairLatexEscapes(input);

  // Step 1.5: Strip \mathbf{}, \boldsymbol{}, \textbf{} wrappers around formulas
  input = stripBoldMathWrappers(input);

  // Step 1.6: Fix malformed \left/\right usage
  input = fixLeftRight(input);

  // Step 2: Normalise all delimiters to $ / $$
  input = normalizeMathDelimiters(input);

  // After normalization, only $ and $$ delimiters remain
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g;
  let lastIndex = 0;
  let result = "";
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const before = input.slice(lastIndex, start);
    result += renderInlineMarkdown(escapeHtml(before));

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

  result += renderInlineMarkdown(escapeHtml(input.slice(lastIndex)));
  return result;
};
