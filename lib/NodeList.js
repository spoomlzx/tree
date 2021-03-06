"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMinimumRangeTransitionRange = getMinimumRangeTransitionRange;
exports.default = exports.MotionEntity = exports.MOTION_KEY = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var React = _interopRequireWildcard(require("react"));

var _rcVirtualList = _interopRequireDefault(require("rc-virtual-list"));

var _MotionTreeNode = _interopRequireDefault(require("./MotionTreeNode"));

var _diffUtil = require("./utils/diffUtil");

var _treeUtil = require("./utils/treeUtil");

/**
 * Handle virtual list of the TreeNodes.
 */
var HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0
};

var noop = function noop() {};

var MOTION_KEY = "RC_TREE_MOTION_".concat(Math.random());
exports.MOTION_KEY = MOTION_KEY;
var MotionNode = {
  key: MOTION_KEY
};
var MotionEntity = {
  key: MOTION_KEY,
  level: 0,
  index: 0,
  pos: '0',
  node: MotionNode
};
exports.MotionEntity = MotionEntity;
var MotionFlattenData = {
  parent: null,
  children: [],
  pos: MotionEntity.pos,
  data: MotionNode,

  /** Hold empty list here since we do not use it */
  isStart: [],
  isEnd: []
};
/**
 * We only need get visible content items to play the animation.
 */

function getMinimumRangeTransitionRange(list, height, itemHeight) {
  if (!height) {
    return list;
  }

  return list.slice(0, Math.ceil(height / itemHeight) + 1);
}

function itemKey(item) {
  var key = item.data.key,
      pos = item.pos;
  return (0, _treeUtil.getKey)(key, pos);
}

function getAccessibilityPath(item) {
  var path = String(item.data.key);
  var current = item;

  while (current.parent) {
    current = current.parent;
    path = "".concat(current.data.key, " > ").concat(path);
  }

  return path;
}

