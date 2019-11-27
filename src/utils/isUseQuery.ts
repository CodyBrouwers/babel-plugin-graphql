import babelTypes, { VariableDeclarator } from "@babel/types";

// == Types ================================================================

// == Constants ============================================================

const USE_QUERY = "useQuery";

// == Functions ============================================================

// == Exports ==============================================================

export function isUseQuery(t: typeof babelTypes, { init }: VariableDeclarator) {
  if (init?.type !== "CallExpression") return false;
  if (!t.isIdentifier(init.callee, { name: USE_QUERY })) return false;
  return true;
}
