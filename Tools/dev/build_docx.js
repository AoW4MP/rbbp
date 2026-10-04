// markdown (RBBP_doc_N.md) -> .docx для мейнтейнера (его мастер-файл в Word).
//   node Tools/dev/build_docx.js RBBP_doc_7.md RBBP_doc_7_fixed.docx
// Поддерживает: # / ## / ### заголовки, "- " списки (2 пробела на уровень, до 6 уровней),
// **bold**, [текст](url). Коды [xxx] и (EnglishName) остаются обычным текстом - это разметка.
// Проверка: pandoc --wrap=none -t markdown out.docx даёт тот же текст (кроме экранирования \" и \--).
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink, LevelFormat, AlignmentType } = require("docx");

const [src, out] = process.argv.slice(2);
if (!src || !out) {
    console.error("usage: node build_docx.js <in.md> <out.docx>");
    process.exit(2);
}
const lines = fs.readFileSync(src, "utf-8").split(/\r?\n/);

function parseInline(str) {
    const children = [];
    const re = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
    let last = 0;
    let m;
    while ((m = re.exec(str)) !== null) {
        if (m.index > last) children.push(new TextRun(str.slice(last, m.index)));
        if (m[1] !== undefined) children.push(new TextRun({ text: m[2], bold: true }));
        else
            children.push(
                new ExternalHyperlink({ link: m[5], children: [new TextRun({ text: m[4], style: "Hyperlink" })] })
            );
        last = re.lastIndex;
    }
    if (last < str.length) children.push(new TextRun(str.slice(last)));
    if (!children.length) children.push(new TextRun(""));
    return children;
}

const numbering = {
    config: [
        {
            reference: "rbbp-bullets",
            levels: [0, 1, 2, 3, 4, 5].map((lvl) => ({
                level: lvl,
                format: LevelFormat.BULLET,
                text: "•",
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 360 + lvl * 360, hanging: 260 } } }
            }))
        }
    ]
};

const headingMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
const paragraphs = [];
for (const raw of lines) {
    if (!raw.trim()) continue;
    let m = raw.match(/^(#{1,4}) (.*)$/);
    if (m) {
        paragraphs.push(
            new Paragraph({ heading: headingMap[m[1].length], children: parseInline(m[2]), spacing: { before: 240, after: 120 } })
        );
        continue;
    }
    m = raw.match(/^( *)- (.*)$/);
    if (m) {
        const lvl = Math.min(5, Math.floor(m[1].length / 2));
        paragraphs.push(
            new Paragraph({ children: parseInline(m[2]), numbering: { reference: "rbbp-bullets", level: lvl }, spacing: { after: 80 } })
        );
        continue;
    }
    paragraphs.push(new Paragraph({ children: parseInline(raw), spacing: { after: 120 } }));
}

const doc = new Document({
    numbering,
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 } } }, children: paragraphs }]
});
Packer.toBuffer(doc).then((buf) => {
    fs.writeFileSync(out, buf);
    console.log("wrote", out, buf.length, "bytes");
});
