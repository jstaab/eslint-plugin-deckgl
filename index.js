module.exports = {
  rules: {
    "exhaustive-triggers": {
      create(context) {
        const code = context.getSourceCode();
        let globalScope;
        
        function isGlobalProperty(node) {
          return globalScope.variables.some(variable => {
            return variable.name === node.name;
          });
        }

        return {
          Program() {
            globalScope = context.getScope();
          },
          'NewExpression Identifier'(identifierNode) {
            if (!identifierNode.name.endsWith('Layer')) {
              return;
            }

            const newExpressions = context.getAncestors().filter(ancestor => ancestor.type === 'NewExpression')

            const node = newExpressions[newExpressions.length - 1];

            if (!node.arguments || !node.arguments.length) {
              return;
            }

            const params = node.arguments[0];

            if (params.type !== 'ObjectExpression') {
              return;
            }
            
            const updateTriggers = params.properties.find(({ key }) => key && key.name === 'updateTriggers');
            
            params.properties.forEach(property => {
              if (
                property.type === 'Property' &&
                property.key.name.startsWith('get') &&
                /Function/.test(property.value.type)
              ) {
                const scope = code.scopeManager.acquire(property.value);

                scope.through.forEach(ref => {
                  if (!ref.resolved) {
                    return;
                  }

                  if (ref.resolved.scope.type === 'module') {
                    return;
                  }

                  if (ref.resolved.defs.find(def => def.isTypeDefinition)) {
                    return;
                  }

                  if (isGlobalProperty(ref.resolved)) {
                    return;
                  }

                  let triggerProperties = [];

                  if (updateTriggers) {
                    triggerProperties = updateTriggers.value.properties || [];
                  }

                  let triggerElements = []

                  const trigger = triggerProperties.find(({ key }) => key && key.name === property.key.name);

                  if (trigger) {
                    triggerElements = trigger.value.elements || [trigger.value];
                  }

                  const foundTrigger = triggerElements.find(element => element && element.name === ref.resolved.name)

                  if (!foundTrigger) {
                    context.report(property, `${ref.resolved.name} missing from updateTriggers`);
                  }
                })
              }
            });
          },
        };
      }
    }
  }
};
