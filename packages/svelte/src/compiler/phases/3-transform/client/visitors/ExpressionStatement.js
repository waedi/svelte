/** @import { Expression, Property, ExpressionStatement, ObjectExpression, Identifier } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';

/**
 * @param {ExpressionStatement} node
 * @param {ComponentContext} context
 */
export function ExpressionStatement(node, context) {
	if (node.expression.type === 'CallExpression') {
		const rune = get_rune(node.expression, context.state.scope);
		const callee = rune === '$effect' ? '$.user_effect' : '$.user_pre_effect';

		if (rune === '$effect' || rune === '$effect.pre') {
			const func = /** @type {Expression} */ (context.visit(node.expression.arguments[0]));
			const link = node.expression.metadata?.link;

			if (rune === '$effect.pre' && link) {
				const bind_option = /** @type {Property} */ (
					/** @type {ObjectExpression} */ (node.expression.arguments[1]).properties.find(
						(p) => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'bind'
					)
				);

				const expr = b.call(
					callee,
					/** @type {Expression} */ (func),
					/** @type {Identifier} */ (bind_option.value)
				);
				expr.callee.loc = node.expression.callee.loc; // ensure correct mapping

				return b.var(b.id(link), expr);
			}

			const expr = b.call(callee, /** @type {Expression} */ (func));
			expr.callee.loc = node.expression.callee.loc; // ensure correct mapping

			return b.stmt(expr);
		}
	}

	context.next();
}