var RefNodeList = function RefNodeList(props, ref) {
  var prefixCls = props.prefixCls,
      data = props.data,
      selectable = props.selectable,
      checkable = props.checkable,
      expandedKeys = props.expandedKeys,
      selectedKeys = props.selectedKeys,
      checkedKeys = props.checkedKeys,
      loadedKeys = props.loadedKeys,
      loadingKeys = props.loadingKeys,
      halfCheckedKeys = props.halfCheckedKeys,
      keyEntities = props.keyEntities,
      disabled = props.disabled,
      dragging = props.dragging,
      dragOverNodeKey = props.dragOverNodeKey,
      dropPosition = props.dropPosition,
      motion = props.motion,
      height = props.height,
      itemHeight = props.itemHeight,
      virtual = props.virtual,
      focusable = props.focusable,
      activeItem = props.activeItem,
      focused = props.focused,
      tabIndex = props.tabIndex,
      onKeyDown = props.onKeyDown,
      onFocus = props.onFocus,
      onBlur = props.onBlur,
      onActiveChange = props.onActiveChange,
      onListChangeStart = props.onListChangeStart,
      onListChangeEnd = props.onListChangeEnd,
      domProps = (0, _objectWithoutProperties2.default)(props, ["prefixCls", "data", "selectable", "checkable", "expandedKeys", "selectedKeys", "checkedKeys", "loadedKeys", "loadingKeys", "halfCheckedKeys", "keyEntities", "disabled", "dragging", "dragOverNodeKey", "dropPosition", "motion", "height", "itemHeight", "virtual", "focusable", "activeItem", "focused", "tabIndex", "onKeyDown", "onFocus", "onBlur", "onActiveChange", "onListChangeStart", "onListChangeEnd"]); // =============================== Ref ================================

  var listRef = React.useRef(null);
  React.useImperativeHandle(ref, function () {
    return {
      scrollTo: function scrollTo(scroll) {
        listRef.current.scrollTo(scroll);
      }
    };
  }); // ============================== Motion ==============================

  var _React$useState = React.useState(false),
      _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2),
      disableVirtual = _React$useState2[0],
      setDisableVirtual = _React$useState2[1];

  var _React$useState3 = React.useState(expandedKeys),
      _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2),
      prevExpandedKeys = _React$useState4[0],
      setPrevExpandedKeys = _React$useState4[1];

  var _React$useState5 = React.useState(data),
      _React$useState6 = (0, _slicedToArray2.default)(_React$useState5, 2),
      prevData = _React$useState6[0],
      setPrevData = _React$useState6[1];

  var _React$useState7 = React.useState(data),
      _React$useState8 = (0, _slicedToArray2.default)(_React$useState7, 2),
      transitionData = _React$useState8[0],
      setTransitionData = _React$useState8[1];

  var _React$useState9 = React.useState([]),
      _React$useState10 = (0, _slicedToArray2.default)(_React$useState9, 2),
      transitionRange = _React$useState10[0],
      setTransitionRange = _React$useState10[1];

  var _React$useState11 = React.useState(null),
      _React$useState12 = (0, _slicedToArray2.default)(_React$useState11, 2),
      motionType = _React$useState12[0],
      setMotionType = _React$useState12[1];

  function onMotionEnd() {
    setPrevData(data);
    setTransitionData(data);
    setTransitionRange([]);
    setMotionType(null);
    setDisableVirtual(false);
    onListChangeEnd();
  } // Do animation if expanded keys changed


  React.useEffect(function () {
    setPrevExpandedKeys(expandedKeys);
    var diffExpanded = (0, _diffUtil.findExpandedKeys)(prevExpandedKeys, expandedKeys);

    if (diffExpanded.key !== null) {
      if (diffExpanded.add) {
        var keyIndex = prevData.findIndex(function (_ref) {
          var key = _ref.data.key;
          return key === diffExpanded.key;
        });
        if (motion) setDisableVirtual(true);
        var rangeNodes = getMinimumRangeTransitionRange((0, _diffUtil.getExpandRange)(prevData, data, diffExpanded.key), height, itemHeight);
        var newTransitionData = prevData.slice();
        newTransitionData.splice(keyIndex + 1, 0, MotionFlattenData);
        setTransitionData(newTransitionData);
        setTransitionRange(rangeNodes);
        setMotionType('show');
      } else {
        var _keyIndex = data.findIndex(function (_ref2) {
          var key = _ref2.data.key;
          return key === diffExpanded.key;
        });

        if (motion) setDisableVirtual(true);

        var _rangeNodes = getMinimumRangeTransitionRange((0, _diffUtil.getExpandRange)(data, prevData, diffExpanded.key), height, itemHeight);

        var _newTransitionData = data.slice();

        _newTransitionData.splice(_keyIndex + 1, 0, MotionFlattenData);

        setTransitionData(_newTransitionData);
        setTransitionRange(_rangeNodes);
        setMotionType('hide');
      } // Trigger when `motion` provided


      if (motion) {
        onListChangeStart();
      }
    } else if (prevData !== data) {
      // If whole data changed, we just refresh the list
      setPrevData(data);
      setTransitionData(data);
    }
  }, [expandedKeys, data]); // We should clean up motion if is changed by dragging

  React.useEffect(function () {
    if (!dragging) {
      onMotionEnd();
    }
  }, [dragging]);
  var mergedData = motion ? transitionData : data;
  var treeNodeRequiredProps = {
    expandedKeys: expandedKeys,
    selectedKeys: selectedKeys,
    loadedKeys: loadedKeys,
    loadingKeys: loadingKeys,
    checkedKeys: checkedKeys,
    halfCheckedKeys: halfCheckedKeys,
    dragOverNodeKey: dragOverNodeKey,
    dropPosition: dropPosition,
    keyEntities: keyEntities
  };
  return React.createElement(React.Fragment, null, focused && activeItem && React.createElement("span", {
    style: HIDDEN_STYLE,
    "aria-live": "assertive"
  }, getAccessibilityPath(activeItem)), React.createElement("div", {
    role: "tree"
  }, React.createElement("input", {
    style: HIDDEN_STYLE,
    disabled: focusable === false || disabled,
    tabIndex: focusable !== false ? tabIndex : null,
    onKeyDown: onKeyDown,
    onFocus: onFocus,
    onBlur: onBlur,
    value: "",
    onChange: noop
  })), React.createElement(_rcVirtualList.default, Object.assign({}, domProps, {
    disabled: disableVirtual,
    data: mergedData,
    itemKey: itemKey,
    height: height,
    fullHeight: false,
    virtual: virtual,
    itemHeight: itemHeight,
    onSkipRender: onMotionEnd,
    prefixCls: "".concat(prefixCls, "-list"),
    ref: listRef
  }), function (treeNode) {
    var pos = treeNode.pos,
        _treeNode$data = treeNode.data,
        key = _treeNode$data.key,
        restProps = (0, _objectWithoutProperties2.default)(_treeNode$data, ["key"]),
        isStart = treeNode.isStart,
        isEnd = treeNode.isEnd;
    var mergedKey = (0, _treeUtil.getKey)(key, pos);
    delete restProps.children;
    var treeNodeProps = (0, _treeUtil.getTreeNodeProps)(mergedKey, treeNodeRequiredProps);
    return React.createElement(_MotionTreeNode.default, Object.assign({}, restProps, treeNodeProps, {
      active: activeItem && key === activeItem.data.key,
      pos: pos,
      data: treeNode.data,
      isStart: isStart,
      isEnd: isEnd,
      motion: motion,
      motionNodes: key === MOTION_KEY ? transitionRange : null,
      motionType: motionType,
      onMotionEnd: onMotionEnd,
      treeNodeRequiredProps: treeNodeRequiredProps,
      onMouseMove: function onMouseMove() {
        onActiveChange(null);
      }
    }));
  }));
};

var NodeList = React.forwardRef(RefNodeList);
NodeList.displayName = 'NodeList';
var _default = NodeList;
exports.default = _default;