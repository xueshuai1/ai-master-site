/**
 * Shared syntax highlighting utilities for code blocks.
 * Used by MarkdownBody.tsx (markdown code fences) and article page.tsx (code array fields).
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Python ────────────────────────────────────────────────────────────────

const PY_KEYWORDS = new Set([
  "import","from","def","class","return","if","else","elif","for","while",
  "try","except","with","as","yield","lambda","pass","break","continue",
  "raise","in","not","and","or","is","True","False","None","self","super",
  "global","nonlocal","assert","del","finally","async","await","print",
]);

const PY_TYPES = new Set([
  "int","str","float","bool","list","dict","tuple","set","bytes","object",
  "type","Optional","Any","Union","List","Dict","Callable","Iterable",
  "Iterator","Generator","Sequence","Mapping","MutableMapping","Tuple",
  "Set","FrozenSet","Deque","DefaultDict","OrderedDict","Counter",
  "NamedTuple","TypeVar","Generic","Protocol","runtime_checkable","Final",
  "ClassVar","Literal","TypedDict","Annotated","Self","Never","NoReturn",
]);

const PY_BUILTINS = new Set([
  "torch","nn","math","os","sys","json","re","typing","collections",
  "functools","itertools","pathlib","datatrove","trl","transformers",
  "tiktoken","datasets",
]);

export function highlightPython(code: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < code.length) {
    // Comment
    if (code[i] === "#") {
      const end = (() => { const e = code.indexOf("\n", i); return e === -1 ? code.length : e; })();
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, end))}</span>`);
      i = end; continue;
    }

    // Triple-quoted strings
    if (code.slice(i, i+3) === '"""' || code.slice(i, i+3) === "'''") {
      const q = code.slice(i, i+3);
      let end = code.indexOf(q, i+3);
      end = end === -1 ? code.length : end + 3;
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, end))}</span>`);
      i = end; continue;
    }

    // f-string or regular string (double quote)
    if (code[i] === '"' || (code[i] === "f" && code[i+1] === '"')) {
      const start = i;
      const qi = code[i] === "f" ? i+1 : i;
      let j = qi + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === "\\") j++; j++; }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(start, j+1))}</span>`);
      i = j + 1; continue;
    }

    // f-string or regular string (single quote)
    if (code[i] === "'" || (code[i] === "f" && code[i+1] === "'")) {
      const start = i;
      const qi = code[i] === "f" ? i+1 : i;
      let j = qi + 1;
      while (j < code.length && code[j] !== "'") { if (code[j] === "\\") j++; j++; }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(start, j+1))}</span>`);
      i = j + 1; continue;
    }

    // Decorator
    if (code[i] === "@") {
      let j = i + 1;
      while (j < code.length && /\w/.test(code[j])) j++;
      parts.push(`<span class="token-decorator">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      parts.push(`<span class="token-number">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }

    // Identifiers
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j;
      while (k < code.length && code[k] === " ") k++;
      if (code[k] === "(") {
        parts.push(`<span class="token-function">${escapeHtml(word)}</span>`);
      } else if (PY_KEYWORDS.has(word)) {
        parts.push(`<span class="token-keyword">${escapeHtml(word)}</span>`);
      } else if (PY_TYPES.has(word)) {
        parts.push(`<span class="token-type">${escapeHtml(word)}</span>`);
      } else if (PY_BUILTINS.has(word)) {
        parts.push(`<span class="token-builtin">${escapeHtml(word)}</span>`);
      } else {
        parts.push(escapeHtml(word));
      }
      i = j; continue;
    }

    parts.push(escapeHtml(code[i]));
    i++;
  }

  return parts.join("");
}

// ─── JavaScript / TypeScript ───────────────────────────────────────────────

const JS_KEYWORDS = new Set([
  "const","let","var","function","class","interface","type","enum",
  "namespace","return","if","else","for","while","do","try","catch",
  "finally","throw","new","typeof","instanceof","in","of","break",
  "continue","switch","case","default","import","export","from","as",
  "extends","implements","declare","abstract","async","await","yield",
  "void","delete","static","public","private","protected","readonly",
  "override","constructor","get","set","super","this","debugger",
  "module","require","keyof","infer","satisfies","using","accessor",
]);

const JS_VALUES = new Set(["null","undefined","true","false","NaN","Infinity"]);

const JS_TYPES = new Set([
  "string","number","boolean","object","any","never","unknown","bigint","symbol",
  "Array","Promise","Record","Partial","Required","Readonly","Pick",
  "Omit","Exclude","Extract","NonNullable","ReturnType","Parameters",
  "InstanceType","Awaited","Map","WeakMap","WeakSet",
  "Date","Error","RegExp","Function","Object","String","Number",
  "Boolean","BigInt","EventTarget","HTMLElement","HTMLInputElement",
  "Element","Node","NodeList","Event","CustomEvent","MouseEvent",
  "KeyboardEvent","FocusEvent","SubmitEvent","InputEvent",
]);

const JS_BUILTINS = new Set([
  "console","Math","JSON","process","window","document","navigator",
  "fetch","setTimeout","setInterval","clearTimeout","clearInterval",
  "parseInt","parseFloat","isNaN","isFinite","encodeURIComponent",
  "decodeURIComponent","encodeURI","decodeURI","Symbol","Proxy","Reflect",
  "structuredClone","queueMicrotask","requestAnimationFrame",
  "cancelAnimationFrame","performance","crypto","URL","URLSearchParams",
  "FormData","Headers","Request","Response","ReadableStream",
  "WritableStream","TextEncoder","TextDecoder","Blob","File","FileReader",
  "AbortController","AbortSignal","MutationObserver","ResizeObserver",
  "IntersectionObserver","localStorage","sessionStorage","indexedDB",
  "WebSocket","EventSource","Worker","SharedWorker","ServiceWorker",
  "Promise","Object","Array","Set","Map","WeakRef","FinalizationRegistry",
  "Atomics","SharedArrayBuffer","DataView","Buffer","stream","fs","path",
  "http","https","net","os","child_process","events","util","crypto",
  "readline","cluster","vm","zlib","dns","tls","dgram",
]);

export function highlightJS(code: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < code.length) {
    // Single-line comment
    if (code[i] === "/" && code[i+1] === "/") {
      const end = (() => { const e = code.indexOf("\n", i); return e === -1 ? code.length : e; })();
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, end))}</span>`);
      i = end; continue;
    }

    // Multi-line comment
    if (code[i] === "/" && code[i+1] === "*") {
      let e = code.indexOf("*/", i+2);
      e = e === -1 ? code.length : e + 2;
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, e))}</span>`);
      i = e; continue;
    }

    // Template literal (backtick string) — consume greedily, ignore ${}
    if (code[i] === "`") {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\" && j+1 < code.length) { j += 2; continue; }
        if (code[j] === "`") { j++; break; }
        j++;
      }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }

    // Double-quoted string
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"' && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+1))}</span>`);
      i = j + 1; continue;
    }

    // Single-quoted string
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'" && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+1))}</span>`);
      i = j + 1; continue;
    }

    // Decorator
    if (code[i] === "@" && /[a-zA-Z_]/.test(code[i+1] || "")) {
      let j = i + 1;
      while (j < code.length && /[\w.]/.test(code[j])) j++;
      parts.push(`<span class="token-decorator">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }

    // Numeric literal (decimal, hex 0x, binary 0b, octal 0o, BigInt n)
    if (/\d/.test(code[i]) || (code[i] === "." && /\d/.test(code[i+1] || ""))) {
      let j = i;
      if (code[j] === "0" && /[xXbBoO]/.test(code[j+1] || "")) {
        j += 2;
        while (j < code.length && /[\w]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[\d.e+\-_]/.test(code[j])) {
          // Only allow +/- after e/E
          if ((code[j] === "+" || code[j] === "-") && !/[eE]/.test(code[j-1] || "")) break;
          j++;
        }
        if (code[j] === "n") j++; // BigInt suffix
      }
      parts.push(`<span class="token-number">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }

    // Identifiers, keywords, types, builtins
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      // Peek past whitespace to detect function call
      let k = j;
      while (k < code.length && code[k] === " ") k++;

      if (JS_VALUES.has(word)) {
        parts.push(`<span class="token-keyword">${escapeHtml(word)}</span>`);
      } else if (JS_KEYWORDS.has(word)) {
        parts.push(`<span class="token-keyword">${escapeHtml(word)}</span>`);
      } else if (JS_TYPES.has(word)) {
        parts.push(`<span class="token-type">${escapeHtml(word)}</span>`);
      } else if (JS_BUILTINS.has(word)) {
        parts.push(`<span class="token-builtin">${escapeHtml(word)}</span>`);
      } else if (code[k] === "(") {
        parts.push(`<span class="token-function">${escapeHtml(word)}</span>`);
      } else {
        parts.push(escapeHtml(word));
      }
      i = j; continue;
    }

    parts.push(escapeHtml(code[i]));
    i++;
  }

  return parts.join("");
}

