const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Please provide a Blade file path.");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);

if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

const content = fs.readFileSync(absolutePath, "utf8");

const ECHO = String.raw`(?:\{\{[\s\S]*?\}\}|\{!![\s\S]*?!!\})`;

// Inline conditional inside a tag: @if (...) attr="x" @endif, kept as one attribute
const DIRECTIVE_NAMES = "if|unless|isset|auth|guest|can|cannot|env|production|error";
const DIRECTIVE_GROUP = String.raw`@(?:${DIRECTIVE_NAMES})\s*\((?:[^()"']|"[^"]*"|'[^']*'|\((?:[^()]|\([^()]*\))*\))*\)(?:(?!@end)[\s\S])*@end(?:${DIRECTIVE_NAMES})`;
const DIRECTIVE_START = new RegExp(String.raw`^@(?:${DIRECTIVE_NAMES})\b`);

// Inline directive with arguments: @class ([...]), @checked($x). Args may contain =>, quotes, nesting.
const CALL_ARGS = String.raw`\((?:[^()"']|"[^"]*"|'[^']*'|\((?:[^()"']|"[^"]*"|'[^']*'|\([^()]*\))*\))*\)`;
const CALL_DIRECTIVE = String.raw`@(?:class|style|checked|selected|disabled|readonly|required)\s*${CALL_ARGS}`;

// One attribute token: inline directive group, Blade echo, or name / name=value.
// Quote-aware, and echoes inside quotes may contain their own quotes.
const ATTR = String.raw`(?:${DIRECTIVE_GROUP}|${CALL_DIRECTIVE}|${ECHO}|[^\s=>"'{\/]+(?:=(?:"(?:${ECHO}|\{(?![{!])|[^"{])*"|'(?:${ECHO}|\{(?![{!])|[^'{])*'|[^\s>"']+))?)`;

// Splits an attribute string into tokens; inline directive groups are put on one line
const attrList = (attrs) =>
  (attrs.match(new RegExp(ATTR, "g")) || []).map((attr) =>
    DIRECTIVE_START.test(attr) ? attr.replace(/\s+/g, " ") : attr,
  );

// Opening tag at the start of a line
const OPEN_TAG = new RegExp(
  String.raw`^([ \t]*)<([a-zA-Z][\w:.-]*)((?:\s+${ATTR})*)\s*(\/?)>`,
  "gm",
);

// Opening tag that ends its line, or is immediately followed by its own close tag
const LINE_END_TAG = new RegExp(`${OPEN_TAG.source}(?=[ \\t]*$|<\\/\\2\\s*>[ \\t]*$)`, "gm");

// Open tag ending its line, then a content line that also ends with the matching close tag
const TRAILING_CLOSE = new RegExp(
  String.raw`^([ \t]*<([a-zA-Z][\w:.-]*)(?:\s+${ATTR})*\s*>)[ \t]*\n([ \t]*[^<\s][^<\n]*?)[ \t]*(<\/\2\s*>)[ \t]*$`,
  "gm",
);

// <span> whose only content is a single Blade echo
const ECHO_SPAN = new RegExp(
  String.raw`^([ \t]*)<span((?:\s+${ATTR})*)\s*>\s*(\{\{(?:(?!\}\})[\s\S])*\}\}|\{!!(?:(?!!!\})[\s\S])*!!\})\s*<\/span>`,
  "gm",
);

