import babelTypes, { VariableDeclarator, ObjectPattern } from "@babel/types";
import { NodePath } from "@babel/core";
import { Kind, FieldNode } from "graphql";
import { graphqlAST } from ".";

// == Types ================================================================

interface IDataIdentifiers {
  [key: string]: FieldNode;
}

// == Constants ============================================================

const DATA_PROPERTY = "data";

// == Functions ============================================================

function filterFieldNodesWithoutProperty(fieldNode: FieldNode, propertyName: string) {
  return (
    fieldNode.selectionSet?.selections.filter(
      (node): node is FieldNode => node.kind === Kind.FIELD && node.name.value !== propertyName
    ) || []
  );
}

function parseNestedObjects(
  t: typeof babelTypes,
  path: NodePath<VariableDeclarator>,
  properties: ObjectPattern["properties"],
  querySelections: $Writeable<FieldNode>,
  dataIdentifiers: IDataIdentifiers
) {
  for (const property of properties) {
    if (!t.isObjectProperty(property)) continue;

    if (property.shorthand && t.isIdentifier(property.value)) {
      const propertyName = property.value.name;
      const existingFieldNodes = filterFieldNodesWithoutProperty(querySelections, propertyName);
      const newFieldNode = graphqlAST.newFieldNode(propertyName);
      querySelections.selectionSet = graphqlAST.newSelectionSet([
        ...existingFieldNodes,
        newFieldNode,
      ]);
      dataIdentifiers[propertyName] = newFieldNode;
      parseReferencePaths(t, path, propertyName, newFieldNode, dataIdentifiers);
    } else if (t.isObjectPattern(property.value) && t.isIdentifier(property.key)) {
      const propertyName = property.key.name;
      const existingFieldNodes = filterFieldNodesWithoutProperty(querySelections, propertyName);
      const newFieldNode = graphqlAST.newFieldNode(propertyName);
      querySelections.selectionSet = graphqlAST.newSelectionSet([
        ...existingFieldNodes,
        newFieldNode,
      ]);
      parseNestedObjects(t, path, property.value.properties, newFieldNode, dataIdentifiers);
    }
  }
}

function parseReferencePaths(
  t: typeof babelTypes,
  path: NodePath<VariableDeclarator>,
  propertyName: string,
  querySelections: $Writeable<FieldNode>,
  dataIdentifiers: IDataIdentifiers
) {
  path.scope.bindings[propertyName].referencePaths.forEach((referencePath) => {
    if (referencePath.parent.type !== "VariableDeclarator") return;
    parseNestedObjects(
      t,
      path,
      referencePath.parent.id.properties,
      querySelections,
      dataIdentifiers
    );
  });
}

// == Exports ==============================================================

/**
 * Returns data or aliased data identifier used with useQuery.
 * Currently only allows destructuring the useQuery value:
 * @example
 * const { data } = useQuery("Movie");
 *
 * @todo Track identifier's data property
 * @example
 * const result = useQuery("Movie");
 * ...
 * result.data.id
 * // or
 * const movie = result.data
 * movie.id
 */
export function getDataIdentifiers(
  t: typeof babelTypes,
  path: NodePath<VariableDeclarator>,
  querySelections: FieldNode
) {
  const { node } = path;
  const { id } = node;
  if (!t.isObjectPattern(id)) return {};

  // Find data property in destructured object and get alias name
  // EXAMPLE: const { data: dataAlias } = useQuery("Movie");
  const dataIdentifiers: IDataIdentifiers = {};
  for (const property of id.properties) {
    if (t.isObjectProperty(property) && t.isIdentifier(property.key, { name: DATA_PROPERTY })) {
      if (t.isIdentifier(property.value)) {
        parseReferencePaths(t, path, property.value.name, querySelections, dataIdentifiers);
        dataIdentifiers[property.value.name] = querySelections;
      }
      if (t.isObjectPattern(property.value)) {
        parseNestedObjects(t, path, property.value.properties, querySelections, dataIdentifiers);
      }
    }
  }
  return dataIdentifiers;
}
