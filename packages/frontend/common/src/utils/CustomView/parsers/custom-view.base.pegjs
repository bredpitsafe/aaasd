LeftArrow "\"<\"" = _ '<' _
RightArrow "\">\"" = _ '>' _
BackSlash "\"/\"" =_ '/' _
CDataStart "<![CDATA[" = _ '<![CDATA[' _
CDataEnd "]]>" = _ ']]>' _
TagName "\"Tag name\"" = [a-zA-Z] ([-_]?[a-zA-Z0-9]+)* { return text(); }
TagValue "\"Tag value\"" = (!LeftArrow .)* {
    return text()
        .replaceAll(/(&apos;)|(&#39;)/g, `'`)
        .replaceAll(/(&quot;)|(&#34;)/g, `"`)
        .replaceAll(/(&gt;)|(&#62;)/g, `>`)
        .replaceAll(/(&lt;)|(&#60;)/g, `<`)
        .replaceAll(/(&amp;)|(&#38;)/g, `&`);
}
TagNumberValue "\"Tag number value\"" = (!LeftArrow .)* {
    const value = text();
    if (!value) {
      return undefined;
    }

    const num = parseFloat(value);

    return isNaN(num) || !isFinite(num) ? undefined : num;
}
CData "\"CDATA section\""
  = CDataStart
    text: ((!CDataEnd .)* { return text()?.trim() ?? ''; })
    CDataEnd { return text; }
TagTextContent = text: (CData / TagValue) { return text.trim() ?? ''; }
EndTag "\"Closing tag name\""
  = LeftArrow
    BackSlash
    key:TagName
    RightArrow { return key; }

_ "whitespace" = [ \t\n\r]*