// Regions that must never be reformatted
const PROTECTED = [
  /\{\{--[\s\S]*?--\}\}/g,
  /<\?(?:php|=)[\s\S]*?\?>/g,
  /<!--[\s\S]*?-->/g,
  /@php(?!\s*\()[\s\S]*?@endphp/g,
  /@verbatim[\s\S]*?@endverbatim/g,
  /<(script|style|pre|textarea)\b[\s\S]*?<\/\1>/g,
];

const INDENT = "  ";

// Max line width. Single-line elements with plain text/echo content that exceed it
// are split onto three lines (open tag, content, close tag).
const PRINT_WIDTH = 80;

// Opening tags with more attributes than this get one attribute per line,
// unless every attribute is simple (no value, or a value without whitespace).
// Set to Infinity to keep every tag on a single line.
const MAX_INLINE_ATTRS = 2;

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Block directives that open a level (their @end* pair closes it)
const BLOCK_OPEN = new Set([
  "if", "unless", "isset", "foreach", "forelse", "for", "while", "switch",
  "auth", "guest", "can", "cannot", "canany", "error", "once", "push",
  "pushOnce", "pushIf", "prepend", "prependOnce", "component", "env",
  "production", "session", "fragment", "hasSection", "sectionMissing",
  "section", "empty", "slot", "teleport",
]);

const BLOCK_CLOSE = new Set([
  "endif", "endunless", "endisset", "endforeach", "endforelse", "endfor",
  "endwhile", "endswitch", "endauth", "endguest", "endcan", "endcannot",
  "endcanany", "enderror", "endonce", "endpush", "endPushOnce", "endPushIf",
  "endprepend", "endPrependOnce", "endcomponent", "endenv", "endproduction",
  "endsession", "endfragment", "endhasSection", "endsectionMissing",
  "endsection", "endempty", "endslot", "endteleport",
  "show", "stop", "append", "overwrite",
]);

// Directives that close and reopen a level (@else, @elseif, ...)
const BLOCK_MIDDLE = new Set(["else", "elseif", "case", "default"]);

const TOKEN = new RegExp(
  String.raw`<\/([a-zA-Z][\w:.-]*)\s*>|<([a-zA-Z][\w:.-]*)((?:\s+${ATTR})*)\s*(\/?)>|(?<![\w@])@(\w+)`,
  "g",
);

// Returns the end index of "(...)" starting at `start` (after optional spaces), or -1
function findArgsEnd(text, start) {
  let i = start;
  while (text[i] === " " || text[i] === "\t") i++;
  if (text[i] !== "(") return -1;
  let depth = 0;
  let quote = null;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

// True if the directive args contain a top-level comma, e.g. @section("a", "b")
function hasTopLevelComma(args) {
  let depth = 0;
  let quote = null;
  for (let i = 1; i < args.length - 1; i++) {
    const ch = args[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (ch === "," && depth === 0) {
      return true;
    }
  }
  return false;
}

// Net "(" minus ")" in text, ignoring quoted strings
function parenDelta(text) {
  let delta = 0;
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "(") {
      delta++;
    } else if (ch === ")") {
      delta--;
    }
  }
  return delta;
}

// Finds open / close / middle events on one trimmed line.
// events.continuation is set when a directive's "(" is not closed on this line.
function lineEvents(line) {
  // Mask echoes so "<" or ">" inside {{ }} is ignored
  const text = line.replace(/\{\{[\s\S]*?\}\}|\{!![\s\S]*?!!\}/g, (m) => "\u0001".repeat(m.length));
  const events = [];
  events.continuation = 0;
  TOKEN.lastIndex = 0;
  let match;

  while ((match = TOKEN.exec(text))) {
    const start = match.index;

    if (match[1]) {
      events.push({ type: "close", start, end: TOKEN.lastIndex });
    } else if (match[2]) {
      const selfClosed = match[4] === "/" || VOID_TAGS.has(match[2].toLowerCase());
      if (!selfClosed) events.push({ type: "open", start, end: TOKEN.lastIndex });
    } else {
      const name = match[5];
      const argsEnd = findArgsEnd(text, TOKEN.lastIndex);
      let args = argsEnd === -1 ? "" : text.slice(text.indexOf("(", TOKEN.lastIndex), argsEnd);
      let end = argsEnd === -1 ? TOKEN.lastIndex : argsEnd;
      const opened = /^[ \t]*\(/.exec(text.slice(TOKEN.lastIndex));
      let type = null;

      if (argsEnd === -1 && opened) {
        const partial = text.slice(TOKEN.lastIndex + opened[0].length - 1);
        events.continuation = parenDelta(partial);
        args = `${partial})`;
        end = text.length;
      }

      if (BLOCK_CLOSE.has(name)) type = "close";
      else if (BLOCK_MIDDLE.has(name)) type = "middle";
      else if (name === "empty") type = args ? "open" : "middle";
      else if (name === "section") type = hasTopLevelComma(args) ? null : "open";
      else if (name === "slot") type = null;
      else if (BLOCK_OPEN.has(name)) type = "open";

      if (name === "empty" && !args) type = "middle";
      if (type) events.push({ type, start, end });
      if (argsEnd !== -1) TOKEN.lastIndex = argsEnd;
      else if (events.continuation > 0) TOKEN.lastIndex = text.length;
    }
  }

  return events;
}

// <tag attrs> content </tag> on one line, content has no nested tags
const INLINE_ELEMENT = new RegExp(
  String.raw`^<([a-zA-Z][\w:.-]*)((?:\s+${ATTR})*)\s*>([^\n<]+?)<\/\1\s*>$`,
);

// Returns the three-line form when the line is over PRINT_WIDTH, else null
function wrapInlineElement(indent, line, measure) {
  if (measure(indent + line) <= PRINT_WIDTH) return null;
  const match = line.match(INLINE_ELEMENT);
  if (!match || !match[3].trim()) return null;
  const [, tag, attrs, content] = match;
  return [
    `${indent}<${tag}${attrs}>`,
    `${indent}${INDENT}${content.trim()}`,
    `${indent}</${tag}>`,
  ].join("\n");
}

// Re-indents a multi-line echo by bracket nesting, with `{{` and `}}` at baseIndent
function formatEcho(echo, baseIndent) {
  const [first, ...rest] = echo.split("\n");
  const head = first.trim();
  const bare = head === "{{" || head === "{!!";
  let depth = !bare && /[(\[{]$/.test(head) ? 1 : 0;
  const lines = [baseIndent + head];

  for (const raw of rest) {
    const line = raw.trim();
    if (!line) {
      lines.push("");
    } else if (/^(\}\}|!!\})/.test(line)) {
      lines.push(baseIndent + line);
    } else {
      if (/^[)\]}]/.test(line)) depth = Math.max(depth - 1, 0);
      lines.push(baseIndent + INDENT.repeat(depth + (bare ? 1 : 0)) + line);
      if (/[(\[{]$/.test(line)) depth++;
    }
  }

  return lines.join("\n");
}

const leadingSpaces = (text) => text.match(/^[ \t]*/)[0].length;

function reindent(code, measure) {
  let depth = 0;
  const lines = code.split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      out.push("");
      continue;
    }

    const events = lineEvents(line);
    let cursor = 0;
    let leading = 0;
    for (const event of events) {
      const isLeading =
        event.type !== "open" && line.slice(cursor, event.start).trim() === "";
      if (!isLeading) break;
      leading++;
      cursor = event.end;
    }

    const net = events.reduce(
      (sum, e) => sum + (e.type === "open" ? 1 : e.type === "close" ? -1 : 0),
      0,
    );

    const printDepth = Math.max(depth - leading, 0);
    depth = Math.max(depth + net, 0);
    const indent = INDENT.repeat(printDepth);
    out.push(wrapInlineElement(indent, line, measure) ?? indent + line);

    // Directive arguments that continue on following lines: indent one level,
    // keeping their relative indentation
    if (events.continuation > 0) {
      let balance = events.continuation;
      const block = [];
      let j = i + 1;
      while (balance > 0 && j < lines.length) {
        block.push(lines[j]);
        balance += parenDelta(lines[j]);
        j++;
      }
      const min = Math.min(...block.filter((l) => l.trim()).map(leadingSpaces));
      for (const raw of block) {
        out.push(
          raw.trim()
            ? indent + INDENT + " ".repeat(Math.max(leadingSpaces(raw) - min, 0)) + raw.trim()
            : "",
        );
      }
      i = j - 1;
    }
  }

  return out.join("\n");
}

