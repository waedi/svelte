/** @import { ExpressionStatement, FunctionExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';

/**
 * @param {ExpressionStatement} node
 * @param {Context} context
 */
export function ExpressionStatement(node, context) {
	const rune = get_rune(node.expression, context.state.scope);

	if (node.expression.type === 'CallExpression') {
		if (rune === '$effect' || rune === '$effect.pre' || rune === '$effect.root') {
			const link = node.expression.metadata?.link;

			// TODO we should probably only output the effect in SSR if it's link is referenced
			// outside of the effect?
			if (rune === '$effect.pre' && link) {
				const func = /** @type {FunctionExpression} */ (node.expression.arguments[0]);

				return b.stmt(b.call(/** @type {FunctionExpression} */ (context.visit(func))));
			}

			return b.empty;
		}
	}

	context.next();
}
