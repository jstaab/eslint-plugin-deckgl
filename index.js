module.exports = {
  rules: {
    "exhaustive-triggers": {
      create(context) {
        const { scopeManager } = context.getSourceCode();
        let globalScope;
        
        function isGlobalProperty(node) {
          return globalScope.variables.some(variable => {
            return variable.name === node.name;
          });
        }

        function getVariableDefinition(variableName) {
          const variable = context.getScope().set.get(variableName) || {};
          const { defs } = variable;

          if (!defs || !defs.length) {
            return null;
          }

          const variableDefinition = defs[0];

          if (variableDefinition.node.type !== 'VariableDeclarator') {
            return null;
          }

          return variableDefinition.node.init;
        }

        function checkExhaustiveTriggers(identifierNode) {
          if (!identifierNode.name.endsWith('Layer')) {
            return;
          }
        
          const newExpressions = context.getAncestors().filter(ancestor => ancestor.type === 'NewExpression')
        
          const node = newExpressions[newExpressions.length - 1];
        
          if (!node || !node.arguments || !node.arguments.length) {
            return;
          }
        
          let params = node.arguments[0];
        
          if (params.type === 'Identifier') {
            const identifier = getVariableDefinition(params.name);
            
            if (!identifier) {
              return;
            }

            params = identifier;
          }
          
          if (params.type !== 'ObjectExpression') {
            return;
          }

          const updateTriggers = params.properties.find(({ key }) => key && key.name === 'updateTriggers');
        
          /** @type Map<any, Set<string>> */
          const propertyMap = new Map()

          params.properties.forEach(property => {
            if (
              property.type !== 'Property' ||
              !property.key.name.startsWith('get')
            ) {
              return;
            }

            if (identifierNode.name === 'TileLayer' && property.key.name === 'getTileData') {
              // there are some special cases where the `get*` property format does not refer to a data accessor
              return;
            }

            let scope;

            if (/Function/.test(property.value.type)) {
              scope = scopeManager.acquire(property.value);
            } else  if (property.value.type === 'Identifier') {
              const identifier = getVariableDefinition(property.value.name);
              
              if (!identifier) {
                return;
              }
              
              if (/Function/.test(identifier.type)) {
                scope = scopeManager.acquire(identifier);
              }
            }

            if (!scope) {
              return;
            }

            propertyMap.set(property, new Set());

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
                if (!trigger.value.elements) {
                  if (!propertyMap.has(trigger)) {
                    propertyMap.set(trigger, new Set());
                  }

                  propertyMap.get(trigger).add(`${property.key.name} updateTrigger should be an array`);  
                } else {
                  triggerElements = trigger.value.elements;
                }
              }
      
              const foundTrigger = triggerElements.find(element => element && element.name === ref.resolved.name)
      
              if (!foundTrigger) {
                propertyMap.get(property).add(`${ref.resolved.name} missing from updateTriggers`);
              }
            });
          });

          for (const [property, set] of propertyMap.entries()) {
            for (const msg of set.values()) {
              context.report(property, msg);
            }
          }

          propertyMap.clear();
        }
        
        return {
          Program() {
            globalScope = context.getScope();
          },
          // new Layer()
          'NewExpression > Identifier'(node) {
            checkExhaustiveTriggers(node);
          },
          // new Name.Spaced.Layer()
          'NewExpression > MemberExpression > Identifier'(node) {
            checkExhaustiveTriggers(node);
          },
        };
      }
    }
  }
};
