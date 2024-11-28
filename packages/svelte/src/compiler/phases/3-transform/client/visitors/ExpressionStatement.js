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

		if (rune === '$effect' || rune === '$effect.pre') {
			const callee = rune === '$effect' ? '$.user_effect' : '$.user_pre_effect';
			const func = /** @type {Expression} */ (context.visit(node.expression.arguments[0]));
			const expr = b.call(callee, /** @type {Expression} */ (func));
			expr.callee.loc = node.expression.callee.loc; // ensure correct mapping

			return b.stmt(expr);
		}
		if (rune === '$effect.lazy') {
			const func = /** @type {Expression} */ (context.visit(node.expression.arguments[1]));
			const id = /** @type {string} */ (node.expression.metadata?.id);

			const expr = b.call(
				'$.lazy_effect',
				/** @type {Expression} */ (func),
				/** @type {Identifier} */ (node.expression.arguments[0])
			);
			expr.callee.loc = node.expression.callee.loc; // ensure correct mapping

			return b.var(b.id(id), expr);
		}
	}

	context.next();
}
