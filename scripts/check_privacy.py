from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "dist", ".vite"}
TEXT_EXTENSIONS = {".js", ".jsx", ".json", ".md", ".py", ".sql", ".yml", ".yaml", ".html", ".css", ".example", ".txt"}

SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    "AWS access key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "credential assignment": re.compile(r"(?i)(password|passwd|secret|api[_-]?key)\s*[:=]\s*['\"][^'\"]{8,}['\"]"),
}

PROHIBITED_NAMES = {
    "bureau_export.csv",
    "customer_data.csv",
    "loan_accounts.csv",
    "credentials.json",
    ".env",
}


def iter_files():
    for path in ROOT.rglob("*"):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path


def main() -> int:
    findings: list[str] = []
    for path in iter_files():
        relative = path.relative_to(ROOT)
        if path.name.lower() in PROHIBITED_NAMES:
            findings.append(f"prohibited public filename: {relative}")
        if path.suffix.lower() not in TEXT_EXTENSIONS and path.name != ".env.example":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                findings.append(f"{label} pattern: {relative}")

    if findings:
        print("Privacy check failed:")
        for item in findings:
            print(f"- {item}")
        return 1
    print("Privacy check passed: no prohibited files or common secret patterns found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