// ─── Bash / Shell ──────────────────────────────────────────────────────────

export function highlightBash(code: string): string {
  const escaped = escapeHtml(code);
  const params: string[] = [];
  const strings: string[] = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => {
      strings.push(s);
      return `ZSTR${strings.length - 1}Z`;
    })
    .replace(/(--?[a-zA-Z][a-zA-Z0-9-]*)/g, (_m, p) => {
      params.push(p);
      return `ZPAR${params.length - 1}Z`;
    });

  processed = processed
    .replace(/#(.*)/gm, '<span class="token-comment">#$1</span>')
    .replace(
      /\b(pip|pip3|vllm|npm|npx|pnpm|yarn|apt|apt-get|brew|curl|wget|docker|git|python|python3|node|cd|ls|mkdir|rm|cp|mv|cat|echo|export|source|sudo|chmod|chown|grep|sed|awk|find|xargs|sort|uniq|head|tail|wc|tar|zip|unzip|gzip|gunzip|ssh|scp|rsync|kubectl|helm|terraform|ansible|make|cmake|gcc|clang|go|cargo|rustc|java|javac|mvn|gradle|touch|pwd|which|env|printenv|set|unset|alias|kill|ps|top|df|du|free|uname|hostname|date|time|sleep|wait|exit|test|true|false|read|write|exec|eval|trap)\b/g,
      '<span class="token-function">$1</span>'
    );

  params.forEach((p, i) => {
    processed = processed.replace(`ZPAR${i}Z`, `<span class="token-parameter">${p}</span>`);
  });
  strings.forEach((s, i) => {
    processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`);
  });

  return processed;
}

// ─── JSON ──────────────────────────────────────────────────────────────────

export function highlightJSON(code: string): string {
  const escaped = escapeHtml(code);
  const keys: string[] = [];
  let processed = escaped.replace(/("[^"]*")\s*:/g, (_m, s) => {
    keys.push(s);
    return `ZK${String.fromCharCode(65 + keys.length - 1)}Z:`;
  });
  processed = processed
    .replace(/\b(true|false|null)\b/g, '<span class="token-keyword">$1</span>')
    .replace(/(?<!["\w])(-?\d+\.?\d*(?:[eE][+-]?\d+)?)(?!["\w])/g, '<span class="token-number">$1</span>');
  keys.forEach((s, i) => {
    processed = processed.replace(
      `ZK${String.fromCharCode(65 + i)}Z`,
      `<span class="token-keyword">${s}</span>`
    );
  });
  return processed;
}

// ─── YAML ──────────────────────────────────────────────────────────────────

export function highlightYAML(code: string): string {
  const escaped = escapeHtml(code);
  const comments: string[] = [];
  const strings: string[] = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => {
      strings.push(s);
      return `YS${String.fromCharCode(65 + strings.length - 1)}Y`;
    })
    .replace(/(#.*)/g, (_m, c) => {
      comments.push(c);
      return `YC${String.fromCharCode(65 + comments.length - 1)}Y`;
    });

  processed = processed
    .replace(/\b(true|false|yes|no|null|none|on|off)\b/gi, '<span class="token-keyword">$1</span>')
    .replace(/(?<!["\w])(-?\d+\.?\d*)(?!["\w])/g, '<span class="token-number">$1</span>')
    .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)(\s*:)/gm,
      '$1<span class="token-keyword">$2</span>$3');

  comments.forEach((c, i) => {
    processed = processed.replace(`YC${String.fromCharCode(65 + i)}Y`, `<span class="token-comment">${c}</span>`);
  });
  strings.forEach((s, i) => {
    processed = processed.replace(`YS${String.fromCharCode(65 + i)}Y`, `<span class="token-string">${s}</span>`);
  });
  return processed;
}

// ─── Dockerfile ────────────────────────────────────────────────────────────

export function highlightDockerfile(code: string): string {
  const escaped = escapeHtml(code);
  const strings: string[] = [];
  const comments: string[] = [];
  let processed = escaped
    .replace(/("[^"]*"|'[^']*')/g, (_m, s) => {
      strings.push(s); return `ZSTR${strings.length - 1}Z`;
    })
    .replace(/(#.*)/g, (_m, c) => {
      comments.push(c); return `ZCMT${comments.length - 1}Z`;
    })
    .replace(
      /\b(FROM|WORKDIR|COPY|RUN|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|ADD|USER|VOLUME|LABEL|MAINTAINER|HEALTHCHECK|ONBUILD|STOPSIGNAL|SHELL|AS)\b/g,
      '<span class="token-keyword">$1</span>'
    );
  comments.forEach((c, i) => { processed = processed.replace(`ZCMT${i}Z`, `<span class="token-comment">${c}</span>`); });
  strings.forEach((s, i) => { processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`); });
  return processed;
}

