import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './index.css';
import FamilyTree from './components/FamilyTree';
import PersonModal from './components/PersonModal';
import ResultSection from './components/ResultSection';
import LegalReference from './components/LegalReference';
import { Person, WaiverRule, ModalMode } from './types';
import { performCalculation, Fraction } from './services/logic';

// --- 高質感細線條圖示 (Stroke 1.5px) ---
const Icons = {
    Folder: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" /></svg>,
    Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Refresh: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>,
    Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Print: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Tree: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><polyline points="10 7 12 7 12 18 14 18" /></svg>,
    ArrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
    Maximize: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>,
    Minimize: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
};

const App: React.FC = () => {
    // --- 狀態管理 ---
    const [people, setPeople] = useState<Person[]>([]);
    const [waiverRules, setWaiverRules] = useState<WaiverRule[]>([]);
    const [nextId, setNextId] = useState(1);
    const [rootId, setRootId] = useState<number | null>(null);

    // 家族樹展開狀態 (Lifted State)
    const [treeCollapsed, setTreeCollapsed] = useState<Set<number>>(new Set());

    // 彈窗狀態
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('manual');
    const [activeRefId, setActiveRefId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);

    // --- 資料持久化 ---
    useEffect(() => {
        const cached = localStorage.getItem('inheritanceData_v2');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                const hydratedPeople = (data.people || []).map((p: any) => ({
                    ...p,
                    share: new Fraction(0),
                    shareTxt: "0",
                    incomeLog: [],
                    parents: p.parents || []
                }));
                setPeople(hydratedPeople);
                setWaiverRules(data.waiverRules || []);
                setNextId(data.nextId || 1);
                if (data.rootId) setRootId(data.rootId);
            } catch (e) {
                console.error("Cache load error", e);
            }
        }
    }, []);

    const getPersistentData = () => ({
        people: people.map(({ share, incomeLog, ...p }) => p),
        waiverRules,
        nextId,
        rootId
    });

    useEffect(() => {
        localStorage.setItem('inheritanceData_v2', JSON.stringify(getPersistentData()));
    }, [people, waiverRules, nextId, rootId]);

    // --- 操作邏輯 ---
    const handleOpenAdd = (mode: ModalMode, refId: number | null = null) => {
        setModalMode(mode);
        setActiveRefId(refId);
        setEditId(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (id: number) => {
        setModalMode('edit');
        setActiveRefId(null);
        setEditId(id);
        setModalOpen(true);
    };

    const handleSavePerson = (data: any) => {
        const { name, deathDate, divorceDate, parentSource, newParentName, editP1, editP2, editSpouse, waivers } = data;

        if (modalMode === 'edit' && editId) {
            setPeople(prev => {
                const next = [...prev];
                const idx = next.findIndex(p => p.id === editId);
                if (idx !== -1) {
                    const p = { ...next[idx] };
                    p.name = name;
                    p.deathDate = deathDate;
                    p.divorceDate = divorceDate;

                    p.parents = [];
                    if (editP1) p.parents.push(editP1);
                    if (editP2) p.parents.push(editP2);

                    if (p.spouseId !== editSpouse) {
                        if (p.spouseId) {
                            const oldSpouse = next.find(s => s.id === p.spouseId);
                            if (oldSpouse) { oldSpouse.spouseId = null; oldSpouse.divorceDate = null; }
                        }
                        if (editSpouse) {
                            const newS = next.find(s => s.id === editSpouse);
                            if (newS) {
                                if (newS.spouseId) {
                                    const ex = next.find(x => x.id === newS.spouseId);
                                    if (ex) ex.spouseId = null;
                                }
                                newS.spouseId = p.id;
                            }
                        }
                        p.spouseId = editSpouse;
                    }
                    if (p.spouseId && p.divorceDate) {
                        const s = next.find(x => x.id === p.spouseId);
                        if (s) s.divorceDate = p.divorceDate;
                    }

                    next[idx] = p;
                }
                return next;
            });

            setWaiverRules(prev => {
                const filtered = prev.filter(r => r.whoId !== editId);
                const newRules = waivers.map((tid: number) => ({ whoId: editId, targetId: tid }));
                return [...filtered, ...newRules];
            });

        } else {
            const newId = nextId;
            let newPerson: Person = {
                id: newId, name, parents: [], spouseId: null, deathDate, divorceDate,
                share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: []
            };

            if (modalMode === 'manual') {
            } else if (modalMode === 'child' && activeRefId) {
                const parents = [activeRefId];
                if (parentSource === 'current') {
                    const p = people.find(x => x.id === activeRefId);
                    if (p && p.spouseId) parents.push(p.spouseId);
                } else if (parentSource === 'new') {
                    const exId = nextId + 1;
                    const exSpouse: Person = {
                        id: exId, name: newParentName, parents: [], spouseId: null, deathDate: null, divorceDate: null,
                        share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: []
                    };
                    setPeople(prev => [...prev, exSpouse]);
                    parents.push(exId);
                    setNextId(n => n + 2);
                    newPerson.parents = parents;
                    setPeople(prev => [...prev, newPerson]);
                    setModalOpen(false);
                    return;
                }
                newPerson.parents = parents;
            } else if (modalMode === 'spouse' && activeRefId) {
                newPerson.spouseId = activeRefId;
                setPeople(prev => prev.map(p => p.id === activeRefId ? { ...p, spouseId: newId } : p));
            } else if (modalMode === 'parent' && activeRefId) {
                const child = people.find(p => p.id === activeRefId);
                if (child) {
                    if (child.parents.length === 1) {
                        const existingP = people.find(p => p.id === child.parents[0]);
                        if (existingP && !existingP.spouseId) {
                            existingP.spouseId = newId;
                            newPerson.spouseId = existingP.id;
                            setPeople(prev => prev.map(p => p.id === existingP.id ? { ...p, spouseId: newId } : p));
                        }
                    }
                    setPeople(prev => prev.map(p => p.id === activeRefId ? { ...p, parents: [...p.parents, newId] } : p));
                }
            }

            setPeople(prev => [...prev, newPerson]);
            setNextId(n => n + 1);
        }
        setModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (!window.confirm("確定刪除此成員？")) return;
        setPeople(prev => {
            const filtered = prev.filter(p => p.id !== id);
            return filtered.map(p => ({
                ...p,
                parents: p.parents.filter(pid => pid !== id),
                spouseId: p.spouseId === id ? null : p.spouseId
            }));
        });
        setWaiverRules(prev => prev.filter(r => r.whoId !== id && r.targetId !== id));
        if (rootId === id) setRootId(null);
    };

    const handleReset = () => {
        if (window.confirm("確定清空所有資料？此動作無法復原。")) {
            setPeople([]);
            setWaiverRules([]);
            setNextId(1);
            setRootId(null);
            localStorage.removeItem('inheritanceData_v2');
        }
    };

    const handlePrint = () => {
        if (people.length === 0) {
            alert("沒有資料可列印");
            return;
        }
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleCalculate = () => {
        if (!rootId) return alert("請選擇被繼承人");
        const root = people.find(p => p.id === rootId);
        if (!root?.deathDate) return alert("被繼承人需設定為「已歿」");

        const resultPeople = performCalculation(people, waiverRules, rootId);
        setPeople(resultPeople);
    };

    const handleLoadDemo = () => {
        if (people.length > 0 && !window.confirm("載入範例將覆蓋現有資料，是否確認？")) return;

        // 原始預設範例 (A01-A56 完整資料)
        const demoPeople: Person[] = [
            { id: 1, name: "A01", parents: [], spouseId: 2, deathDate: "1960-04-21T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 2, name: "A02", parents: [], spouseId: 1, deathDate: "1962-04-26T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 3, name: "A03", parents: [1, 2], spouseId: 4, deathDate: "1960-12-17T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 4, name: "A04", parents: [], spouseId: 3, deathDate: "2001-03-18T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 5, name: "A05", parents: [3, 4], spouseId: 6, deathDate: "1997-04-17T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 6, name: "A06", parents: [], spouseId: 5, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 7, name: "A07", parents: [5, 6], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 8, name: "A08", parents: [5, 6], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 9, name: "A09", parents: [5, 6], spouseId: null, deathDate: "2022-05-26T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 10, name: "A10", parents: [3, 4], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 11, name: "A11", parents: [3, 4], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 12, name: "A12", parents: [3, 4], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 13, name: "A13", parents: [3, 4], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 14, name: "A14", parents: [3, 4], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 15, name: "A15", parents: [3, 4], spouseId: 16, deathDate: "2011-12-27T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 16, name: "A16", parents: [], spouseId: 15, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 17, name: "A17", parents: [15, 16], spouseId: 20, deathDate: "2017-07-30T00:00:00.000Z", divorceDate: "2001-06-20T16:00:00.000Z", share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 18, name: "A18", parents: [17, 20], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 19, name: "A19", parents: [17, 20], spouseId: null, deathDate: "2017-11-13T16:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 20, name: "A20", parents: [], spouseId: 17, deathDate: null, divorceDate: "2001-06-20T16:00:00.000Z", share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 21, name: "A21", parents: [15, 16], spouseId: 22, deathDate: "2018-06-23T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 22, name: "A22", parents: [], spouseId: 21, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 23, name: "A23", parents: [21, 22], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 24, name: "A24", parents: [21, 22], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 25, name: "A25", parents: [3, 4], spouseId: 26, deathDate: "2017-04-30T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 26, name: "A26", parents: [], spouseId: 25, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 27, name: "A27", parents: [25, 26], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 28, name: "A28", parents: [25, 26], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 29, name: "A29", parents: [1, 2], spouseId: null, deathDate: "2022-09-25T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 30, name: "A30", parents: [29], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 31, name: "A31", parents: [1, 2], spouseId: null, deathDate: "2015-10-23T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 32, name: "A32", parents: [31], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 33, name: "A33", parents: [31], spouseId: 37, deathDate: "2024-08-14T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 34, name: "A34", parents: [33], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 35, name: "A35", parents: [33], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 36, name: "A36", parents: [33], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 37, name: "A37", parents: [], spouseId: 33, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 38, name: "A38", parents: [1, 2], spouseId: null, deathDate: "1990-05-09T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 39, name: "A39", parents: [38], spouseId: 40, deathDate: "2009-01-28T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 40, name: "A40", parents: [], spouseId: 39, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 41, name: "A41", parents: [39, 40], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 42, name: "A42", parents: [39, 40], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 44, name: "A44", parents: [39, 40], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 45, name: "A45", parents: [38], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 47, name: "A47", parents: [38], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 48, name: "A48", parents: [38], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 49, name: "A49", parents: [38], spouseId: null, deathDate: "2016-10-01T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 50, name: "A50", parents: [1, 2], spouseId: null, deathDate: "2023-12-25T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 51, name: "A51", parents: [50], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 52, name: "A52", parents: [50], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 54, name: "A54", parents: [50], spouseId: null, deathDate: "2014-05-04T00:00:00.000Z", divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 55, name: "A55", parents: [54], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] },
            { id: 56, name: "A56", parents: [54], spouseId: null, deathDate: null, divorceDate: null, share: { n: 0n, d: 1n }, shareTxt: "0", incomeLog: [] }
        ];

        setPeople(demoPeople);
        setWaiverRules([]);
        setNextId(57);
        setRootId(1);
    };

    const handleExport = () => {
        const heirsWithShare = people.filter(p => !new Fraction(p.share.n, p.share.d).isZero());
        if (heirsWithShare.length === 0) return alert("請先計算或無結果");

        const getDeepFormula = (logs: any[]): string => {
            if (!logs || logs.length === 0) return "1";
            return logs.map(log => {
                const prev = getDeepFormula(log.prevLogs || []);
                // 如果比率字串包含空格，用小括號包起來確保運算優先順序清楚
                return `(${prev} ${log.ratioStr})`;
            }).join(" + ");
        };

        const rows = heirsWithShare.map((p, idx) => {
            const fullFormula = getDeepFormula(p.incomeLog);
            return {
                "編號": `#${idx + 1}`,
                "繼承人": p.name,
                "最終應繼分": p.shareTxt,
                "完整計算過程": fullFormula,
                "來源說明": p.incomeLog.map(l => `${l.from}(${l.reason})`).join("; ")
            };
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "分配結果");
        XLSX.writeFile(wb, "繼承分配結果.xlsx");
    };

    const getEditWaiverTargets = () => {
        if (!editId) return [];
        const p = people.find(x => x.id === editId);
        if (!p) return [];
        const targets: any[] = [];
        p.parents.forEach(pid => { const pa = people.find(x => x.id === pid); if (pa) targets.push(pa); });
        if (p.spouseId) { const s = people.find(x => x.id === p.spouseId); if (s) targets.push(s); }
        return targets.map(t => ({
            id: t.id,
            name: t.name,
            isWaived: waiverRules.some(r => r.whoId === editId && r.targetId === t.id)
        }));
    };

    // 家族樹操作
    const toggleNode = (id: number) => {
        const next = new Set(treeCollapsed);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setTreeCollapsed(next);
    };

    const handleExpandAll = () => {
        setTreeCollapsed(new Set());
    };

    const handleCollapseAll = () => {
        const allIds = people.map(p => p.id);
        setTreeCollapsed(new Set(allIds));
    };

    return (
        <div className="min-h-screen p-4 md:p-10 font-sans selection:bg-morandi-rose-light selection:text-morandi-brown-dark">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* 1. 頂部導航欄 (懸浮膠囊風格) */}
                <header className="bg-white rounded-[2rem] shadow-float px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-morandi-rose text-white rounded-2xl flex items-center justify-center shadow-lg shadow-morandi-rose/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-morandi-brown-dark tracking-wide">民法遺產繼承計算機</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLoadDemo}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-morandi-sage hover:bg-morandi-sage/10 transition-colors rounded-xl"
                        >
                            <Icons.Tree />
                            <span>載入預設範例</span>
                        </button>
                        <label className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-morandi-brown hover:text-morandi-brown-dark hover:bg-morandi-oat cursor-pointer transition-colors rounded-xl">
                            <Icons.Folder />
                            <span>讀取檔案</span>
                            <input type="file" accept=".json" className="hidden" onChange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        try {
                                            const d = JSON.parse(ev.target?.result as string);
                                            const hydratedPeople = (d.people || []).map((p: any) => ({
                                                ...p, share: new Fraction(0), shareTxt: "0", incomeLog: [], parents: p.parents || []
                                            }));
                                            setPeople(hydratedPeople); setWaiverRules(d.waiverRules || []); setNextId(d.nextId || 1);
                                        } catch (err) { alert("無法讀取此檔案"); }
                                    };
                                    reader.readAsText(file);
                                }
                                (e.target as HTMLInputElement).value = ''; // 修正：允許重複匯入同一個檔案
                            }} />
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                const blob = new Blob([JSON.stringify(getPersistentData(), null, 2)], { type: "application/json" });
                                const a = document.createElement("a");
                                a.href = URL.createObjectURL(blob);
                                a.download = "inheritance_backup.json";
                                a.click();
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-morandi-brown hover:text-morandi-brown-dark hover:bg-morandi-oat transition-colors rounded-xl"
                        >
                            <Icons.Save />
                            <span>儲存進度</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-morandi-rose-dark hover:bg-morandi-rose-light/50 transition-colors rounded-xl ml-2"
                        >
                            <Icons.Refresh />
                            <span>全部重置</span>
                        </button>
                    </div>
                </header>

                {/* 2. 主要工作區：家族樹 */}
                <section className="bg-white rounded-[2.5rem] shadow-float p-8 md:p-10 min-h-[400px] no-print">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-morandi-oat gap-4">
                        <h2 className="text-[20px] font-black text-morandi-brown-dark flex items-center gap-3 tracking-tight">
                            <span className="text-morandi-sage"><Icons.Tree /></span>
                            家族成員結構
                        </h2>

                        <div className="flex items-center gap-3">
                            {people.length > 0 && (
                                <div className="flex items-center gap-1 mr-4 bg-morandi-oat/50 rounded-lg p-1">
                                    <button
                                        onClick={handleExpandAll}
                                        className="p-2 text-morandi-brown hover:text-morandi-brown-dark hover:bg-white rounded-md transition-all text-xs font-bold flex items-center gap-1"
                                        title="全部展開"
                                    >
                                        <Icons.Maximize />
                                        <span className="hidden sm:inline">全部展開</span>
                                    </button>
                                    <div className="w-px h-4 bg-morandi-brown/10"></div>
                                    <button
                                        onClick={handleCollapseAll}
                                        className="p-2 text-morandi-brown hover:text-morandi-brown-dark hover:bg-white rounded-md transition-all text-xs font-bold flex items-center gap-1"
                                        title="全部收合"
                                    >
                                        <Icons.Minimize />
                                        <span className="hidden sm:inline">全部收合</span>
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => handleOpenAdd('manual')}
                                className="flex items-center gap-2 bg-morandi-brown hover:bg-morandi-brown-dark text-white px-6 py-3 rounded-full text-[16px] font-black shadow-lg shadow-morandi-brown/20 transition-all transform active:scale-95 no-print"
                            >
                                <Icons.Plus />
                                新增第一代成員
                            </button>
                        </div>
                    </div>

                    <FamilyTree
                        people={people}
                        collapsed={treeCollapsed}
                        toggleNode={toggleNode}
                        onEdit={handleOpenEdit}
                        onAddChild={(id) => handleOpenAdd('child', id)}
                        onAddSpouse={(id) => handleOpenAdd('spouse', id)}
                        onAddParent={(id) => handleOpenAdd('parent', id)}
                        onDelete={handleDelete}
                    />
                </section>

                {/* 3. 獨立拋棄繼承區塊 */}
                <section className="bg-white rounded-[2rem] shadow-float p-8 no-print">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-morandi-rose-light flex items-center justify-center text-morandi-rose-dark shadow-inner">
                            <Icons.Alert />
                        </div>
                        <h3 className="text-[20px] font-black text-morandi-brown-dark tracking-tight">拋棄繼承管理清單</h3>
                        <span className="text-[14px] bg-morandi-oat text-morandi-brown px-3 py-1 rounded-full font-black">{waiverRules.length} 筆紀錄</span>
                    </div>

                    {waiverRules.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl bg-morandi-oat/30 border border-dashed border-morandi-brown/20">
                            <p className="text-[16px] text-morandi-brown font-black opacity-50">目前沒有成員拋棄繼承權</p>
                            <p className="text-[14px] text-morandi-brown/40 mt-1 font-black">若需設定，請點擊成員卡片並進入編輯模式勾選</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {waiverRules.map((r, i) => {
                                const who = people.find(p => p.id === r.whoId)?.name;
                                const target = people.find(p => p.id === r.targetId)?.name;
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 bg-[#fdf2f2] rounded-2xl border border-morandi-rose/10 hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-morandi-brown-dark font-black text-[16px]">
                                                <span>{who}</span>
                                                <span className="text-[14px] text-morandi-rose-dark font-black px-2 py-0.5 bg-white/60 rounded-full">拋棄繼承</span>
                                            </div>
                                            <div className="text-[14px] text-morandi-brown opacity-60 mt-1 font-black">
                                                對象：{target}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setWaiverRules(prev => prev.filter((_, idx) => idx !== i))}
                                            className="w-8 h-8 flex items-center justify-center bg-white text-morandi-rose-dark rounded-full shadow-sm hover:bg-morandi-rose-dark hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            title="取消拋棄"
                                        >
                                            <Icons.X />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 4. 計算控制面板 */}
                <section className="bg-white rounded-[2rem] shadow-float p-8 no-print">
                    <div className="flex flex-col md:flex-row gap-8 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-morandi-brown-light mb-3 ml-2 uppercase tracking-widest">選擇被繼承人</label>
                            <div className="relative group">
                                <select
                                    className="w-full p-5 pl-6 bg-morandi-oat/30 group-hover:bg-morandi-oat/60 border border-transparent group-hover:border-morandi-oat rounded-2xl outline-none text-morandi-brown-dark font-bold text-xl cursor-pointer transition-all appearance-none shadow-inner-soft"
                                    value={rootId || ""}
                                    onChange={(e) => setRootId(parseInt(e.target.value))}
                                >
                                    <option value="">-- 請下拉選擇過世者 --</option>
                                    {/* 篩選：只列出已過世 (deathDate 存在) 的人 */}
                                    {people
                                        .filter(p => p.deathDate)
                                        .map(p => <option key={p.id} value={p.id}>{p.name} (已歿)</option>)
                                    }
                                </select>
                                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none text-morandi-brown opacity-40">
                                    <Icons.ArrowRight />
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCalculate}
                            className="w-full md:w-auto px-12 py-5 bg-morandi-rose hover:bg-morandi-rose-dark text-white font-bold rounded-2xl shadow-lg shadow-morandi-rose/30 transition-all transform hover:-translate-y-1 active:scale-95 text-lg flex items-center justify-center gap-3"
                        >
                            <span>開始計算分配</span>
                            <Icons.ArrowRight />
                        </button>
                    </div>

                    {/* 匯出選項 */}
                    <div className="mt-8 pt-8 border-t border-morandi-oat/50 flex gap-4">
                        <button
                            type="button"
                            onClick={handleExport}
                            className="flex-1 text-morandi-brown hover:bg-morandi-oat hover:text-morandi-brown-dark py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 text-sm border border-transparent hover:border-morandi-oat/50"
                        >
                            <Icons.Download />
                            匯出 Excel 報表
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex-1 text-morandi-brown hover:bg-morandi-oat hover:text-morandi-brown-dark py-4 rounded-2xl font-black transition-all flex justify-center items-center gap-2 text-[16px] border border-transparent hover:border-morandi-oat/50"
                        >
                            <Icons.Print />
                            列印 / 另存 PDF
                        </button>
                    </div>
                </section>

                {/* 列印專用標題 (僅在 PDF 列印時顯示) */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-morandi-brown pb-6">
                    <h1 className="text-3xl font-black text-morandi-brown-dark">遺產繼承分配計算報告</h1>
                    <p className="text-morandi-brown mt-2 font-bold">被繼承人：{people.find(p => p.id === rootId)?.name || '未選擇'}</p>
                    <p className="text-xs text-morandi-brown/50 mt-4">產生日期：{new Date().toLocaleDateString('zh-TW')} {new Date().toLocaleTimeString('zh-TW')}</p>
                </div>

                {/* 5. 結果顯示區 */}
                <ResultSection people={people} rootId={rootId} />

                {/* 6. 法律依據 */}
                <div className="no-print">
                    <LegalReference />
                </div>
            </div>

            <PersonModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSavePerson}
                mode={modalMode}
                refId={activeRefId}
                people={people}
                editId={editId}
                waiverTargets={getEditWaiverTargets()}
            />
        </div>
    );
};

export default App;