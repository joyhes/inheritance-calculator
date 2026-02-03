import React from 'react';
import { Person } from '../types';

interface FamilyTreeProps {
  people: Person[];
  collapsed: Set<number>;
  toggleNode: (id: number) => void;
  onEdit: (id: number) => void;
  onAddChild: (id: number) => void;
  onAddSpouse: (id: number) => void;
  onAddParent: (id: number) => void;
  onDelete: (id: number) => void;
}

// 精緻線條圖示
const Icons = {
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ChevronRight: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Link: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
};

const FamilyTree: React.FC<FamilyTreeProps> = ({
  people,
  collapsed,
  toggleNode,
  onEdit,
  onAddChild,
  onAddSpouse,
  onAddParent,
  onDelete,
}) => {

  const getVisualChildren = (p: Person) => {
    return people.filter(c => {
      if (c.parents.includes(p.id)) return true;
      if (p.spouseId && c.parents.includes(p.spouseId)) return true;
      return false;
    });
  };

  const roots = people.filter(p => {
    const hasParentsInSystem = p.parents.some(pid => people.some(x => x.id === pid));
    if (hasParentsInSystem) return false;
    if (p.spouseId) {
      const sp = people.find(s => s.id === p.spouseId);
      if (sp) {
        const spHasParents = sp.parents.some(pid => people.some(x => x.id === pid));
        if (spHasParents) return false;
        if (p.id > sp.id) return false;
      }
    }
    return true;
  });

  const renderNode = (p: Person, level: number, visited: Set<number>) => {
    if (visited.has(p.id)) return null;
    visited.add(p.id);
    if (p.spouseId) visited.add(p.spouseId);

    const children = getVisualChildren(p);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsed.has(p.id);

    let spouseNode = null;
    if (p.spouseId) {
      const sp = people.find(x => x.id === p.spouseId);
      if (sp) {
        const isDivorced = p.divorceDate || sp.divorceDate;
        const isDead = !!sp.deathDate;

        // 配偶區塊：優化佈局防止破圖
        spouseNode = (
          <div className={`ml-4 flex items-center transition-all group ${isDivorced ? 'opacity-40' : ''}`}>
            {/* 連結線圖示 */}
            <div className="w-6 flex justify-center text-morandi-brown/20 shrink-0">
              <Icons.Link />
            </div>

            <div className={`flex items-center gap-3 p-2.5 px-4 rounded-xl border ${isDivorced ? 'border-morandi-oat/50 bg-morandi-oat/10' : 'border-morandi-sage/30 bg-morandi-sage/5'} shadow-sm ml-2`}>
              {/* 姓名區域 */}
              <div className="flex flex-col justify-center min-w-[120px] max-w-[160px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-black text-[16px] text-morandi-brown-dark cursor-pointer hover:text-morandi-brown transition-colors tracking-tight truncate leading-tight ${isDivorced ? 'line-through' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onEdit(sp.id); }}
                  >
                    {sp.name}
                  </span>
                  {!isDivorced && (
                    <span className="text-[10px] font-black bg-morandi-sage/80 text-white px-1.5 py-0.5 rounded-md inline-flex items-center">
                      配偶
                    </span>
                  )}
                </div>
                {sp.deathDate && (
                  <span className="text-[12px] font-bold text-morandi-brown/50 mt-1 tracking-tighter">
                    歿 {(() => {
                      const d = new Date(sp.deathDate!);
                      return `${d.getFullYear() - 1911}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                    })()}
                  </span>
                )}
              </div>

              {/* 狀態標籤 */}
              <div className="shrink-0">
                {isDead ? (
                  <span className="px-2 py-0.5 text-[13px] font-black text-morandi-brown/50 bg-morandi-oat/50 rounded-lg border border-black/5">已歿</span>
                ) : isDivorced ? (
                  <span className="px-2 py-0.5 text-[13px] font-black text-morandi-brown/30 bg-gray-100 rounded-lg">離婚</span>
                ) : (
                  <span className="px-2 py-0.5 text-[13px] font-black text-white bg-morandi-sage rounded-lg shadow-sm">健在</span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(sp.id); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-stone-300 hover:text-morandi-brown opacity-0 group-hover:opacity-100 transition-all ml-1 shadow-sm border border-transparent hover:border-morandi-oat"
              >
                <Icons.Edit />
              </button>
            </div>
          </div>
        );
      }
    }

    const isDead = !!p.deathDate;

    return (
      <React.Fragment key={p.id}>
        {/* 卡片本體：完全無邊框，僅用縮排表示層級 */}
        <div className="group relative flex items-center mb-3 transition-all duration-300">
          <div className="flex-1 flex items-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-2.5 pr-4 transition-all border border-transparent hover:border-morandi-oat">

            {/* 層級指示區 */}
            <div className="flex items-center shrink-0" style={{ width: '180px' }}>
              <div style={{ width: `${level * 20}px` }} className="shrink-0" />

              <div className="w-8 flex justify-center">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleNode(p.id); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-morandi-oat hover:bg-morandi-brown/10 text-morandi-brown transition-colors"
                  >
                    {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                  </button>
                ) : null}
              </div>

              <span className="text-[14px] font-black text-morandi-brown/40 bg-[#f7f7f5] px-2 py-0.5 rounded-lg border border-black/5 whitespace-nowrap ml-1">
                第{level + 1}代
              </span>
            </div>

            {/* 姓名區域：固定對齊 */}
            <div className="w-44 shrink-0 ml-4 flex flex-col justify-center">
              <span
                className="font-black text-[16px] text-morandi-brown-dark cursor-pointer hover:text-morandi-brown transition-colors tracking-tight truncate block leading-tight"
                onClick={() => onEdit(p.id)}
              >
                {p.name}
              </span>
              {p.deathDate && (
                <span className="text-[14px] font-black text-morandi-brown/60 mt-0.5 tracking-tighter">
                  歿 {(() => {
                    const d = new Date(p.deathDate);
                    return `民國 ${d.getFullYear() - 1911}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                  })()}
                </span>
              )}
            </div>

            {/* 狀態標籤 */}
            <div className="w-20 shrink-0">
              {isDead ? (
                <span className="px-2 py-1 text-[14px] font-black text-morandi-brown/60 bg-[#ececec] rounded-lg border border-black/5">已歿</span>
              ) : (
                <span className="px-2 py-1 text-[14px] font-black text-white bg-[#7a8f6a] rounded-lg shadow-sm">健在</span>
              )}
            </div>

            {/* 配偶膠囊 */}
            <div className="flex-1 flex items-center overflow-hidden">
              {spouseNode}
            </div>

            {/* 操作區 */}
            <div className="ml-auto flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
              <ActionBtn label="+配偶" onClick={(e) => { e.stopPropagation(); onAddSpouse(p.id); }} primary />
              <ActionBtn label="+子女" onClick={(e) => { e.stopPropagation(); onAddChild(p.id); }} />
              <ActionBtn label="+父母" onClick={(e) => { e.stopPropagation(); onAddParent(p.id); }} />
              <div className="w-px h-6 bg-gray-100 mx-1"></div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex flex-col animate-fade-up relative">
            {children.map(child => renderNode(child, level + 1, visited))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const visited = new Set<number>();

  if (people.length === 0) {
    return (
      <div className="text-center py-24 bg-[#f9f8f6] rounded-[2rem] border border-dashed border-morandi-brown/10">
        <div className="text-morandi-brown/20 mb-4 flex justify-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </div>
        <p className="text-morandi-brown text-[16px] font-black opacity-60">尚未建立家族成員</p>
        <p className="text-[14px] text-morandi-brown/40 mt-2 font-black">請從右上方「新增第一代成員」開始</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {roots.map(root => renderNode(root, 0, visited))}
    </div>
  );
};

const ActionBtn: React.FC<{ label: string, onClick: (e: React.MouseEvent) => void, primary?: boolean }> = ({ label, onClick, primary }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 text-[14px] rounded-full transition-all font-black ${primary
      ? 'bg-morandi-brown text-white hover:bg-morandi-brown-dark shadow-sm hover:shadow-md'
      : 'bg-white text-morandi-brown border border-transparent hover:bg-morandi-oat'
      }`}
  >
    {label}
  </button>
);

export default FamilyTree;