// ─── SQL ───────────────────────────────────────────────────────────────────

const SQL_KEYWORDS = new Set([
  "SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL","CROSS",
  "ON","AS","AND","OR","NOT","IN","EXISTS","BETWEEN","LIKE","IS","NULL",
  "INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","DROP",
  "ALTER","ADD","COLUMN","INDEX","VIEW","DATABASE","SCHEMA","TRIGGER",
  "PROCEDURE","FUNCTION","BEGIN","END","IF","THEN","ELSE","CASE","WHEN",
  "RETURN","DECLARE","WITH","UNION","ALL","DISTINCT","ORDER","BY","GROUP",
  "HAVING","LIMIT","OFFSET","ASC","DESC","PRIMARY","KEY","FOREIGN","REFERENCES",
  "UNIQUE","CHECK","DEFAULT","CONSTRAINT","TRANSACTION","COMMIT","ROLLBACK",
  "GRANT","REVOKE","EXPLAIN","ANALYZE","VACUUM","TRUNCATE","COPY","CAST",
  "COALESCE","NULLIF","GREATEST","LEAST","ROW","ROWS","FETCH","NEXT","ONLY",
  "OVER","PARTITION","WINDOW","FILTER","WITHIN","CURRENT","PRECEDING","FOLLOWING",
  "UNBOUNDED","RANGE","INTERVAL","EXTRACT","AT","TIME","ZONE","TRUE","FALSE",
]);

