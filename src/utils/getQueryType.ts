import { VariableDeclarator, isCallExpression, isStringLiteral } from "@babel/types";
import { NodePath } from "@babel/traverse";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

/**
 * Return top level type that query is based on which is always the first argument in
 * the useQuery hook.
 * @example
 * function MyComponentName() {
 *   const { data } = useQuery("GetMovie")
 * }
 * ↓ ↓ ↓ ↓ ↓ ↓
 * "GetMovie"
 */
export function getQueryType(path: NodePath<VariableDeclarator>) {
  const { init } = path.node;

  if (!isCallExpression(init)) {
    throw path.buildCodeFrameError("useQuery is not invoked");
  }

  const queryArg = init.arguments[0];
  if (!isStringLiteral(queryArg)) {
    throw path.buildCodeFrameError(
      "The first argument of useQuery must be a string specifying the graphql type the query is on."
    );
  }
  return queryArg.value;
}
