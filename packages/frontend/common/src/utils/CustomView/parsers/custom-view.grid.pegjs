Grid
  = (LeftArrow 'grid'i RightArrow)
    grid: GridContent
    (LeftArrow BackSlash 'grid'i RightArrow) { return { grid }; }

GridContent
  = grid: (
        (parameters: GridParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfGridExpression { return wrap(conditions, 'conditions'); })
        / (cells: (GridCell / EmptyGridCell) { return wrap(cells, 'cells'); })
        / (scope: ScriptScope { return wrap(scope, 'scope'); })
        / (templates: GridCellTemplate { return wrap(templates, 'templates'); })
        / (sources: Source { return wrap(sources, 'sources') })
    )* { return processGridContent(grid); }

GridColumnsCount
  = (LeftArrow 'columns'i RightArrow)
    text: TagValue?
    (LeftArrow BackSlash 'columns'i RightArrow) { return processGridColumnsCount(text); }

EmptyGridCell = (LeftArrow 'cell'i BackSlash RightArrow) { return {}; }

GridCell
  = (LeftArrow 'cell'i RightArrow)
    cell: (
        (parameters: GridCellParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfGridCellExpression { return wrap(conditions, 'conditions'); })
        / (templates: TemplateUse { return wrap(templates, 'templates'); })
    )*
    (LeftArrow BackSlash 'cell'i RightArrow) { return processGridCell(cell); }

GridParameters = Style / GridColumnsCount
GridCellParameters = Style / Tooltip / Mark / DisplayValue / GridColumn

IfGridCellExpression
  = IfExpressionStartTag
    ifExpression: (
      condition: ConditionExpression
      parameters: GridCellParameters* { return { condition, parameters: mergeParameters(parameters) }; }
    )
    IfExpressionEndTag { return ifExpression; }

IfGridExpression
  = IfExpressionStartTag
    ifExpression: (
      condition: ConditionExpression
      parameters: GridParameters* { return { condition, parameters: mergeParameters(parameters) }; }
    )
    IfExpressionEndTag { return ifExpression; }

GridCellTemplate
  = TemplateStartTag
    template: (
        (name: TemplateName { return wrap(name, 'name'); })
        / (args: TemplateArguments { return wrap(args, 'args'); })
        / (parameters: GridCellParameters { return wrap(parameters, 'parameters'); })
        / (conditions: IfGridCellExpression { return wrap(conditions, 'conditions'); })
    )*
    TemplateEndTag { return processGridCellTemplate(template); }