const SQL_TYPES = new Set([
  "INT","INTEGER","BIGINT","SMALLINT","TINYINT","FLOAT","DOUBLE","DECIMAL","NUMERIC",
  "REAL","BOOLEAN","BOOL","TEXT","VARCHAR","CHAR","NVARCHAR","NCHAR","CLOB","BLOB",
  "BYTEA","BINARY","VARBINARY","DATE","TIME","DATETIME","TIMESTAMP","TIMESTAMPTZ",
  "INTERVAL","JSON","JSONB","XML","UUID","SERIAL","BIGSERIAL","SMALLSERIAL",
  "ARRAY","HSTORE","INET","CIDR","MACADDR","TSVECTOR","TSQUERY","POINT","LINE",
  "LSEG","BOX","PATH","POLYGON","CIRCLE","MONEY","BIT","VARBIT","OID",
]);

const SQL_FUNCTIONS = new Set([
  "COUNT","SUM","AVG","MIN","MAX","ROUND","CEIL","FLOOR","ABS","MOD","POWER",
  "SQRT","LOG","EXP","RANDOM","SETSEED","NOW","CURRENT_DATE","CURRENT_TIME",
  "CURRENT_TIMESTAMP","DATE_PART","DATE_TRUNC","AGE","MAKE_DATE","MAKE_TIME",
  "TO_CHAR","TO_DATE","TO_TIMESTAMP","UPPER","LOWER","LENGTH","SUBSTR","SUBSTRING",
  "TRIM","LTRIM","RTRIM","LPAD","RPAD","REPLACE","REGEXP_REPLACE","SPLIT_PART",
  "STRING_AGG","ARRAY_AGG","JSONB_AGG","ROW_NUMBER","RANK","DENSE_RANK","NTILE",
  "LAG","LEAD","FIRST_VALUE","LAST_VALUE","NTH_VALUE","GENERATE_SERIES",
  "UNNEST","ARRAY_TO_STRING","STRING_TO_ARRAY","CONCAT","CONCAT_WS","FORMAT",
  "INITCAP","ENCODE","DECODE","MD5","SHA256","DIGEST","CONVERT","CONVERT_FROM",
  "CONVERT_TO","PG_TYPEOF","PG_SIZE_PRETTY","PG_COLUMN_SIZE",
]);

