import React, { useEffect, useMemo, useState } from 'react';
import { findCategoryPathById } from '../../utils/shop';
import './CategoryTree.css';

const LEVEL_LABELS = ['گروه اصلی', 'زیرگروه', 'زیرشاخه', 'سطح بعد'];

const countDescendants = (node) => {
    const kids = node.children || [];
    return kids.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
};

const levelLabel = (depth) => LEVEL_LABELS[Math.min(depth, LEVEL_LABELS.length - 1)];

export const categoryPathText = (tree, id) => {
    if (!id) return 'گروه اصلی';
    const path = findCategoryPathById(tree, id);
    return path.length ? path.map((item) => item.name).join(' ← ') : 'گروه اصلی';
};

export const CategoryParentCascade = ({ tree = [], value, onChange }) => {
    const path = useMemo(() => findCategoryPathById(tree, value), [tree, value]);
    const levels = [{ options: tree || [], selected: path[0] || null }];
    path.forEach((node, index) => {
        const kids = node.children || [];
        if (kids.length) {
            levels.push({ options: kids, selected: path[index + 1] || null });
        }
    });

    return (
        <div className="cat-cascade">
            {levels.map((level, index) => (
                <label key={`level-${index}`}>
                    {index === 0 ? 'قرارگیری در درخت' : levelLabel(index)}
                    <select
                        value={
                            level.selected
                                ? String(level.selected.id)
                                : index === 0
                                    ? ''
                                    : 'THIS'
                        }
                        onChange={(e) => {
                            const next = e.target.value;
                            if (index === 0 && next === '') {
                                onChange('');
                                return;
                            }
                            if (next === 'THIS') {
                                onChange(String(path[index - 1].id));
                                return;
                            }
                            onChange(next);
                        }}
                    >
                        {index === 0 && <option value="">گروه اصلی — بالاترین سطح</option>}
                        {index > 0 && (
                            <option value="THIS">
                                همین «{path[index - 1].name}» — زیرگروه جدید اینجا ساخته شود
                            </option>
                        )}
                        {level.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name}
                                {(opt.children || []).length ? ` (${opt.children.length} زیرگروه)` : ''}
                            </option>
                        ))}
                    </select>
                </label>
            ))}
            <p className="cat-cascade-preview">
                {value
                    ? `این مورد زیرگروه «${categoryPathText(tree, value)}» می‌شود.`
                    : 'این مورد به‌عنوان گروه اصلی (ریشه) ثبت می‌شود.'}
            </p>
        </div>
    );
};

const TreeNode = ({
    node,
    depth,
    parentName,
    collapsed,
    onToggle,
    onDelete,
    onAddChild
}) => {
    const children = node.children || [];
    const hasKids = children.length > 0;
    const open = hasKids && !collapsed.has(String(node.id));
    const descendants = countDescendants(node);

    return (
        <div className={`cat-tree-node depth-${Math.min(depth, 4)}`}>
            <div className="cat-tree-row">
                {hasKids ? (
                    <button
                        type="button"
                        className="cat-tree-toggle"
                        aria-expanded={open}
                        aria-label={open ? 'بستن زیرگروه‌ها' : 'باز کردن زیرگروه‌ها'}
                        onClick={() => onToggle(node.id)}
                    >
                        {open ? '▾' : '▸'}
                    </button>
                ) : (
                    <span className="cat-tree-toggle is-leaf" aria-hidden="true">•</span>
                )}
                <div className="cat-tree-main">
                    <strong>{node.name}</strong>
                    <span className="cat-tree-meta">
                        <span className="cat-tree-badge">{levelLabel(depth)}</span>
                        {parentName ? <span>زیرمجموعهٔ {parentName}</span> : null}
                        {hasKids ? <span>{children.length} زیرگروه مستقیم · {descendants} در کل</span> : <span>بدون زیرگروه</span>}
                    </span>
                </div>
                <div className="cat-tree-actions">
                    {onAddChild && (
                        <button type="button" className="cat-tree-add" onClick={() => onAddChild(node.id)}>
                            افزودن زیرگروه
                        </button>
                    )}
                    {onDelete && (
                        <button type="button" className="btn-delete" onClick={() => onDelete(node.id)}>
                            حذف
                        </button>
                    )}
                </div>
            </div>
            {open && (
                <div className="cat-tree-children">
                    {children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            parentName={node.name}
                            collapsed={collapsed}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const collectParentIds = (nodes, acc = new Set()) => {
    (nodes || []).forEach((node) => {
        if ((node.children || []).length) {
            acc.add(String(node.id));
            collectParentIds(node.children, acc);
        }
    });
    return acc;
};

const CategoryTree = ({
    tree = [],
    onDelete,
    onAddChild,
    emptyText = 'هنوز گروهی ثبت نشده است.'
}) => {
    const [collapsed, setCollapsed] = useState(() => new Set());
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && tree.length) {
            setCollapsed(collectParentIds(tree));
            setInitialized(true);
        }
    }, [tree, initialized]);

    const toggle = (id) => {
        const key = String(id);
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const collapseAll = () => {
        const ids = new Set();
        const walk = (nodes) => {
            (nodes || []).forEach((node) => {
                if ((node.children || []).length) ids.add(String(node.id));
                walk(node.children);
            });
        };
        walk(tree);
        setCollapsed(ids);
    };

    if (!tree.length) {
        return <p className="cat-tree-empty">{emptyText}</p>;
    }

    return (
        <div className="cat-tree">
            <div className="cat-tree-toolbar">
                <button type="button" onClick={() => setCollapsed(new Set())}>باز کردن همه</button>
                <button type="button" onClick={collapseAll}>بستن همهٔ زیرگروه‌ها</button>
            </div>
            {tree.map((node) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    parentName=""
                    collapsed={collapsed}
                    onToggle={toggle}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                />
            ))}
        </div>
    );
};

export default CategoryTree;
