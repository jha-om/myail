import TurndownService from "turndown";

export const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    bulletListMarker: '-',
    linkStyle: 'inlined',
});

// removing link tags
turndown.addRule('linkRemover', {
    filter: 'a',
    replacement: (content) => content,
});

// removing style tags;
turndown.addRule('styleRemover', {
    filter: 'style',
    replacement: () => '',
});

// removing script tags
turndown.addRule('scriptRemover', {
    filter: 'script',
    replacement: () => '',
})

// removing image tags;
turndown.addRule('imageRemover', {
    filter: 'img',
    replacement: (content) => content,
});