export function highlightSQL(code: string): string {
  const escaped = escapeHtml(code);
  const strings: string[] = [];
  const comments: string[] = [];
  let processed = escaped
    .replace(/('(?:[^']|'')*')/g, (_m, s) => {
      strings.push(s); return `ZSTR${strings.length - 1}Z`;
    })
    .replace(/(--[^\n]*)/g, (_m, c) => {
      comments.push(c); return `ZCMT${comments.length - 1}Z`;
    })
    .replace(/(\/\*[\s\S]*?\*\/)/g, (_m, c) => {
      comments.push(c); return `ZCMT${comments.length - 1}Z`;
    });

  // Case-insensitive keyword replacement
  processed = processed.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (_m, w) => {
    const up = w.toUpperCase();
    if (SQL_FUNCTIONS.has(up)) return `<span class="token-function">${w}</span>`;
    if (SQL_KEYWORDS.has(up)) return `<span class="token-keyword">${w}</span>`;
    if (SQL_TYPES.has(up)) return `<span class="token-type">${w}</span>`;
    return w;
  });
  processed = processed
    .replace(/(?<!["\w])(-?\d+\.?\d*)(?!["\w])/g, '<span class="token-number">$1</span>');

  comments.forEach((c, i) => { processed = processed.replace(`ZCMT${i}Z`, `<span class="token-comment">${escapeHtml(c)}</span>`); });
  strings.forEach((s, i) => { processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`); });
  return processed;
}

// ─── Rust ──────────────────────────────────────────────────────────────────

const RUST_KEYWORDS = new Set([
  "fn","let","mut","const","static","struct","enum","trait","impl","type",
  "use","mod","pub","crate","super","self","Self","where","for","in","if",
  "else","match","loop","while","break","continue","return","async","await",
  "move","ref","box","dyn","unsafe","extern","as","true","false","Some",
  "None","Ok","Err","Vec","String","HashMap","BTreeMap","HashSet","BTreeSet",
  "Option","Result","Box","Rc","Arc","Cell","RefCell","Mutex","RwLock",
]);

const RUST_TYPES = new Set([
  "i8","i16","i32","i64","i128","isize","u8","u16","u32","u64","u128","usize",
  "f32","f64","bool","char","str","String","Vec","Option","Result","Box",
  "Rc","Arc","Cell","RefCell","Mutex","RwLock","HashMap","BTreeMap",
  "HashSet","BTreeSet","Cow","Pin","PhantomData","PhantomPinned",
]);

export function highlightRust(code: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comment
    if (code[i] === "/" && code[i+1] === "/") {
      const end = (() => { const e = code.indexOf("\n", i); return e === -1 ? code.length : e; })();
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, end))}</span>`);
      i = end; continue;
    }
    // Block comment
    if (code[i] === "/" && code[i+1] === "*") {
      let e = code.indexOf("*/", i+2);
      e = e === -1 ? code.length : e + 2;
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, e))}</span>`);
      i = e; continue;
    }
    // String
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === "\\") j++; j++; }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+1))}</span>`);
      i = j + 1; continue;
    }
    // Char literal
    if (code[i] === "'") {
      let j = i + 1;
      if (code[j] === "\\" && j+2 < code.length && code[j+2] === "'") {
        parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+3))}</span>`);
        i = j + 3;
      } else if (j+1 < code.length && code[j+1] === "'") {
        parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+2))}</span>`);
        i = j + 2;
      } else {
        // Lifetime annotation 'a
        let j2 = j;
        while (j2 < code.length && /\w/.test(code[j2])) j2++;
        parts.push(`<span class="token-type">${escapeHtml(code.slice(i, j2))}</span>`);
        i = j2;
      }
      continue;
    }
    // Attribute macro #[...]
    if (code[i] === "#" && code[i+1] === "[") {
      let j = i;
      let depth = 0;
      while (j < code.length) {
        if (code[j] === "[") depth++;
        else if (code[j] === "]") { depth--; if (depth === 0) { j++; break; } }
        j++;
      }
      parts.push(`<span class="token-decorator">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }
    // Number (including 0x hex, 0b, 0o, underscore separators, type suffixes)
    if (/\d/.test(code[i])) {
      let j = i;
      if (code[j] === "0" && /[xXbBoO]/.test(code[j+1] || "")) {
        j += 2;
        while (j < code.length && /[\w]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[\d._eE]/.test(code[j])) j++;
        // Numeric type suffix like u32, i64, f64
        if (/[iuf]/.test(code[j] || "")) {
          const sfxStart = j;
          while (j < code.length && /\w/.test(code[j])) j++;
          const sfx = code.slice(sfxStart, j);
          if (/^(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64)$/.test(sfx)) {
            // keep suffix as part of number token
          } else {
            j = sfxStart; // rewind if not a valid suffix
          }
        }
      }
      parts.push(`<span class="token-number">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }
    // Identifiers
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j;
      while (k < code.length && code[k] === " ") k++;
      if (RUST_KEYWORDS.has(word)) {
        parts.push(`<span class="token-keyword">${escapeHtml(word)}</span>`);
      } else if (RUST_TYPES.has(word)) {
        parts.push(`<span class="token-type">${escapeHtml(word)}</span>`);
      } else if (code[k] === "(") {
        parts.push(`<span class="token-function">${escapeHtml(word)}</span>`);
      } else if (code[k] === "!" && /[a-zA-Z(]/.test(code[k+1] || "")) {
        // Macro invocation like println!, vec!, format!
        parts.push(`<span class="token-builtin">${escapeHtml(word)}</span>`);
      } else if (/^[A-Z]/.test(word)) {
        parts.push(`<span class="token-type">${escapeHtml(word)}</span>`);
      } else {
        parts.push(escapeHtml(word));
      }
      i = j; continue;
    }
    parts.push(escapeHtml(code[i]));
    i++;
  }

  return parts.join("");
}

