import { Braces, Check, Hash, Type, type LucideProps } from "lucide-react";
import React, { useMemo, type RefAttributes } from "react";

type NodeResult = {
  icon: React.FC<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  value: any;
  type: string;
  path: string;
};

const typeToIconMap: Record<string, React.FC> = {
  string: Type,
  number: Hash,
  boolean: Check,
  object: Braces,
};

const createVarEntry = (path: string, value: any): NodeResult => {
  const type = typeof value;
  return {
    path,
    value,
    type,
    icon: typeToIconMap[type] || Braces,
  };
};

const convertToVars = (results: any[]): Record<string, any> => {
  const varsToReturn: Record<string, any> = {};

  const processValue = (
    path: string,
    value: any,
    isNested: boolean = false,
  ): any => {
    const isArray = Array.isArray(value);
    const isObject = value !== null && typeof value === "object" && !isArray;

    if (isArray) {
      const arrayResult: Record<string, any> = {};
      value.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        const key = isNested
          ? path.split("[").pop()?.replace("]", "") + `[${index}]`
          : itemPath;
        const processed = processValue(itemPath, item, true);
        const itemIsObject =
          item !== null &&
          typeof item === "object" &&
          Object.keys(item).length > 0;

        if (itemIsObject) {
          arrayResult[key] = {
            path: itemPath,
            value: processed,
            type: "object",
            icon: Braces,
          };
        } else {
          arrayResult[key] = processed;
        }
      });
      return arrayResult;
    } else if (isObject) {
      if (Object.keys(value).length === 0) {
        return {};
      }
      const objectResult: Record<string, any> = {};
      Object.entries(value).forEach(([objKey, objValue]) => {
        const objPath = `${path}.${objKey}`;
        const processed = processValue(objPath, objValue, isNested);
        const valueIsObject =
          objValue !== null &&
          typeof objValue === "object" &&
          Object.keys(objValue).length > 0;

        if (isNested) {
          if (valueIsObject) {
            objectResult[objKey] = {
              path: objPath,
              value: processed,
              type: "object",
              icon: Braces,
            };
          } else {
            objectResult[objKey] = processed;
          }
        } else if (valueIsObject) {
          objectResult[objKey] = {
            path: objPath,
            value: processed,
            type: "object",
            icon: Braces,
          };
        } else {
          objectResult[objKey] = createVarEntry(objPath, objValue);
        }
      });
      return objectResult;
    } else {
      return createVarEntry(path, value);
    }
  };

  results.forEach((result) => {
    Object.entries(result).forEach(([key, value]) => {
      if (
        value !== null &&
        typeof value === "object" &&
        Object.keys(value).length > 0
      ) {
        varsToReturn[key] = createVarEntry(
          key,
          processValue(key, value, false),
        );
      } else {
        varsToReturn[key] = createVarEntry(key, value);
      }
    });
  });

  return varsToReturn;
};

export const useNodeResult = (actionResults?: any[]) => {
  const actionVars = useMemo(() => {
    if (!actionResults) return {};
    return convertToVars(actionResults);
  }, [actionResults]);

  return {
    actionResults: actionResults || [],
    actionVars,
    convertToVars,
  };
};
