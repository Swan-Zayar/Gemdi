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
      throwOnError: false,
      strict: "ignore"
    });
  } catch {
    return `<span class="katex-fallback">[math]</span>`;
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
    .replace(/\t(ilde|heta|au|an(?!g)|imes|ext|iny|extstyle|op|riangle|anh|frac|o(?=[\s)},.$^_|=+\-\d]|$))/g, '\\t$1')
    .replace(/\n(u(?=[\s)},.$^_|=+\-\d]|$)|abla|eg|eq|ot|ewline|i(?=[\s)},.$^_|=+\-\d]|$)|subset|parallel|rightarrow)/g, '\\n$1')
    .replace(/\x08(eta|inom|ar|egin|ig|oldsymbol|ullet|ackslash)/g, '\\b$1')
    .replace(/\r(ho|ightarrow|Rightarrow|angle)/g, '\\r$1');
};

/**
 * Simple conversion of legacy delimiters to $ / $$ format.
 * \[ ... \] → $$ ... $$
 * \( ... \) → $ ... $
 * Unmatched \( / \) → $
 */
const convertLegacyDelimiters = (s: string): string => {
  let result = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$${inner}$$`);
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner}$`);
  result = result.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  return result;
};

interface MathToken {
  type: 'text' | 'inline-math' | 'display-math';
  content: string;
}

/**
 * Single-pass character-by-character tokenizer for math delimiters.
 *
 * Key heuristic: when seeing a closing `$`, if the next non-space character
 * is `\` (backslash), don't close — the formula continues past the premature `$`.
 *
 * This directly fixes:
 * - `$S_n = a$\frac{r^n-1}{r-1}` → extends past `$` to include `\frac{...}{...}`
 * - `$x \to $\pm\infty$` → extends past middle `$` to include `\pm\infty`
 * - Normal `$x$ and $y$` → closes correctly (next char is ` `, not `\`)
 */
const tokenizeMath = (s: string): MathToken[] => {
  const tokens: MathToken[] = [];
  let i = 0;
  let textBuf = '';

  const flushText = () => {
    if (textBuf.length === 0) return;
    // Detect bare \command{...} runs in text and wrap as inline-math
    // Detect bare \begin{env}...\end{env} and wrap as display-math
    const processed = wrapBareLatexInText(textBuf);
    tokens.push(...processed);
    textBuf = '';
  };

  while (i < s.length) {
    // Check for $$ (display math)
    if (s[i] === '$' && i + 1 < s.length && s[i + 1] === '$') {
      flushText();
      i += 2; // skip opening $$
      let content = '';
      while (i < s.length) {
        if (s[i] === '$' && i + 1 < s.length && s[i + 1] === '$') {
          // Potential close — check if next non-space char is backslash
          const afterClose = i + 2;
          let peek = afterClose;
          while (peek < s.length && s[peek] === ' ') peek++;
          if (peek < s.length && s[peek] === '\\' && peek + 1 < s.length && /[a-zA-Z]/.test(s[peek + 1])) {
            // Formula continues — consume the $$ and keep going
            content += '$$';
            i += 2;
          } else {
            // Real close
            i += 2;
            break;
          }
        } else {
          content += s[i];
          i++;
        }
      }
      tokens.push({ type: 'display-math', content });
      continue;
    }

    // Check for $ (inline math)
    if (s[i] === '$') {
      // Look ahead: is this actually the start of a math block?
      // A $ followed immediately by another $ is handled above.
      // A $ at end of string or followed by space/newline is likely just a dollar sign in text.
      if (i + 1 >= s.length || s[i + 1] === ' ' || s[i + 1] === '\n') {
        textBuf += s[i];
        i++;
        continue;
      }

      flushText();
      i++; // skip opening $
      let content = '';
      let braceDepth = 0;
      while (i < s.length) {
        if (s[i] === '{') braceDepth++;
        else if (s[i] === '}') braceDepth--;

        if (s[i] === '$' && braceDepth <= 0) {
          // Potential close — check if next non-space char is backslash
          const afterClose = i + 1;
          let peek = afterClose;
          while (peek < s.length && s[peek] === ' ') peek++;
          if (peek < s.length && s[peek] === '\\' && peek + 1 < s.length && /[a-zA-Z]/.test(s[peek + 1])) {
            // Formula continues past this $ — the $ was premature
            // Don't add the $ to content, just skip it and continue
            i++;
          } else {
            // Real close
            i++;
            break;
          }
        } else {
          content += s[i];
          i++;
        }
      }
      if (content.trim().length > 0) {
        tokens.push({ type: 'inline-math', content });
      }
      continue;
    }

    textBuf += s[i];
    i++;
  }

  flushText();
  return tokens;
};

/**
 * Process a text buffer (non-math) to detect and wrap bare LaTeX constructs.
 * - Bare \begin{env}...\end{env} → display-math tokens
 * - Bare \command{...} runs → inline-math tokens
 * - ( content ) containing \commands or math Unicode → inline-math tokens
 */