// ─── Go ────────────────────────────────────────────────────────────────────

const GO_KEYWORDS = new Set([
  "break","case","chan","const","continue","default","defer","else","fallthrough",
  "for","func","go","goto","if","import","interface","map","package","range",
  "return","select","struct","switch","type","var","nil","true","false",
  "iota","make","new","len","cap","close","delete","append","copy","panic",
  "recover","print","println",
]);

const GO_TYPES = new Set([
  "bool","byte","complex64","complex128","error","float32","float64",
  "int","int8","int16","int32","int64","rune","string","uint","uint8",
  "uint16","uint32","uint64","uintptr","any","comparable",
]);

export function highlightGo(code: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === "/" && code[i+1] === "/") {
      const end = (() => { const e = code.indexOf("\n", i); return e === -1 ? code.length : e; })();
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, end))}</span>`);
      i = end; continue;
    }
    if (code[i] === "/" && code[i+1] === "*") {
      let e = code.indexOf("*/", i+2);
      e = e === -1 ? code.length : e + 2;
      parts.push(`<span class="token-comment">${escapeHtml(code.slice(i, e))}</span>`);
      i = e; continue;
    }
    if (code[i] === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== "`") j++;
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+1))}</span>`);
      i = j + 1; continue;
    }
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"' && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+1))}</span>`);
      i = j + 1; continue;
    }
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'" && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      parts.push(`<span class="token-string">${escapeHtml(code.slice(i, j+1))}</span>`);
      i = j + 1; continue;
    }
    if (/\d/.test(code[i])) {
      let j = i;
      if (code[j] === "0" && /[xXbBoO]/.test(code[j+1] || "")) {
        j += 2;
        while (j < code.length && /[\w]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[\d._eE]/.test(code[j])) j++;
      }
      parts.push(`<span class="token-number">${escapeHtml(code.slice(i, j))}</span>`);
      i = j; continue;
    }
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j;
      while (k < code.length && code[k] === " ") k++;
      if (GO_KEYWORDS.has(word)) {
        parts.push(`<span class="token-keyword">${escapeHtml(word)}</span>`);
      } else if (GO_TYPES.has(word)) {
        parts.push(`<span class="token-type">${escapeHtml(word)}</span>`);
      } else if (code[k] === "(") {
        parts.push(`<span class="token-function">${escapeHtml(word)}</span>`);
      } else {
        parts.push(escapeHtml(word));
      }
      i = j; continue;
    }
    parts.push(escapeHtml(code[i]));
    i++;
  }

  return parts.join("");
}

