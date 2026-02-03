import React, { useState, useEffect } from 'react';
import { Person, ModalMode } from '../types';

interface PersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    mode: ModalMode;
    refId: number | null;
    people: Person[];
    editId: number | null;
    waiverTargets?: { id: number, name: string, isWaived: boolean }[];
}

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const PersonModal: React.FC<PersonModalProps> = ({
    isOpen, onClose, onSave, mode, refId, people, editId, waiverTargets = []
}) => {
    const [name, setName] = useState("");
    const [isDead, setIsDead] = useState(false);
    const [deathDateType, setDeathDateType] = useState('roc');
    const [deathY, setDeathY] = useState("");
    const [deathM, setDeathM] = useState("");
    const [deathD, setDeathD] = useState("");
    const [deathGreg, setDeathGreg] = useState("");

    const [isDivorced, setIsDivorced] = useState(false);
    const [divDateType, setDivDateType] = useState('roc');
    const [divY, setDivY] = useState("");
    const [divM, setDivM] = useState("");
    const [divD, setDivD] = useState("");
    const [divGreg, setDivGreg] = useState("");

    const [parentSource, setParentSource] = useState('current');
    const [newParentName, setNewParentName] = useState("");

    const [editP1, setEditP1] = useState<string>("");
    const [editP2, setEditP2] = useState<string>("");
    const [editSpouse, setEditSpouse] = useState<string>("");
    const [waiverSelections, setWaiverSelections] = useState<Set<number>>(new Set());

    const refPerson = people.find(p => p.id === refId);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && editId) {
                const p = people.find(x => x.id === editId);
                if (p) {
                    setName(p.name);
                    if (p.deathDate) {
                        setIsDead(true);
                        const d = new Date(p.deathDate);
                        setDeathY((d.getFullYear() - 1911).toString());
                        setDeathM((d.getMonth() + 1).toString());
                        setDeathD(d.getDate().toString());
                        setDeathGreg(p.deathDate.split('T')[0]);
                    } else {
                        setIsDead(false);
                        setDeathY(""); setDeathM(""); setDeathD(""); setDeathGreg("");
                    }

                    if (p.spouseId && p.divorceDate) {
                        setIsDivorced(true);
                        const d = new Date(p.divorceDate);
                        setDivY((d.getFullYear() - 1911).toString());
                        setDivM((d.getMonth() + 1).toString());
                        setDivD(d.getDate().toString());
                        setDivGreg(p.divorceDate.split('T')[0]);
                    } else {
                        setIsDivorced(false);
                        setDivY(""); setDivM(""); setDivD(""); setDivGreg("");
                    }

                    setEditP1(p.parents[0]?.toString() || "");
                    setEditP2(p.parents[1]?.toString() || "");
                    setEditSpouse(p.spouseId?.toString() || "");

                    const initialWaivers = new Set<number>();
                    waiverTargets.forEach(w => {
                        if (w.isWaived) initialWaivers.add(w.id);
                    });
                    setWaiverSelections(initialWaivers);
                }
            } else {
                setName("");
                setIsDead(false);
                setDeathY(""); setDeathM(""); setDeathD(""); setDeathGreg("");
                setIsDivorced(false);
                setParentSource(refPerson && refPerson.spouseId ? 'current' : 'none');
                setNewParentName("");
                setWaiverSelections(new Set());
            }
        }
    }, [isOpen, mode, editId, people, refId, waiverTargets]);

    if (!isOpen) return null;

    const getDate = (isCheck: boolean, type: string, y: string, m: string, d: string, greg: string) => {
        if (!isCheck) return null;
        if (type === 'greg' && greg) return new Date(greg);
        if (y && m && d) return new Date(parseInt(y) + 1911, parseInt(m) - 1, parseInt(d));
        return null;
    };

    const handleSave = () => {
        const dDate = getDate(isDead, deathDateType, deathY, deathM, deathD, deathGreg);
        const dvDate = getDate(isDivorced, divDateType, divY, divM, divD, divGreg);

        onSave({
            name,
            deathDate: dDate ? dDate.toISOString() : null,
            divorceDate: dvDate ? dvDate.toISOString() : null,
            parentSource,
            newParentName,
            editP1: editP1 ? parseInt(editP1) : null,
            editP2: editP2 ? parseInt(editP2) : null,
            editSpouse: editSpouse ? parseInt(editSpouse) : null,
            waivers: Array.from(waiverSelections)
        });
    };

    const DateInput = ({ prefix, y, setY, m, setM, d, setD, greg, setGreg, type, setType }: any) => (
        <div className="mt-3 p-4 bg-white rounded-xl">
            <div className="flex gap-4 mb-3 text-sm text-morandi-brown font-bold">
                <label className="flex items-center cursor-pointer"><input type="radio" name={prefix + "type"} checked={type === 'roc'} onChange={() => setType('roc')} className="mr-2 accent-morandi-brown" /> 民國</label>
                <label className="flex items-center cursor-pointer"><input type="radio" name={prefix + "type"} checked={type === 'greg'} onChange={() => setType('greg')} className="mr-2 accent-morandi-brown" /> 西元</label>
            </div>
            {type === 'roc' ? (
                <div className="flex items-center gap-2 text-morandi-brown-dark font-bold">
                    民國 <input type="number" value={y} onChange={e => setY(e.target.value)} className="w-16 p-2 text-center bg-morandi-oat rounded-lg outline-none" placeholder="年" /> 年
                    <input type="number" value={m} onChange={e => setM(e.target.value)} className="w-12 p-2 text-center bg-morandi-oat rounded-lg outline-none" placeholder="月" /> 月
                    <input type="number" value={d} onChange={e => setD(e.target.value)} className="w-12 p-2 text-center bg-morandi-oat rounded-lg outline-none" placeholder="日" /> 日
                </div>
            ) : (
                <input type="date" value={greg} onChange={e => setGreg(e.target.value)} className="w-full p-2 bg-morandi-oat rounded-lg outline-none font-bold text-morandi-brown-dark" />
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-morandi-brown-dark/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-[#fcfbf9] rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-morandi-oat">
                    <h3 className="text-[20px] font-black text-morandi-brown-dark tracking-tight">
                        {mode === 'manual' && '新增第一代成員'}
                        {mode === 'child' && `為 [${refPerson?.name}] 新增子女`}
                        {mode === 'spouse' && `為 [${refPerson?.name}] 新增配偶`}
                        {mode === 'parent' && `為 [${refPerson?.name}] 新增父母`}
                        {mode === 'edit' && '編輯成員資料'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-morandi-oat text-morandi-brown transition-colors"><CloseIcon /></button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <label className="block text-[14px] font-black text-morandi-brown-light mb-2 uppercase tracking-widest">姓名</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-white rounded-xl text-[16px] font-black text-morandi-brown-dark outline-none shadow-sm focus:shadow-md transition-shadow" placeholder="請輸入姓名" />
                    </div>

                    <div className="p-4 bg-morandi-oat/50 rounded-2xl">
                        <label className="flex items-center gap-3 font-black text-[16px] text-morandi-brown-dark cursor-pointer">
                            <input type="checkbox" checked={isDead} onChange={e => setIsDead(e.target.checked)} className="w-5 h-5 accent-morandi-brown rounded" />
                            <span>此人已過世</span>
                        </label>
                        {isDead && <DateInput prefix="d" y={deathY} setY={setDeathY} m={deathM} setM={setDeathM} d={deathD} setD={setDeathD} greg={deathGreg} setGreg={setDeathGreg} type={deathDateType} setType={setDeathDateType} />}
                    </div>

                    {(mode === 'edit' && refPerson?.spouseId || mode === 'spouse') && (
                        <div className="p-4 bg-morandi-rose-light/30 rounded-2xl">
                            <label className="flex items-center gap-3 font-black text-[16px] text-morandi-rose-dark cursor-pointer">
                                <input type="checkbox" checked={isDivorced} onChange={e => setIsDivorced(e.target.checked)} className="w-5 h-5 accent-morandi-rose rounded" />
                                <span>已離婚</span>
                            </label>
                            {isDivorced && <DateInput prefix="div" y={divY} setY={setDivY} m={divM} setM={setDivM} d={divD} setD={setDivD} greg={divGreg} setGreg={setDivGreg} type={divDateType} setType={setDivDateType} />}
                        </div>
                    )}

                    {mode === 'child' && (
                        <div className="p-5 bg-white rounded-2xl shadow-sm">
                            <label className="block text-[14px] font-black text-morandi-brown mb-3 uppercase tracking-widest">另一位家長是？</label>
                            <div className="space-y-3">
                                {refPerson?.spouseId && (
                                    <label className="flex items-center gap-3 text-[16px] font-black text-morandi-brown-dark cursor-pointer">
                                        <input type="radio" name="pSource" value="current" checked={parentSource === 'current'} onChange={e => setParentSource(e.target.value)} className="accent-morandi-brown w-5 h-5" />
                                        目前配偶 ({people.find(p => p.id === refPerson.spouseId)?.name})
                                    </label>
                                )}
                                <label className="flex items-center gap-3 text-[16px] font-black text-morandi-brown-dark cursor-pointer">
                                    <input type="radio" name="pSource" value="new" checked={parentSource === 'new'} onChange={e => setParentSource(e.target.value)} className="accent-morandi-brown w-5 h-5" />
                                    新增前任配偶 (快速建立)
                                </label>
                                {parentSource === 'new' && (
                                    <input type="text" placeholder="輸入前任配偶姓名" value={newParentName} onChange={e => setNewParentName(e.target.value)} className="ml-8 mt-1 p-3 w-48 text-[16px] bg-morandi-oat rounded-lg outline-none font-black" />
                                )}
                                <label className="flex items-center gap-3 text-[16px] font-black text-morandi-brown-dark cursor-pointer">
                                    <input type="radio" name="pSource" value="none" checked={parentSource === 'none'} onChange={e => setParentSource(e.target.value)} className="accent-morandi-brown w-5 h-5" />
                                    單親 / 不詳
                                </label>
                            </div>
                        </div>
                    )}

                    {mode === 'edit' && (
                        <div className="mt-8 pt-6 border-t border-morandi-oat">
                            <h4 className="text-[14px] font-black text-morandi-brown-light mb-4 uppercase tracking-widest">進階設定</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[14px] text-morandi-brown mb-1 block font-black">家長 1</label>
                                    <select className="w-full p-3 text-[14px] rounded-xl bg-white shadow-sm outline-none font-black text-morandi-brown-dark appearance-none" value={editP1} onChange={e => setEditP1(e.target.value)}>
                                        <option value="">(無)</option>
                                        {people.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[14px] text-morandi-brown mb-1 block font-black">家長 2</label>
                                    <select className="w-full p-3 text-[14px] rounded-xl bg-white shadow-sm outline-none font-black text-morandi-brown-dark appearance-none" value={editP2} onChange={e => setEditP2(e.target.value)}>
                                        <option value="">(無)</option>
                                        {people.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {waiverTargets.length > 0 && (
                                <div className="mt-6 p-4 bg-morandi-rose-light/50 rounded-2xl">
                                    <h5 className="text-[14px] font-black text-morandi-rose-dark mb-3 uppercase tracking-widest">拋棄繼承權</h5>
                                    <div className="space-y-2">
                                        {waiverTargets.map(t => (
                                            <label key={t.id} className="flex items-center gap-3 text-[16px] font-black text-morandi-brown-dark cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={waiverSelections.has(t.id)}
                                                    onChange={e => {
                                                        const newSet = new Set(waiverSelections);
                                                        if (e.target.checked) newSet.add(t.id); else newSet.delete(t.id);
                                                        setWaiverSelections(newSet);
                                                    }}
                                                    className="accent-morandi-rose w-5 h-5 rounded"
                                                />
                                                拋棄對 [{t.name}] 的繼承權
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white flex justify-end gap-4 border-t border-morandi-oat">
                    <button onClick={onClose} className="px-6 py-3 text-[16px] text-morandi-brown font-black hover:bg-morandi-oat rounded-xl transition-colors">取消</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-morandi-brown hover:bg-morandi-brown-dark text-white rounded-xl shadow-lg shadow-morandi-brown/20 transition-colors font-black">儲存設定</button>
                </div>
            </div>
        </div>
    );
};

export default PersonModal;