const wrapBareLatexInText = (text: string): MathToken[] => {
  const tokens: MathToken[] = [];

  // First: extract \begin{env}...\end{env} environments
  const envPattern = /\\begin\{(align\*?|equation\*?|gather\*?|multline\*?|alignat\*?|flalign\*?|split|cases|pmatrix|bmatrix|vmatrix|Vmatrix|matrix|smallmatrix|array)\}([\s\S]*?)\\end\{\1\}/g;
  let lastEnv = 0;
  let envMatch: RegExpExecArray | null;

  const segments: Array<{ text: string; isMath: boolean; display: boolean }> = [];

  while ((envMatch = envPattern.exec(text)) !== null) {
    if (envMatch.index > lastEnv) {
      segments.push({ text: text.slice(lastEnv, envMatch.index), isMath: false, display: false });
    }
    segments.push({ text: envMatch[0], isMath: true, display: true });
    lastEnv = envPattern.lastIndex;
  }
  if (lastEnv < text.length) {
    segments.push({ text: text.slice(lastEnv), isMath: false, display: false });
  }

  for (const seg of segments) {
    if (seg.isMath) {
      tokens.push({ type: seg.display ? 'display-math' : 'inline-math', content: seg.text });
      continue;
    }

    // Now handle bare \command runs in this text segment
    // Match contiguous LaTeX: \cmd{...} with optional subscripts, superscripts, operators, digits
    const nb = '\\{(?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*\\}';
    const cmd = `\\\\[a-zA-Z]+(?:${nb})*(?:[_^](?:${nb}|[a-zA-Z0-9]))*`;
    const varLead = `(?:[a-zA-Z][a-zA-Z0-9]*(?:[_^](?:${nb}|[a-zA-Z0-9]))*\\s*[=<>]\\s*)?`;
    const conn = `(?:[=+\\-*/|<>.,;:^_]|${nb}|${cmd}|\\([^)]*\\)|\\d+|d[a-z])`;
    const bareLatexRun = new RegExp(`${varLead}${cmd}(?:\\s*${conn})*\\s*`, 'g');

    let lastBare = 0;
    let bareMatch: RegExpExecArray | null;
    const subTokens: MathToken[] = [];

    while ((bareMatch = bareLatexRun.exec(seg.text)) !== null) {
      if (!/\\[a-zA-Z]{2,}/.test(bareMatch[0])) continue;

      if (bareMatch.index > lastBare) {
        const beforeText = seg.text.slice(lastBare, bareMatch.index);
        if (beforeText.length > 0) {
          subTokens.push(...wrapParenMath(beforeText));
        }
      }
      subTokens.push({ type: 'inline-math', content: bareMatch[0].trim() });
      lastBare = bareLatexRun.lastIndex;
    }

    if (lastBare < seg.text.length) {
      const remaining = seg.text.slice(lastBare);
      if (remaining.length > 0) {
        subTokens.push(...wrapParenMath(remaining));
      }
    } else if (lastBare === 0) {
      // No bare LaTeX found — check for paren math
      subTokens.push(...wrapParenMath(seg.text));
    }

    tokens.push(...subTokens);
  }

  return tokens;
};

/**
 * Detect ( content ) containing \commands or math Unicode and wrap as inline-math.
 * Otherwise return as text token.
 */
const wrapParenMath = (text: string): MathToken[] => {
  const mathUnicodePattern = /[α-ωΑ-Ω∑∏∫∮∇∂√∞×·÷±∓≈≃≅≡≠≤≥≪≫⊂⊃⊆⊇∈∉∋∝∥∀∃∅∧∨¬⇒⇐⇔→←↔↦⋅⋆ℏℓ]/;
  const parenPattern = /(?<!\$)(?<!\\)(?<![a-zA-Z])\(\s*((?:[^()]*?(?:\\[a-zA-Z]|[α-ωΑ-Ω∑∏∫∮∇∂√∞×·÷±∓≈≃≅≡≠≤≥≪≫⊂⊃⊆⊇∈∉∋∝∥∀∃∅∧∨¬⇒⇐⇔→←↔↦⋅⋆ℏℓ]))[^()]*?)\s*\)(?!\$)/g;

  const tokens: MathToken[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = parenPattern.exec(text)) !== null) {
    const inner = m[1];
    if (/\\[a-zA-Z]/.test(inner) || mathUnicodePattern.test(inner)) {
      if (m.index > last) {
        tokens.push({ type: 'text', content: text.slice(last, m.index) });
      }
      tokens.push({ type: 'inline-math', content: inner });
      last = parenPattern.lastIndex;
    }
  }

  if (last < text.length) {
    tokens.push({ type: 'text', content: text.slice(last) });
  } else if (last === 0 && text.length > 0) {
    tokens.push({ type: 'text', content: text });
  }

  return tokens;
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
  result = result.replace(/\\right(?![a-zA-Z])\s*(?=[^()\[\]|./\\}{\s]|$)/g, '\\right)');

  return result;
};

export const renderMathToHtml = (text: string) => {
  let input = text ?? "";

  // Step 0: Strip LaTeX document preambles/postambles
  input = stripLatexPreamble(input);

  // Step 1: Repair corrupted escape sequences
  input = repairLatexEscapes(input);

  // Step 2: Strip \mathbf{}, \boldsymbol{}, \textbf{} wrappers around formulas
  input = stripBoldMathWrappers(input);

  // Step 3: Fix malformed \left/\right usage
  input = fixLeftRight(input);

  // Step 4: Convert legacy delimiters (\(...\), \[...\]) to $ / $$
  input = convertLegacyDelimiters(input);

  // Step 5: Tokenize using single-pass character-by-character scanner
  const mathTokens = tokenizeMath(input);

  // Step 6: Render each token
  let result = "";
  for (const token of mathTokens) {
    switch (token.type) {
      case 'display-math':
        result += renderMathSegment(token.content, true);
        break;
      case 'inline-math':
        result += renderMathSegment(token.content, false);
        break;
      case 'text':
        result += renderInlineMarkdown(escapeHtml(token.content));
        break;
    }
  }

  return result;
};
