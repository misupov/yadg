export type Measurer<T> = (item: T) => number;
export type ItemInfo<T> = {
  index: number;
  length: number;
  innerDistance: number;
  outerDistance: number;
  item: T;
};
export type DistanceList<T> = {
  insert(index: number, item: T): boolean;
  append(item: T): void;
  deleteByIndex(index: number): boolean;
  deleteByDistance(distance: number): boolean;
  invalidateLength(index: number): boolean;
  getByIndex(index: number): ItemInfo<T> | undefined;
  getByDistance(distance: number): ItemInfo<T> | undefined;
  size(): number;
  totalLength(): number;
};

type Node<T> = {
  parent?: Node<T>;
  left?: Node<T>;
  right?: Node<T>;
  height: number;
  treeSize: number;
  treeLength?: number;
  length?: number;
  item: T;
};

function $getTreeSize(node?: Node<unknown>) {
  return node ? node.treeSize : 0;
}

function $setTreeSize<T>(node: Node<T>, size: number) {
  node.treeSize = size;
}

function $getHeight(node: Node<unknown>) {
  return Math.max(node.left?.height ?? 0, node.right?.height ?? 0) + 1;
}

function $getBalance(node: Node<unknown>) {
  return (node.left?.height ?? 0) - (node.right?.height ?? 0);
}

function $ensureNodeLength<T>(node: Node<T>, measurer: Measurer<T>): number {
  let { length } = node;
  if (length) return length;
  node.length = length = measurer(node.item);
  return length;
}

function $ensureTreeLength<T>(node: Node<T>, measurer: Measurer<T>): number {
  let { treeLength } = node;
  if (treeLength) return treeLength;
  node.length = treeLength = measurer(node.item);
  if (node.left) {
    treeLength += $ensureTreeLength(node.left, measurer);
  }
  if (node.right) {
    treeLength += $ensureTreeLength(node.right, measurer);
  }
  node.treeLength = treeLength;
  return treeLength;
}

function $findNodeByIndex<T>(node: Node<T>, index: number): Node<T> | undefined {
  if (!node.left) {
    if (index === 0) return node;
    if (!node.right) return undefined;
    return $findNodeByIndex(node.right, index - 1);
  }
  const leftSubTreeSize = $getTreeSize(node.left);
  if (index < leftSubTreeSize) return $findNodeByIndex(node.left, index);
  index -= leftSubTreeSize;
  if (index === 0) return node;
  if (!node.right) return undefined;
  index--;
  return $findNodeByIndex(node.right, index);
}

function $findNodeByDistance<T>(node: Node<T>, distance: number, measurer: Measurer<T>): Node<T> | undefined {
  const length = $ensureNodeLength(node, measurer);
  if (!node.left) {
    if (distance < length) return node;
    if (!node.right) return undefined;
    return $findNodeByDistance(node.right, distance - length, measurer);
  }
  const leftSubTreeLength = $ensureTreeLength(node.left, measurer);
  if (distance < leftSubTreeLength) {
    return $findNodeByDistance(node.left, distance, measurer);
  }
  distance -= leftSubTreeLength;
  if (distance < length) return node;
  if (!node.right) return undefined;
  distance -= length;
  return $findNodeByDistance(node.right, distance, measurer);
}

function $rotateLeftLeft<T>(node: Node<T>): Node<T> {
  /*
         z                                      y
        / \                                   /   \
       y   T4      Right Rotate (z)          x      z
      / \          - - - - - - - - ->      /  \    /  \
     x   T3                               T1  T2  T3  T4
    / \
  T1   T2
  */

  const z = node;
  const y = z.left!;
  z.left = y.right;
  y.right = z;
  y.parent = node.parent;
  z.parent = y;
  return y;
}

function $rotateLeftRight<T>(node: Node<T>): Node<T> {
  /*
       z                               z                           x
      / \                            /   \                        /  \
     y   T4  Left Rotate (y)        x    T4  Right Rotate(z)    y      z
    / \      - - - - - - - - ->    /  \      - - - - - - - ->  / \    / \
  T1   x                          y    T3                    T1  T2 T3  T4
      / \                        / \
    T2   T3                    T1   T2
  */

  const z = node;
  const y = z.left!;
  const x = y.right!;
  y.right = x.left;
  z.left = x.right;
  x.right = z;
  x.parent = node.parent;
  z.parent = x;
  return x;
}

