export function collectImports(obj: Record<string, any>) {
  const {
    componentName,
    componentsMap,
    importsMap,
    dependenceList,
    components,
  } = obj;
  // ignore the empty string
  if (!componentName) {
    return;
  }

  const component = componentsMap[componentName];
  if (!component) {
    return;
  }
  const objSets = importsMap.get(component.packageName);

  if (!objSets) {
    const set = new Set();
    set.add(component);
    importsMap.set(component.packageName, set);
  } else {
    objSets.add(component);
  }
  components.add(componentName);

  if (
    !dependenceList.find(
      (i: Record<string, any>) => i.package === component.packageName
    )
  ) {
    dependenceList.push({
      package: component.packageName,
      version: component.dependenceVersion || '*',
    });
  }
}

/**
 * construct the import string
 */
interface ImportsMap {
  [key: string]: Set<Record<string, any>>;
}
export const importString = (
  importsMap: Map<string, Set<Record<string, any>>>
) => {
  const importStrings: string[] = [];
  const subImports: string[] = [];
  for (const [packageName, pkgSet] of importsMap) {
    const set1 = new Set(),
      set2 = new Set();
    for (const pkg of pkgSet) {
      let exportName = pkg.exportName;
      let subName = pkg.subName;
      let componentName = pkg.name;

      if (pkg.subName) {
        subImports.push(`const ${componentName} = ${exportName}.${subName};`);
      }
      if (!exportName) {
        exportName = componentName;
      }
      if (componentName !== exportName && !pkg.subName) {
        exportName = `${exportName} as ${componentName}`;
      }
      if (pkg.dependence && pkg.dependence.destructuring) {
        set2.add(exportName);
      } else {
        set1.add(exportName);
      }
    }
    const set1Str = [...set1].join(',');
    let set2Str = [...set2].join(',');
    const dot = set1Str && set2Str ? ',' : '';
    if (set2Str) {
      set2Str = `{${set2Str}}`;
    }
    importStrings.push(
      `import ${set1Str} ${dot} ${set2Str} from '${packageName}'`
    );
  }
  return importStrings.concat(subImports);
};

export const transComponentsMap = (insComponentsMap: Record<string, any>) => {
  let list: Record<string, any>[] = [];
  if (insComponentsMap && Array.isArray(insComponentsMap.list)) {
    list = list.concat(insComponentsMap.list);
    for (let list_item of insComponentsMap.list) {
      if (list_item.children && Array.isArray(list_item.children)) {
        list = list.concat(list_item.children);
      }
    }
  }

  return list.reduce((obj, comp) => {
    const componentName = comp.name;
    const componentAlias = comp.name_alias;
    if (!obj[componentName] || (componentAlias && !obj[componentAlias])) {
      if (comp.dependence) {
        try {
          let dependence =
            typeof comp.dependence === 'string'
              ? JSON.parse(comp.dependence)
              : comp.dependence;
          if (dependence) {
            comp.packageName = dependence.package;
          }
          if (!comp.dependenceVersion) {
            comp.dependenceVersion = '*';
          }
          comp.exportName = dependence.export_name;
          comp.subName = dependence.sub_name;
          if (/^\d/.test(comp.dependenceVersion)) {
            comp.dependenceVersion = '^' + comp.dependenceVersion;
          }
        } catch (e) {
          console.log(e);
        }
      }

      obj[componentName] = comp;
      obj[componentAlias] = comp;
    }
    return obj;
  }, {});
};

export const handleField = (compData, originalData) => {
  const { text = [] } = originalData;
  compData.props.label = text[0] || '文本';
  compData.props.placeholder = text[1] || '这里是输入框';
};

export const renderDefaultComps = (renderComps: Record<string, any>) => {
  const { children, componentsMap, importsMap, dependenceList, components } =
    renderComps;
  let xml = '';
  for (let child of children) {
    collectImports({
      componentName: child.name,
      componentsMap,
      importsMap,
      dependenceList,
      components,
    });
    let props = ``;
    if (child.props) {
      props = Object.keys(child.props)
        .map((key) => {
          return `${key}="${child.props[key]}"`;
        })
        .join(' ');
    }
    xml += `<${child.name} ${props} />`;
  }
  return xml;
};
