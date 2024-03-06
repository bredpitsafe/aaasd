IfExpressionStartTag = LeftArrow key: 'if'i RightArrow { return key; }
IfExpressionEndTag = LeftArrow BackSlash key: 'if'i RightArrow { return key; }

TemplatesStartTag = LeftArrow key: 'templates'i RightArrow { return key; }
TemplatesEndTag = LeftArrow BackSlash key: 'templates'i RightArrow { return key; }

TemplateStartTag = LeftArrow key: 'template'i RightArrow { return key; }
TemplateEndTag = LeftArrow BackSlash key: 'template'i RightArrow { return key; }

Source
  = (
        (LeftArrow 'source'i RightArrow)
        name: SourceName
        url: SourceUrl
        (LeftArrow BackSlash 'source'i RightArrow) { return processSource(name, url); }
    ) / (
        (LeftArrow 'source'i RightArrow)
        url: SourceUrl
        name: SourceName
        (LeftArrow BackSlash 'source'i RightArrow) { return processSource(name, url); }
    )

SourceUrl
  = (LeftArrow 'url'i RightArrow)
    url: TagTextContent?
    (LeftArrow BackSlash 'url'i RightArrow) { return processRequiredValue(url, 'Source URL'); }

SourceName
  = (LeftArrow 'name'i RightArrow)
    name: TagTextContent?
    (LeftArrow BackSlash 'name'i RightArrow) { return processRequiredValue(name, 'Source name'); }

TemplateUse
  = (
      (LeftArrow 'use-template'i RightArrow)
      template: TemplateUseContent
      (LeftArrow BackSlash 'use-template'i RightArrow) { return template; }
    ) / (
      (LeftArrow 'use_template'i RightArrow)
      template: TemplateUseContent
      (LeftArrow BackSlash 'use_template'i RightArrow) { return template; }
    )

TemplateUseContent
  = (
        name: TemplateName
        args: TemplateUseArguments? { return processTemplateUseContent(name, args); }
    ) / (
        args: TemplateUseArguments
        name: TemplateName { return processTemplateUseContent(name, args); }
    )

TemplateName
  = (LeftArrow 'name'i RightArrow)
    name: TagTextContent?
    (LeftArrow BackSlash 'name'i RightArrow) { return processRequiredValue(name, 'Template name'); }

TemplateUseArguments
  = (LeftArrow 'parameters'i RightArrow)
    args: TemplateUseArgument*
    (LeftArrow BackSlash 'parameters'i RightArrow) { return processTemplateArguments(args); }

TemplateUseArgument
  = (LeftArrow 'parameter'i RightArrow)
    argument: TagTextContent?
    (LeftArrow BackSlash 'parameter'i RightArrow) { return processTemplateArgument(argument, 2); }

TemplateArguments
  = (LeftArrow 'parameters'i RightArrow)
    args: TemplateArgument*
    (LeftArrow BackSlash 'parameters'i RightArrow) { return processTemplateArguments(args); }

TemplateArgument
  = (LeftArrow 'parameter'i RightArrow)
    argument: TagTextContent?
    (LeftArrow BackSlash 'parameter'i RightArrow) { return processTemplateArgument(argument, 1); }

ScriptScope
  = (LeftArrow 'scope'i RightArrow)
    scope: TagTextContent?
    (LeftArrow BackSlash 'scope'i RightArrow) { return processScriptScope(scope); }

ConditionExpression
  = (LeftArrow 'condition'i RightArrow)
    condition: TagTextContent?
    (LeftArrow BackSlash 'condition'i RightArrow) { return processConditionExpression(condition); }

Style
  = (LeftArrow 'style'i RightArrow)
    styles: StyleItem*
    (LeftArrow BackSlash 'style'i RightArrow) { return processStyle(styles); }

StyleItem
  = (
        startTag: (
            LeftArrow
            key: TagName
            RightArrow { return key; }
        )
        content: TagTextContent?
        endTag: EndTag { return processStyleItem(startTag, content, endTag); }
    ) / (
        LeftArrow
        startTag: TagName
        BackSlash
        RightArrow { return processEmptyStyleItem(startTag); }
    )

Tooltip
  = (LeftArrow 'tooltip'i RightArrow)
    tooltip: TagTextContent?
    (LeftArrow BackSlash 'tooltip'i RightArrow) { return processTooltip(tooltip); }

DisplayValue
  = (LeftArrow 'text'i RightArrow)
    value: (FormattedText / TagTextContent)?
    (LeftArrow BackSlash 'text'i RightArrow) { return processDisplayValue(value); }

FormattedText = parameters: ((Format Formula) / (Formula Format?)) { return processFormattedText(parameters); }

Format
  = (LeftArrow 'format'i RightArrow)
    format: TagTextContent?
    (LeftArrow BackSlash 'format'i RightArrow) { return processFormat(format); }

Formula
  = (LeftArrow 'formula'i RightArrow)
    formula: TagTextContent?
    (LeftArrow BackSlash 'formula'i RightArrow) { return processFormula(formula); }

GridColumn
  = (LeftArrow 'column'i RightArrow)
    text: TagTextContent?
    (LeftArrow BackSlash 'column'i RightArrow) { return processGridColumn(text); }

Mark
  = (LeftArrow 'mark'i RightArrow)
    parameters: Style*
    (LeftArrow BackSlash 'mark'i RightArrow) { return processMark(parameters); }
