const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

const renderMathSegment = (segment: string, displayMode: boolean) => {
  if (typeof window === "undefined" || !(window as any).katex) {
    return escapeHtml(segment);
  }

  try {
    const normalized = normalizeMathSymbols(segment.trim());
    return (window as any).katex.renderToString(normalized, {
      displayMode,
      throwOnError: false,
      strict: "ignore"
    });
  } catch (error) {
    return escapeHtml(segment);
  }
};

export const renderMathToHtml = (text: string) => {
  const input = text ?? "";
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
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
    } else if (token.startsWith("\\[")) {
      const content = token.slice(2, -2);
      result += renderMathSegment(content, true);
    } else if (token.startsWith("\\(")) {
      const content = token.slice(2, -2);
      result += renderMathSegment(content, false);
    } else {
      const content = token.slice(1, -1);
      result += renderMathSegment(content, false);
    }

    lastIndex = end;
  }

  result += escapeHtml(input.slice(lastIndex));
  return result;
};