function formatBladeCode(code) {
  // Fix 1: Normalize line endings, then remove trailing whitespace
  code = code.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "");

  // Fix 2: Allow at most one consecutive blank line
  code = code.replace(/\n{3,}/g, "\n\n");

  // Protect comments, PHP, scripts, and other raw regions
  const stash = [];
  for (const pattern of PROTECTED) {
    code = code.replace(pattern, (match) => {
      stash.push(match);
      return `\u0000${stash.length - 1}\u0000`;
    });
  }

  // Protect multi-line echoes and @class/@style calls so their lines are not re-indented one by one
  code = code.replace(new RegExp(`${ECHO}|${CALL_DIRECTIVE}`, "g"), (match) => {
    if (!match.includes("\n")) return match;
    stash.push(match);
    return `\u0000${stash.length - 1}\u0000`;
  });

  // Join closing tags split across lines: </span\n>  ->  </span>
  code = code.replace(/<\/([a-zA-Z][\w:.-]*)[ \t]*\n[ \t]*>/g, "</$1>");

  // Fix 3: Collapse multi-line opening tags onto one line
  // (multi-line attributes can break href/class bindings in Blade)
  code = code.replace(OPEN_TAG, (match, indent, tag, attrs, selfClose) => {
    if (!match.includes("\n")) return match;
    const list = attrList(attrs);
    const attrText = list.length ? ` ${list.join(" ")}` : "";
    return `${indent}<${tag}${attrText}${selfClose ? " />" : ">"}`;
  });

  // Fix 3b: Move a trailing close tag onto its own line when the open tag ends its line
  code = code.replace(TRAILING_CLOSE, "$1\n$3\n$4");

  // Fix 4: Put echo-only spans on three lines
  code = code.replace(ECHO_SPAN, (match, indent, attrs, echo) => {
    const normalized = echo.replace(
      /^(\{\{|\{!!)\s*([\s\S]*?)\s*(\}\}|!!\})$/,
      "$1 $2 $3",
    );
    return [
      `${indent}<span${attrs}>`,
      `${indent}  ${normalized}`,
      `${indent}</span>`,
    ].join("\n");
  });

  const restore = (text) => {
    while (/\u0000\d+\u0000/.test(text)) {
      text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
    }
    return text;
  };

  // Fix 5: Re-indent by tag/directive nesting, and wrap lines over PRINT_WIDTH
  code = reindent(code, (text) => restore(text).length);

  // Fix 6: One attribute per line when a tag has more than MAX_INLINE_ATTRS,
  // is wider than PRINT_WIDTH (2+ attributes only), or has a multi-line echo attribute
  const isStash = (text) => /^\u0000\d+\u0000$/.test(text);

  // Boolean attribute, or a value without whitespace: focusable, size="sm", :user="$user"
  const isSimple = (attr) => {
    const text = restore(attr);
    const eq = text.indexOf("=");
    const value = eq === -1 ? text : text.slice(eq + 1).replace(/^["']|["']$/g, "");
    return !/\s/.test(value);
  };

  const formatAttr = (attr, attrIndent) =>
    isStash(attr) ? formatEcho(restore(attr), attrIndent) : attrIndent + attr;

  code = code.replace(LINE_END_TAG, (match, indent, tag, attrs, selfClose) => {
    // Icon spans keep their open tag on one line (open tag / icon name / close tag)
    if (/material-symbols/.test(attrs)) return match;

    const list = attrList(attrs);
    const hasBlockEcho = list.some((a) => isStash(a) && restore(a).includes("\n"));
    const inline = `${indent}<${tag}${list.length ? ` ${list.join(" ")}` : ""}${selfClose ? " />" : ">"}`;
    const tooWide = list.length > 1 && restore(inline).length > PRINT_WIDTH;

    const stayInline = list.length <= MAX_INLINE_ATTRS || list.every(isSimple);

    if (!hasBlockEcho && !tooWide && stayInline) return match;

    return [
      `${indent}<${tag}`,
      ...list.map((attr) => formatAttr(attr, indent + INDENT)),
      `${indent}${selfClose ? "/>" : ">"}`,
    ].join("\n");
  });

  // Restore protected regions
  code = restore(code);

  // Fix 7: Exactly one newline at EOF
  return code.trimEnd() + "\n";
}

try {
  const formattedContent = formatBladeCode(content);

  if (formattedContent !== content) {
    fs.writeFileSync(absolutePath, formattedContent, "utf8");
    console.log(`Successfully formatted: ${filePath}`);
  } else {
    console.log(`Already formatted: ${filePath}`);
  }
} catch (error) {
  console.error("Formatting error:", error);
  process.exit(1);
}