function $rotateRightRight<T>(node: Node<T>): Node<T> {
  /*
    z                                y
   /  \                            /   \
  T1   y     Left Rotate(z)       z      x
      /  \   - - - - - - - ->    / \    / \
     T2   x                     T1  T2 T3  T4
         / \
       T3  T4
  */
  const z = node;
  const y = z.right!;
  z.right = y.left;
  y.left = z;
  y.parent = node.parent;
  z.parent = y;
  return y;
}

function $rotateRightLeft<T>(node: Node<T>): Node<T> {
  /*
     z                            z                            x
    / \                          / \                          /  \
  T1   y   Right Rotate (y)    T1   x      Left Rotate(z)   z      y
      / \  - - - - - - - - ->     /  \   - - - - - - - ->  / \    / \
     x   T4                      T2   y                  T1  T2  T3  T4
    / \                              /  \
  T2   T3                           T3   T4
  */
  const z = node;
  const y = z.right!;
  const x = y.left!;
  y.left = x.right;
  z.right = x.left;
  x.left = z;
  x.parent = node.parent;
  z.parent = x;
  return x;
}

function $balance<T>(node: Node<T>, sizeDelta: number): Node<T> {
  let n = node;
  while (n) {
    n.length = undefined;
    n.treeLength = undefined;
    n.height = $getHeight(n);
    $setTreeSize(n, $getTreeSize(n) + sizeDelta);
    const balance = $getBalance(n);
    switch (balance) {
      case 2:
        n = $rotateRightRight(n);
        break;
      case 1:
        n = $rotateRightLeft(n);
        break;
      case -1:
        n = $rotateLeftRight(n);
        break;
      case -2:
        n = $rotateLeftLeft(n);
        break;
    }

    if (!n.parent) return n;
    n = n.parent;
  }
  return node;
}

function $insertItem<T>(node: Node<T>, index: number, item: T): Node<T> {
  if (!node.left) {
    if (index === 0) {
      node.left = { item, parent: node, treeSize: 1, height: 1 };
      return $balance(node, +1);
    }
    if (!node.right) {
      node.right = { item, parent: node, treeSize: 1, height: 1 };
      return $balance(node, +1);
    }
    return $insertItem(node.right, index - 1, item);
  }
  const leftSubTreeSize = $getTreeSize(node.left);
  if (leftSubTreeSize <= index) {
    return $insertItem(node.left, index, item);
  }
  if (!node.right) {
    node.right = { item, parent: node, treeSize: 1, height: 1 };
    return $balance(node, +1);
  }
  index -= leftSubTreeSize;
  return $insertItem(node.right, index, item);
}

function $deleteNode<T>(node: Node<T>): Node<T> | undefined {
  return node;
}

function $getItemInfoByIndex<T>(node: Node<T>, index: number, measurer: Measurer<T>, result: Partial<ItemInfo<T>>): ItemInfo<T> | undefined {
  if (!node.left) {
    if (index === 0) {
      result.index = 0;
      result.innerDistance = 0;
      result.outerDistance = 0;
      result.item = node.item;
      result.length = $ensureNodeLength(node, measurer);
      return result as ItemInfo<T>;
    }
    if (!node.right) return undefined;
    const info = $getItemInfoByIndex(node.right, index - 1, measurer, result);
    if (!info) return undefined;
    info.index++;
    info.outerDistance += $ensureNodeLength(node, measurer);
    return info;
  }
  const leftSubTreeSize = $getTreeSize(node.left);
  if (index < leftSubTreeSize) {
    return $getItemInfoByIndex(node.left, index, measurer, result);
  }
  if (index === leftSubTreeSize) {
    result.index = index;
    result.innerDistance = 0;
    result.outerDistance = $ensureTreeLength(node.left, measurer);
    result.length = $ensureNodeLength(node, measurer);
    return result as ItemInfo<T>;
  }
  if (!node.right) return undefined;
  const info = $getItemInfoByIndex(node.right, index - leftSubTreeSize - 1, measurer, result);
  if (!info) return undefined;
  info.index += leftSubTreeSize + 1;
  info.outerDistance += $ensureTreeLength(node.left, measurer) + $ensureNodeLength(node, measurer);
  return info;
}

