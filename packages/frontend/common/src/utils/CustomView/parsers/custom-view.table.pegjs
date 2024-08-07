Table
  = (LeftArrow 'table'i RightArrow)
    table: TableContent
    (LeftArrow BackSlash 'table'i RightArrow) { return { table }; }

TableContent
  = table: (
        (parameters: TableParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfTableExpression { return wrap(conditions, 'conditions'); })
        / (rows: TableRow { return wrap(rows, 'rows'); })
        / (scope: ScriptScope { return wrap(scope, 'scope'); })
        / (templates: TableCellTemplate { return wrap(templates, 'templates'); })
        / (sources: Source { return wrap(sources, 'sources') })
    )* { return processTableContent(table); }

TableHeader
  = (LeftArrow 'header'i RightArrow)
    columns: (TableHeaderColumn / EmptyTableHeaderColumn)*
    (LeftArrow BackSlash 'header'i RightArrow) { return { columns }; }

EmptyTableHeaderColumn = (LeftArrow 'column'i BackSlash RightArrow) { return {}; }

TableHeaderColumn
  = (LeftArrow 'column'i RightArrow)
    column: (TableHeaderColumnText / TableHeaderColumnWidth)*
    (LeftArrow BackSlash 'column'i RightArrow) { return mergeDeep(column); }

TableHeaderColumnText
  = (LeftArrow 'text'i RightArrow)
    text: TagValue?
    (LeftArrow BackSlash 'text'i RightArrow) { return { text }; }

TableHeaderColumnWidth
  = (LeftArrow 'width'i RightArrow)
    width: TagNumberValue?
    (LeftArrow BackSlash 'width'i RightArrow) { return { width }; }

TableRow
  = (LeftArrow 'row'i RightArrow)
    row: (
        (rows: TableRow { return wrap(rows, 'rows'); })
        / (parameters: TableRowParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfTableRowExpression { return wrap(conditions, 'conditions'); })
        / (cells: (TableCell / EmptyTableCell) { return wrap(cells, 'cells'); })
    )*
    (LeftArrow BackSlash 'row'i RightArrow) { return processTableRow(row); }

EmptyTableCell = (LeftArrow 'cell'i BackSlash RightArrow) { return {}; }

TableCell
  = (LeftArrow 'cell'i RightArrow)
    cell: (
        (parameters: TableCellParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfTableCellExpression { return wrap(conditions, 'conditions'); })
        / (templates: TemplateUse { return wrap(templates, 'templates'); })
    )*
    (LeftArrow BackSlash 'cell'i RightArrow) { return processTableCell(cell); }


TableParameters = TableHeader
TableRowParameters = Style
TableCellParameters = Style / Tooltip / Mark / DisplayValue

IfTableCellExpression
  = IfExpressionStartTag
    ifExpression: (
      condition: ConditionExpression
      parameters: TableCellParameters* { return { condition, parameters: mergeParameters(parameters) }; }
    )
    IfExpressionEndTag { return ifExpression; }

IfTableRowExpression
  = IfExpressionStartTag
    ifExpression: (
      condition: ConditionExpression
      parameters: TableRowParameters* { return { condition, parameters: mergeParameters(parameters) }; }
    )
    IfExpressionEndTag { return ifExpression; }

IfTableExpression
  = IfExpressionStartTag
    ifExpression: (
      condition: ConditionExpression
      parameters: TableParameters* { return { condition, parameters: mergeParameters(parameters) }; }
    )
    IfExpressionEndTag { return ifExpression; }

TableCellTemplate
  = TemplateStartTag
    template: (
        (name: TemplateName { return wrap(name, 'name'); })
        / (args: TemplateArguments { return wrap(args, 'args'); })
        / (parameters: TableCellParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfTableCellExpression { return wrap(conditions, 'conditions'); })
    )*
    TemplateEndTag { return processTableCellTemplate(template); }