// ─── CSS ───────────────────────────────────────────────────────────────────

export function highlightCSS(code: string): string {
  const escaped = escapeHtml(code);
  const strings: string[] = [];
  const comments: string[] = [];
  let processed = escaped
    .replace(/('[^']*'|"[^"]*")/g, (_m, s) => {
      strings.push(s); return `ZSTR${strings.length - 1}Z`;
    })
    .replace(/(\/\*[\s\S]*?\*\/)/g, (_m, c) => {
      comments.push(c); return `ZCMT${comments.length - 1}Z`;
    });

  processed = processed
    // Selectors: .class, #id, element, :pseudo, ::pseudo
    .replace(/(^|\{|\}|,)\s*([^{},]+)(?=\s*\{)/g, (_m, p1, sel) =>
      `${p1} <span class="token-function">${sel.trim()}</span>`)
    // Property names
    .replace(/([a-zA-Z-]+)\s*:/g, '<span class="token-keyword">$1</span>:')
    // Color hex values
    .replace(/#([0-9a-fA-F]{3,8})\b/g, '<span class="token-number">#$1</span>')
    // Numbers with units
    .replace(/(-?\d+\.?\d*)(px|em|rem|vh|vw|%|s|ms|deg|rad|fr|ch|ex)?/g,
      (_m, n, u) => u
        ? `<span class="token-number">${n}${u}</span>`
        : `<span class="token-number">${n}</span>`)
    // Keywords/values
    .replace(/\b(auto|none|inherit|initial|unset|revert|normal|bold|italic|underline|solid|dashed|dotted|flex|grid|block|inline|absolute|relative|fixed|sticky|hidden|visible|scroll|pointer|default|center|left|right|top|bottom|middle|stretch|space-between|space-around|space-evenly|wrap|nowrap|row|column|transparent|currentColor)\b/g,
      '<span class="token-builtin">$1</span>');

  comments.forEach((c, i) => { processed = processed.replace(`ZCMT${i}Z`, `<span class="token-comment">${c}</span>`); });
  strings.forEach((s, i) => { processed = processed.replace(`ZSTR${i}Z`, `<span class="token-string">${s}</span>`); });
  return processed;
}

// ─── Dispatch ──────────────────────────────────────────────────────────────

export function highlightCode(code: string, lang: string): string {
  switch ((lang || "").toLowerCase().trim()) {
    case "python":
    case "py":
      return highlightPython(code);
    case "javascript":
    case "js":
    case "jsx":
    case "typescript":
    case "ts":
    case "tsx":
      return highlightJS(code);
    case "bash":
    case "sh":
    case "shell":
    case "zsh":
      return highlightBash(code);
    case "json":
    case "json5":
      return highlightJSON(code);
    case "yaml":
    case "yml":
      return highlightYAML(code);
    case "dockerfile":
    case "docker":
      return highlightDockerfile(code);
    case "sql":
    case "postgresql":
    case "mysql":
    case "sqlite":
      return highlightSQL(code);
    case "rust":
    case "rs":
      return highlightRust(code);
    case "go":
    case "golang":
      return highlightGo(code);
    case "css":
    case "scss":
    case "less":
      return highlightCSS(code);
    default:
      return escapeHtml(code);
  }
}
