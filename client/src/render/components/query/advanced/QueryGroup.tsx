import { FilterRule } from "./Rule";
import { ConnectorDetails, Group, Node } from "../../../../models/filter";
import { RuleType, Rule } from "../../../../models/rules";
import { Connector } from "./Connector";
import React, { useEffect, useState } from "react";
import { nanoid } from 'nanoid';
import { cloneDeep } from "lodash";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { stringToColor } from "@davidcmeier/string-to-color";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

interface PropTypes {
  group: Group;
  id: string;
  updateParent: (group: Group, id: string) => void;
}

const defaultRule = {
  id: nanoid(),
  rule: {
    type: RuleType.STATUS,
    value: "ranked",
    operator: "=",
    field: "Approved",
  },
};

const defaultGroup = {
  id: nanoid(),
  group: {
    connector: {
      type: "AND",
      not: [],
    },
    children: [],
  },
};

export const QueryGroup = ({ group, id, updateParent }: PropTypes) => {
  const updateGroup = (child: Group | Rule, childId: string) => {
    updateParent({
      ...group,
      children: group.children.map((node) => {
        if (node.id === childId) {
          if ("children" in child) {
            return { ...node, group: child };
          } else {
            return { ...node, rule: child };
          }
        }
        return node;
      }),
    }, id);
  };

  const updateConnector = (connector: ConnectorDetails) => {
    updateParent({
      ...group,
      connector,
    }, id);
  };

  const getLastRule = () => {
    const lastRule = group.children.filter((node) => "rule" in node).pop();
    if (lastRule) {
      return lastRule;
    }
    return defaultRule;
  };

  const addChild = (child: Node) => {
    child.id = nanoid();
    if (child.group) {
      const rule = cloneDeep(defaultRule);
      rule.id = nanoid();
      child.group.children.push(rule);
    }

    updateParent({
      ...group,
      children: [...group.children, child],
    }, id);
  };

  const removeChild = (childId: string) => {
    updateParent({
      ...group,
      children: group.children.filter((node) => node.id !== childId),
    }, id);
  };

  return (
    <div className="flex w-full">
      <div style={{ backgroundColor: stringToColor(id) }} className="w-2" />
      <div className="p-4 rounded-l-none border-gray-300 dark:border-monokai-border dark:border-2 dark:border-l-0 border-l-0 border rounded flex items-stretch w-full">
        <div className="flex flex-col">
          {group.children.map((child, index) => (
            <div key={child.id}>
              {index == 0 ? null : (
                <Connector id={child.id} details={group.connector} update={updateConnector} />
              )}
              {child.group ? (
                <div className="flex">
                  <QueryGroup
                    group={child.group}
                    id={child.id}
                    updateParent={(child, id) => updateGroup(child, id)}
                  />
                  <RemoveCircleIcon
                    onClick={() => removeChild(child.id)}
                    className="text-red-600 hover:text-red-700 hover:cursor-pointer rounded -ml-5 -mt-4 bg-white dark:bg-monokai-dark"
                    fontSize="large"
                  />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <FilterRule
                    rule={child?.rule??null}
                    id={child.id}
                    updateParent={(rule, id) => updateGroup(rule, id)}
                  />
                  {(id != "root" || index != 0) && (
                    <CancelOutlinedIcon
                      onClick={() => removeChild(child.id)}
                      className="text-gray-400 dark:text-red-500 dark:hover:text-red-600 hover:cursor-pointer hover:text-red-500"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => addChild(cloneDeep(getLastRule()))}
              className="dark:text-white border-blue-600 text-gray-600 border-2 rounded px-2 py-1 hover:bg-blue-600 hover:text-white font-medium transition duration-150"
            >
              + Add Rule
            </button>
            <button
              onClick={() => addChild(cloneDeep(defaultGroup))}
              className="dark:text-white border-blue-600 text-gray-600 border-2 rounded px-2 py-1 hover:bg-blue-600 hover:text-white font-medium transition duration-150"
            >
              + Add Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