function $getItemInfoByDistance<T>(node: Node<T>, distance: number, measurer: Measurer<T>, result: Partial<ItemInfo<T>>): ItemInfo<T> | undefined {
  const length = $ensureNodeLength(node, measurer);
  if (!node.left) {
    if (distance < length) {
      result.index = 0;
      result.innerDistance = distance;
      result.outerDistance = 0;
      result.item = node.item;
      result.length = length;
      return result as ItemInfo<T>;
    }
    if (!node.right) return undefined;
    const info = $getItemInfoByDistance(node.right, distance - length, measurer, result);
    if (!info) return undefined;
    info.index++;
    info.outerDistance += $ensureNodeLength(node, measurer);
    return info;
  }
  const leftSubTreeLength = $ensureTreeLength(node.left, measurer);
  if (distance < leftSubTreeLength) {
    return $getItemInfoByDistance(node.left, distance, measurer, result);
  }
  if (distance < leftSubTreeLength + length) {
    result.index = $getTreeSize(node.left) + 1;
    result.innerDistance = distance - leftSubTreeLength;
    result.outerDistance = leftSubTreeLength;
    result.length = $ensureNodeLength(node, measurer);
    return result as ItemInfo<T>;
  }
  if (!node.right) return undefined;
  const info = $getItemInfoByDistance(node.right, distance - leftSubTreeLength - length, measurer, result);
  if (!info) return undefined;
  info.index += $getTreeSize(node.left) + 1;
  info.outerDistance += leftSubTreeLength + length;
  return info;
}

function $invalidateLength(node: Node<unknown> | undefined) {
  while (node) {
    node.length = undefined;
    node.treeLength = undefined;
    node = node.parent;
  }
}

export function distanceList<T>(measurer: Measurer<T>): DistanceList<T> {
  let root: Node<T> | undefined;
  const insert = (index: number, item: T) => {
    if (!(index <= $getTreeSize(root))) return false; // ! is for NaN
    if (!root) {
      root = { treeSize: 1, item, height: 1 };
    } else {
      root = $insertItem(root, index, item);
    }
    return true;
  };
  const append = (item: T) => {
    insert($getTreeSize(root), item);
  };
  const deleteByIndex = (index: number) => {
    if (!root) return false;
    const node = $findNodeByIndex(root, index);
    if (node) {
      root = $deleteNode(node);
      return true;
    }
    return false;
  };
  const deleteByDistance = (distance: number) => {
    if (!root) return false;
    const node = $findNodeByDistance(root, distance, measurer);
    if (node) {
      $deleteNode(node);
      return true;
    }
    return false;
  };
  const invalidateLength = (index: number) => {
    if (!root) return false;
    const node = $findNodeByIndex(root, index);
    if (node) {
      $invalidateLength(node);
      return true;
    }
    return false;
  };
  const getByIndex = (index: number): ItemInfo<T> | undefined => {
    if (!root) return undefined;
    if (index >= 0) {
      // handling NaN index
      const res: Partial<ItemInfo<T>> = {};
      return $getItemInfoByIndex(root, index, measurer, res);
    }
    return undefined;
  };
  const getByDistance = (distance: number): ItemInfo<T> | undefined => {
    if (!root) return undefined;
    if (distance >= 0) {
      // handling NaN distance
      const res: Partial<ItemInfo<T>> = {};
      return $getItemInfoByDistance(root, distance, measurer, res);
    }
    return undefined;
  };
  const size = () => $getTreeSize(root);
  const totalLength = () => {
    if (!root) return 0;
    return $ensureTreeLength(root, measurer);
  };
  return {
    insert,
    append,
    deleteByIndex,
    deleteByDistance,
    invalidateLength,
    getByIndex,
    getByDistance,
    size,
    totalLength,
  };
}

const list1 = distanceList<number>((n) => n);
list1.insert(0, 5);
list1.insert(0, 10);
list1.size() === 2;
list1.totalLength() === 15;
const info = list1.getByDistance(10);
info?.item === 10;
info?.outerDistance === 5;

const list2 = distanceList<string>((s) => s.length);
list2.append("Hello");
list2.append(" ");
list2.append("World");
list2.append("!");
list2.size() === 4;
list2.totalLength() === 12;
